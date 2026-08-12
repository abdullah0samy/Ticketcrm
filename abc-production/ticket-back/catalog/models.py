"""Reference data and cross-cutting records that the ticketing core lacked.

Buildings/Floors existed only as hardcoded `TextChoices` in `ticket/models/choices.py`,
so adding a floor meant a code deploy. Assets, the knowledge base and the audit log
had no representation at all.
"""
from django.conf import settings
from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _


class TimeStamped(models.Model):
    created_at = models.DateTimeField(_('created at'), default=timezone.now)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)

    class Meta:
        abstract = True


# ---------------------------------------------------------------- locations
class Building(TimeStamped):
    name_ar = models.CharField(_('name (Arabic)'), max_length=120)
    name_en = models.CharField(_('name (English)'), max_length=120)
    # Mirrors the legacy `Buildings` TextChoices value so existing tickets can be
    # matched up later without a risky data migration.
    code = models.SlugField(_('code'), max_length=50, unique=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['name_en']

    def __str__(self):
        return self.name_en


class Floor(TimeStamped):
    building = models.ForeignKey(Building, on_delete=models.CASCADE, related_name='floors')
    name_ar = models.CharField(_('name (Arabic)'), max_length=120)
    name_en = models.CharField(_('name (English)'), max_length=120)
    code = models.SlugField(_('code'), max_length=50)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['building__name_en', 'name_en']
        unique_together = [('building', 'code')]

    def __str__(self):
        return f"{self.name_en} — {self.building.name_en}"


# ------------------------------------------------------------------- assets
class AssetStatus(models.TextChoices):
    ACTIVE = 'active', _('Active')
    MAINTENANCE = 'maintenance', _('Under maintenance')
    RETIRED = 'retired', _('Retired')


class Asset(TimeStamped):
    """Physical or IT equipment a ticket can be raised against."""
    name = models.CharField(_('name'), max_length=200)
    serial_number = models.CharField(_('serial number'), max_length=120, unique=True,
                                     null=True, blank=True)
    asset_type = models.CharField(_('type'), max_length=100,
                                  help_text=_("e.g. Medical Device, IT Hardware, Network"))
    location = models.CharField(_('location'), max_length=200, null=True, blank=True)
    department = models.ForeignKey('users.Department', null=True, blank=True,
                                   on_delete=models.SET_NULL, related_name='assets')
    status = models.CharField(max_length=20, choices=AssetStatus.choices,
                              default=AssetStatus.ACTIVE)
    purchase_date = models.DateField(null=True, blank=True)
    warranty_expiry = models.DateField(null=True, blank=True)
    notes = models.TextField(null=True, blank=True)

    class Meta:
        ordering = ['name']
        indexes = [models.Index(fields=['status']), models.Index(fields=['department'])]

    def __str__(self):
        return f"{self.name} ({self.serial_number})" if self.serial_number else self.name


# ---------------------------------------------------------- knowledge base
class KnowledgeCategory(TimeStamped):
    name_ar = models.CharField(_('name (Arabic)'), max_length=150)
    name_en = models.CharField(_('name (English)'), max_length=150)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['name_en']
        verbose_name_plural = 'knowledge categories'

    def __str__(self):
        return self.name_en


class KnowledgeArticle(TimeStamped):
    category = models.ForeignKey(KnowledgeCategory, on_delete=models.CASCADE,
                                 related_name='articles')
    title_ar = models.CharField(max_length=255)
    title_en = models.CharField(max_length=255)
    content_ar = models.TextField()
    content_en = models.TextField()
    author = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True,
                               on_delete=models.SET_NULL, related_name='articles')
    views = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [models.Index(fields=['category', 'is_active'])]

    def __str__(self):
        return self.title_en


# ---------------------------------------------------------------- audit log
class AuditLog(models.Model):
    """Append-only trail of state-changing actions.

    Previously nothing recorded *who* changed *what* outside django-simple-history
    on the Ticket model alone.
    """
    user = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True,
                             on_delete=models.SET_NULL, related_name='audit_logs')
    action = models.CharField(max_length=100)          # e.g. TICKET_TRANSFERRED
    entity_type = models.CharField(max_length=100)     # e.g. Ticket
    entity_id = models.CharField(max_length=64, null=True, blank=True)
    old_data = models.JSONField(null=True, blank=True)
    new_data = models.JSONField(null=True, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.CharField(max_length=400, null=True, blank=True)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['-created_at']),
            models.Index(fields=['entity_type', 'entity_id']),
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['action']),
        ]

    def __str__(self):
        return f"{self.action} {self.entity_type}#{self.entity_id}"
