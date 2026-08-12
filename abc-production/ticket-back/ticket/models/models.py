from django.db import models
from django.db.models import F
from django_softdelete.models import SoftDeleteModel
from django.core.validators import MinValueValidator, MaxValueValidator
from simple_history.models import HistoricalRecords
from datetime import timedelta

from django.utils import timezone
from django.conf import settings
from rest_framework import serializers
from django.utils.translation import gettext_lazy as _
# =============== main app =======================
from ticket.utils import *
from ticket.models.choices import *
from ticket.models.validators import *
from users.models.models import Department
from ABCHospital.helpers import PhoneNumber
# Create your models here.


class ISSUESType(models.Model):
    # relation
    department = models.ForeignKey(
        Department, null=True, blank=True, on_delete=models.PROTECT, related_name='department_issue')
    # attibuttes
    name = models.CharField(max_length=25)
    created_at = models.DateTimeField(_('created_at'), default=timezone.now)

    def __str__(self) -> str:
        return f"{self.name} in {self.department.name}"


class Ticket(SoftDeleteModel):
    # relation
    complaint = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="ticket")
    subscribers = models.ManyToManyField(
        settings.AUTH_USER_MODEL, related_name="ticket_subscribers", blank=True)
    department = models.ForeignKey(
        Department, on_delete=models.PROTECT, related_name='ticket_department')
    issuetype = models.ForeignKey(
        ISSUESType, on_delete=models.SET_NULL, null=True, blank=True, related_name="ticket_issue")
    # The agent responsible for this ticket. Routing used to be department-wide
    # only, so no one owned a ticket and workload could not be measured.
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL,
        related_name="assigned_tickets")
    # attributes
    ticket_number = models.CharField(
        _('ticket number'), max_length=20, unique=True, null=True, blank=True,
        help_text=_("Human-friendly reference, e.g. TKT-001234."))
    subject = models.CharField(_('subject'), max_length=255, null=True, blank=True)
    # Deliberately without `choices`: the valid buildings and floors live in the
    # catalog tables that the admin screens edit, and a fixed enum here made
    # every newly added location unusable — the serializer rejected it before
    # `clean()` ever ran. `clean()` validates against the catalog instead.
    # Widened to 50 to match the catalog's slug length.
    building = models.CharField(max_length=50)
    floor = models.CharField(max_length=50)
    room = models.CharField(_('room'), max_length=50, null=True, blank=True)
    description = models.TextField()
    status = models.CharField(max_length=12, choices=TicketStatus.choices, default=TicketStatus.ON_HOLD)
    priority = models.CharField(
        _('priority'), max_length=10, choices=TicketPriority.choices,
        default=TicketPriority.NORMAL)
    extension = models.IntegerField(
        validators=[MaxValueValidator(9999), MinValueValidator(1000)])
    phone = models.CharField(max_length=15, null=True,
                             blank=True, validators=[validate_phone])
    is_external = models.BooleanField(default=False)
    note = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(_('created_at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated_at'), auto_now=True, null=True)
    closed_at = models.DateTimeField(_('closed_at'), null=True, blank=True)

    # --- SLA -------------------------------------------------------------
    # Deadline is computed from the department's sla_hours scaled by priority
    # (see PRIORITY_SLA_MULTIPLIER). The *_sent flags let the periodic checker
    # notify once per stage instead of on every run.
    sla_deadline = models.DateTimeField(_('SLA deadline'), null=True, blank=True)
    sla_warning_sent = models.BooleanField(default=False)
    sla_breach_sent = models.BooleanField(default=False)
    due_date = models.DateTimeField(_('due date'), null=True, blank=True)

    # --- Lifecycle timestamps -------------------------------------------
    first_response_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    # --- Archiving (distinct from soft delete) ---------------------------
    is_archived = models.BooleanField(default=False)
    archived_at = models.DateTimeField(null=True, blank=True)
    archived_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL,
        related_name="archived_tickets")

    # --- Requester satisfaction ------------------------------------------
    rating = models.PositiveSmallIntegerField(
        null=True, blank=True,
        validators=[MinValueValidator(1), MaxValueValidator(5)])
    feedback = models.TextField(null=True, blank=True)

    resolution_time = models.GeneratedField(
        expression=F('closed_at') - F('created_at'),
        output_field=models.DurationField(),
        db_persist=True
    )
    history = HistoricalRecords()

    class Meta:
        indexes = [
            models.Index(fields=['status', '-created_at']),
            models.Index(fields=['department', 'status']),
            models.Index(fields=['assigned_to', 'status']),
            models.Index(fields=['priority', 'status']),
            models.Index(fields=['sla_deadline']),
            models.Index(fields=['is_archived']),
        ]

    @property
    def images(self):
        return self.image_ticket.values_list('image', flat=True)
  
    def __str__(self) -> str:
        return f"{self.description}"

    def _valid_floors(self):
        """Floors allowed for this ticket's building.

        The catalog tables are the source of truth — they are what the admin
        screens edit, so a building added there has to be usable immediately.
        `BUILD` is kept as a fallback for deployments whose catalog has not
        been seeded yet, and its codes match the catalog's by construction.
        """
        from catalog.models import Floor

        codes = set(
            Floor.objects.filter(
                building__code=self.building, is_active=True
            ).values_list("code", flat=True)
        )
        return codes or set(BUILD.get(self.building, []))

    def clean(self, *args, **kwargs):

        # `BUILD[self.building]` raised KeyError — a 500 — for any building the
        # hardcoded map did not know about, including every building added
        # through the admin screens.
        if self.floor not in self._valid_floors():
            raise serializers.ValidationError(
                {"floor": _("invalid floor for this building number")})
        elif not self.department.reciever:
            raise serializers.ValidationError(
                {"department": _("invalid department option")})
        elif self.issuetype and self.status == TicketStatus.ON_HOLD:
            raise serializers.ValidationError(
                {"issuetype": _("can't end ticket for on hold status")})

        elif self.issuetype and (not self.department == self.issuetype.department):
            raise serializers.ValidationError(
                {"issuetype": _("invalid department for this issue type")})
        elif self.status == TicketStatus.COMPLETE and not self.issuetype:
            raise serializers.ValidationError(
                {"issuetype": _("issue type is required when status is complete")})

        super().clean()
