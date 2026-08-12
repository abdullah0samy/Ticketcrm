from django.db import models
from django.db.models import F
from django_softdelete.models import SoftDeleteModel
from django.core.validators import MinValueValidator, MaxValueValidator
from simple_history.models import HistoricalRecords
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
    # attributes
    building = models.CharField(max_length=10, choices=Buildings.choices)
    floor = models.CharField(max_length=20, choices=Floors.choices)
    description = models.TextField()
    status = models.CharField(max_length=12, choices=TicketStatus.choices, default=TicketStatus.ON_HOLD)
    extension = models.IntegerField(
        validators=[MaxValueValidator(9999), MinValueValidator(1000)])
    phone = models.CharField(max_length=15, null=True,
                             blank=True, validators=[validate_phone])
    is_external = models.BooleanField(default=False)
    note = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(_('created_at'), default=timezone.now)
    closed_at = models.DateTimeField(_('closed_at'), null=True, blank=True)
    resolution_time = models.GeneratedField(
        expression=F('closed_at') - F('created_at'), 
        output_field=models.DurationField(),
        db_persist=True
    )
    history = HistoricalRecords()

    @property
    def images(self):
        return self.image_ticket.values_list('image', flat=True)
  
    def __str__(self) -> str:
        return f"{self.description}"

    def clean(self, *args, **kwargs):

        if self.floor not in BUILD[self.building]:
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

    def save(self, *args, **kwargs):
        self.clean(*args, **kwargs)
        phonenumber = PhoneNumber(self.phone, "EG")
        self.phone = phonenumber.format(raise_exception=True, allow_blank=True)
        super().save()


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


class TicketComment(models.Model):
    # relation
    ticket = models.ForeignKey(
        Ticket, on_delete=models.CASCADE, related_name='ticket_comment')
    commenter = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='ticket_commenter')
    # attributes
    comment = models.TextField()
    created_at = models.DateTimeField('date created', default=timezone.now)
# ================================= Model Validation ==================================================

    def clean(self, *args, **kwargs):

        if not (self.ticket.complaint == self.commenter or (self.commenter and self.ticket.department == self.commenter.department)):
            raise serializers.ValidationError(
                {'ticket': "can not comment on this ticket"})
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
    created_at = models.DateTimeField('date created', default=timezone.now)

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
