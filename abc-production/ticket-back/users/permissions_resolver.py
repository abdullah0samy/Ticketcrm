"""Resolve a user's effective permissions.

Precedence, highest first:
  1. Global admin (no department) — everything is granted.
  2. Per-user override, when the flag is not NULL.
  3. The department's default permission set.
  4. A role-based fallback, so users in departments that predate the permission
     tables keep working exactly as they did before.

Results are cached briefly in Redis because permissions are read on nearly every
request; the cache is invalidated whenever a permission row is saved.
"""
from django.core.cache import cache

from users.models.choices import Roles
from users.models.permissions import PERMISSION_FLAGS

CACHE_TTL = 60  # seconds — short enough that a change is felt almost immediately
CACHE_KEY = "perms:user:{user_id}"

# What each derived role could do before these tables existed.
ROLE_FALLBACK = {
    Roles.ADMIN: {flag: True for flag in PERMISSION_FLAGS},
    Roles.MANAGER: {
        **{flag: True for flag in PERMISSION_FLAGS},
        "can_view_audit_logs": False,
    },
    Roles.AGENT: {
        "can_receive_tickets": True,
        "can_send_tickets": True,
        "can_view_all_dept_tickets": True,
        "can_assign_tickets": False,
        "can_change_status": True,
        "can_transfer_tickets": False,
        "can_archive_tickets": False,
        "can_export_data": False,
        "can_view_analytics": False,
        "can_manage_team_notes": True,
        "can_manage_dept_users": False,
        "can_view_audit_logs": False,
        "can_manage_knowledge_base": False,
        "can_manage_assets": False,
    },
}


def _compute(user):
    role = user.get_role

    # A user with no department is the global admin.
    if user.department is None:
        return {flag: True for flag in PERMISSION_FLAGS}

    effective = dict(ROLE_FALLBACK.get(role, ROLE_FALLBACK[Roles.AGENT]))

    defaults = getattr(user.department, "default_permissions", None)
    if defaults is not None:
        effective.update(defaults.as_dict())

    override = getattr(user, "permission_override", None)
    if override is not None:
        for flag, value in override.as_dict().items():
            if value is not None:          # NULL means "inherit"
                effective[flag] = value

    return effective


def get_permissions(user, use_cache=True):
    """Effective permission dict for `user`."""
    if not (user and user.is_authenticated):
        return {flag: False for flag in PERMISSION_FLAGS}

    key = CACHE_KEY.format(user_id=user.pk)
    if use_cache:
        cached = cache.get(key)
        if cached is not None:
            return cached

    effective = _compute(user)
    if use_cache:
        cache.set(key, effective, CACHE_TTL)
    return effective


def has_permission(user, flag):
    return bool(get_permissions(user).get(flag, False))


def invalidate(user_id):
    """Drop a user's cached permissions after a change."""
    cache.delete(CACHE_KEY.format(user_id=user_id))


def invalidate_all():
    """Used when a department-level default changes."""
    cache.delete_pattern(CACHE_KEY.format(user_id="*")) if hasattr(cache, "delete_pattern") else cache.clear()