# ================================== End Model Validation ==========================================

    def compute_sla_deadline(self):
        """Deadline = created_at + department SLA hours scaled by priority."""
        base_hours = getattr(self.department, 'sla_hours', None) or 24
        multiplier = PRIORITY_SLA_MULTIPLIER.get(self.priority, 1.0)
        start = self.created_at or timezone.now()
        return start + timedelta(hours=base_hours * multiplier)

    def _assign_ticket_number(self):
        """Allocate the next human-friendly reference.

        Uses the primary key, which is unique and already allocated by the time
        this runs, so concurrent creates cannot collide on it.
        """
        return f"TKT-{self.pk:06d}"

    def save(self, *args, **kwargs):
        self.clean(*args, **kwargs)
        phonenumber = PhoneNumber(self.phone, "EG")
        self.phone = phonenumber.format(raise_exception=True, allow_blank=True)

        # Stamp the moment work finished, so reporting doesn't have to infer it.
        if self.status in (TicketStatus.COMPLETE, TicketStatus.CLOSED) and not self.completed_at:
            self.completed_at = timezone.now()

        creating = self._state.adding
        super().save()

        # These two need the row to exist first (PK for the number, created_at
        # for the deadline), so they are a follow-up write on creation only.
        post_fields = []
        if not self.ticket_number:
            self.ticket_number = self._assign_ticket_number()
            post_fields.append('ticket_number')
        if creating and not self.sla_deadline:
            self.sla_deadline = self.compute_sla_deadline()
            post_fields.append('sla_deadline')
        if post_fields:
            super().save(update_fields=post_fields)


class TicketTransfer(models.Model):
    """Audit record of a ticket moving between departments.

    Added because the transfer endpoint used to move a ticket by mutating
    `Ticket.department` in place and — on one branch — DELETING the ticket's
    history rows and every comment on it. That destroyed the record of who did
    what, irreversibly. Transfers are now recorded here instead.
    """
    ticket = models.ForeignKey(
        Ticket, on_delete=models.CASCADE, related_name='transfers')
    from_department = models.ForeignKey(
        Department, null=True, blank=True, on_delete=models.SET_NULL,
        related_name='transfers_out')
    to_department = models.ForeignKey(
        Department, on_delete=models.PROTECT, related_name='transfers_in')
    transferred_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True,
        on_delete=models.SET_NULL, related_name='ticket_transfers')
    # The old API called this `option`: False meant "the receiving department
    # starts fresh". It now only records intent — clients may collapse earlier
    # correspondence, but nothing is deleted.
    fresh_start = models.BooleanField(default=False)
    reason = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(_('created_at'), default=timezone.now)

    class Meta:
        ordering = ['-created_at']
        indexes = [models.Index(fields=['ticket', '-created_at'])]

    def __str__(self) -> str:
        return f"Ticket {self.ticket_id}: {self.from_department} -> {self.to_department}"


class TicketMedia(models.Model):
    # relation
    ticket = models.ForeignKey(
        Ticket, on_delete=models.CASCADE, related_name='image_ticket')
    # attrs
    image = models.ImageField(
        upload_to="tickets/tickets-attachments/%Y/%m/%d", null=True, blank=True)
    created_at = models.DateTimeField('date created', default=timezone.now)

    def __str__(self) -> str:
        return f"Image for Ticket: {self.ticket.id}"


class CommentKind(models.TextChoices):
    """What a chat message actually carries.

    Kept alongside the file itself so clients can pick a renderer without
    sniffing extensions: a voice note and a dropped .ogg are both audio, but
    only the first has a waveform and a duration.
    """
    TEXT = 'text', _('text')
    IMAGE = 'image', _('image')
    AUDIO = 'audio', _('audio')
    FILE = 'file', _('file')


