"""Granular permissions.

Until now authorisation was hardcoded: a user's role was *derived*
(`department is None` → admin, `is_superuser` → manager, else agent) and the only
capability switch was `Department.modules`. Changing who may export or transfer
meant a code deploy, and per-user exceptions were impossible.

These two models add department defaults plus per-user overrides. The resolver in
`users/permissions_resolver.py` combines them.
"""
from django.conf import settings
from django.db import models
from django.utils.translation import gettext_lazy as _

# Every capability the system can grant. Kept in one place so the models, the
# resolver and the admin UI cannot drift apart.
PERMISSION_FLAGS = [
    "can_receive_tickets",
    "can_send_tickets",
    "can_view_all_dept_tickets",
    "can_assign_tickets",
    "can_change_status",
    "can_transfer_tickets",
    "can_archive_tickets",
    "can_export_data",
    "can_view_analytics",
    "can_manage_team_notes",
    "can_manage_dept_users",
    "can_view_audit_logs",
    "can_manage_knowledge_base",
    "can_manage_assets",
]


class DeptPermissions(models.Model):
    """Default capabilities for every member of a department."""

    can_receive_tickets = models.BooleanField(default=True)
    can_send_tickets = models.BooleanField(default=True)
    can_view_all_dept_tickets = models.BooleanField(default=True)
    can_assign_tickets = models.BooleanField(default=True)
    can_change_status = models.BooleanField(default=True)
    can_transfer_tickets = models.BooleanField(default=True)
    can_archive_tickets = models.BooleanField(default=False)
    can_export_data = models.BooleanField(default=False)
    can_view_analytics = models.BooleanField(default=False)
    can_manage_team_notes = models.BooleanField(default=True)
    can_manage_dept_users = models.BooleanField(default=False)
    can_view_audit_logs = models.BooleanField(default=False)
    can_manage_knowledge_base = models.BooleanField(default=False)
    can_manage_assets = models.BooleanField(default=False)

    class Meta:
        verbose_name = _("department permissions")
        verbose_name_plural = _("department permissions")

    def as_dict(self):
        return {flag: getattr(self, flag) for flag in PERMISSION_FLAGS}

    def __str__(self):
        granted = sum(1 for f in PERMISSION_FLAGS if getattr(self, f))
        return f"Permission set #{self.pk} ({granted}/{len(PERMISSION_FLAGS)})"


class UserPermissionOverride(models.Model):
    """Per-user exceptions.

    Every flag is nullable on purpose: NULL means "inherit the department
    default", so an override only has to state what differs.
    """

    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
                                related_name="permission_override")

    can_receive_tickets = models.BooleanField(null=True, blank=True)
    can_send_tickets = models.BooleanField(null=True, blank=True)
    can_view_all_dept_tickets = models.BooleanField(null=True, blank=True)
    can_assign_tickets = models.BooleanField(null=True, blank=True)
    can_change_status = models.BooleanField(null=True, blank=True)
    can_transfer_tickets = models.BooleanField(null=True, blank=True)
    can_archive_tickets = models.BooleanField(null=True, blank=True)
    can_export_data = models.BooleanField(null=True, blank=True)
    can_view_analytics = models.BooleanField(null=True, blank=True)
    can_manage_team_notes = models.BooleanField(null=True, blank=True)
    can_manage_dept_users = models.BooleanField(null=True, blank=True)
    can_view_audit_logs = models.BooleanField(null=True, blank=True)
    can_manage_knowledge_base = models.BooleanField(null=True, blank=True)
    can_manage_assets = models.BooleanField(null=True, blank=True)

    # Departments this user may transfer tickets to. Empty/null = no restriction.
    allowed_transfer_dept_ids = models.JSONField(null=True, blank=True, default=list)

    class Meta:
        verbose_name = _("user permission override")
        verbose_name_plural = _("user permission overrides")

    def as_dict(self):
        return {flag: getattr(self, flag) for flag in PERMISSION_FLAGS}

    def __str__(self):
        return f"Overrides for {self.user}"