class TicketComment(models.Model):
    # relation
    ticket = models.ForeignKey(
        Ticket, on_delete=models.CASCADE, related_name='ticket_comment')
    commenter = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='ticket_commenter')
    # Quoting an earlier message. SET_NULL rather than CASCADE so deleting the
    # quoted message does not silently take the replies with it.
    reply_to = models.ForeignKey(
        'self', null=True, blank=True, on_delete=models.SET_NULL,
        related_name='replies')
    # attributes
    # Blank is allowed now: a photo or a voice note is a complete message on
    # its own. `clean()` below still rejects a message that carries neither.
    comment = models.TextField(blank=True, default='')
    kind = models.CharField(
        max_length=10, choices=CommentKind.choices, default=CommentKind.TEXT)
    attachment = models.FileField(
        upload_to="tickets/chat/%Y/%m/%d", null=True, blank=True)
    # Browsers hand back "blob" for a recording and the picker mangles long
    # names, so the original name is stored rather than derived from the path.
    attachment_name = models.CharField(max_length=255, blank=True, default='')
    attachment_size = models.PositiveIntegerField(null=True, blank=True)
    # Seconds. Only meaningful for AUDIO — lets the player draw a duration
    # before the file has downloaded.
    duration = models.PositiveIntegerField(null=True, blank=True)
    edited_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField('date created', default=timezone.now)

    class Meta:
        ordering = ['-id']
        indexes = [models.Index(fields=['ticket', '-id'])]
# ================================= Model Validation ==================================================

    def clean(self, *args, **kwargs):

        if not (self.ticket.complaint.department == self.commenter.department or (self.commenter and self.ticket.department == self.commenter.department)):
            raise serializers.ValidationError(
                {'ticket': "can not comment on this ticket"})

        if not (self.comment or '').strip() and not self.attachment:
            raise serializers.ValidationError(
                {'comment': _("message must contain text or an attachment")})

        # A reply has to point at the same conversation, otherwise the quoted
        # message leaks across tickets (and across departments with it).
        if self.reply_to_id and self.reply_to.ticket_id != self.ticket_id:
            raise serializers.ValidationError(
                {'reply_to': _("cannot reply to a message from another ticket")})
        super().clean()
# ================================== End Model Validation ==========================================

    def save(self, *args, **kwargs):
        self.clean(*args, **kwargs)
        super().save()


class Note(models.Model):
    # relation
    department = models.ForeignKey(
        Department, on_delete=models.PROTECT, related_name='note_department')
    poster = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='note_poster')
    # attributes
    note = models.TextField()
    # Managers pin announcements so they stay at the top of the department feed.
    pinned = models.BooleanField(default=False)
    created_at = models.DateTimeField('date created', default=timezone.now)

    class Meta:
        ordering = ['-pinned', '-created_at']

    @property
    def medias(self):
        return self.media_note.values_list('media', flat=True)

# ================================= Model Validation ==================================================
    def clean(self, *args, **kwargs):

        if not (self.department == self.poster.department):
            raise serializers.ValidationError(
                {'note': "can not note in this department"})
        super().clean()

    def save(self, *args, **kwargs):
        self.clean(*args, **kwargs)
        super().save()
# ================================== End Model Validation ==========================================


class NoteMedia(models.Model):
    # relation
    note = models.ForeignKey(
        Note, on_delete=models.CASCADE, related_name='media_note')
    # attributes
    media = models.FileField(upload_to="notes/%Y/%m/%d", null=True, blank=True)
    created_at = models.DateTimeField('date created', default=timezone.now)


class NoteReaction(models.Model):
    """One like per user per note. Unlike is a delete, so no state to reconcile."""
    note = models.ForeignKey(
        Note, on_delete=models.CASCADE, related_name='reactions')
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='note_reactions')
    created_at = models.DateTimeField('date created', default=timezone.now)

    class Meta:
        unique_together = [('note', 'user')]
        indexes = [models.Index(fields=['note'])]

    def __str__(self) -> str:
        return f"{self.user} 👍 note#{self.note_id}"


class NoteComment(models.Model):
    # relations
    note = models.ForeignKey(
        Note, on_delete=models.CASCADE, related_name='comment_note')
    commenter = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='note_commenter')
    # attributes
    comment = models.TextField()
    created_at = models.DateTimeField('date created', default=timezone.now)
# ================================= Model Validation ==================================================

    def clean(self, *args, **kwargs):
        if not self.note.department == self.commenter.department:
            raise serializers.ValidationError(
                {'department': "not in your department"})
        super().clean()
# ================================== End Model Validation ==========================================

    def save(self, *args, **kwargs):
        self.clean(*args, **kwargs)
        super().save()


class ImportExportFile(models.Model):
    # relation
    department = models.ForeignKey(
        Department, on_delete=models.CASCADE, related_name='files_in_department')
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='users_for_files')
    # attrs
    title = models.CharField(_("title"), null=True, blank=True, max_length=200)
    files = models.FileField(
        upload_to="tickets/import-export/%Y/%m/%d", null=True, blank=True)
    url_file = models.URLField(max_length=2000, null=True, blank=True)
    is_import = models.BooleanField()
    created_at = models.DateTimeField('date created', default=timezone.now)
