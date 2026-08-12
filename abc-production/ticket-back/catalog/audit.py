"""Automatic audit trail.

Two halves that only work together:

  * `AuditContextMiddleware` stashes the current request on a thread-local, so
    the signal handlers below know *who* is acting and from where. Signals have
    no access to the request otherwise.
  * `register_audit(Model)` connects pre_save/post_save/post_delete so every
    create, update and delete on that model lands in `AuditLog` with a real
    old -> new diff.

Doing this with signals rather than in the view layer means custom actions
(transfer, assign, archive) are recorded too, without each one remembering to
log itself. Anything the ORM writes is recorded.

Failures here are swallowed: an audit trail must never be the reason a user's
save fails.
"""
import threading

from django.db.models.signals import post_delete, post_save, pre_save

_state = threading.local()

# Never echo these back into the log, whatever model they appear on.
SENSITIVE = ("password", "token", "secret", "api_key", "signature")

# Bookkeeping columns. `updated_at` in particular changes on every single save,
# so leaving it in would put a meaningless entry in every diff.
SKIP_FIELDS = ("last_login", "date_joined", "updated_at", "modified_at")

_registered = set()


# --------------------------------------------------------------------------
# request context
# --------------------------------------------------------------------------
class AuditContextMiddleware:
    """Bind the current request to this thread for the duration of the call."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        _state.request = request
        try:
            return self.get_response(request)
        finally:
            _state.request = None


def _current_request():
    return getattr(_state, "request", None)


def _actor():
    request = _current_request()
    user = getattr(request, "user", None)
    return user if (user is not None and getattr(user, "is_authenticated", False)) else None


def _client_ip(request):
    if request is None:
        return None
    forwarded = request.META.get("HTTP_X_FORWARDED_FOR")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.META.get("REMOTE_ADDR")


# --------------------------------------------------------------------------
# serialisation
# --------------------------------------------------------------------------
def _is_sensitive(name):
    lowered = name.lower()
    return any(word in lowered for word in SENSITIVE)


def _value(instance, field):
    value = getattr(instance, field.attname, None)
    if value is None:
        return None
    if isinstance(value, (str, int, float, bool)):
        return value
    return str(value)


def _snapshot(instance):
    """A JSON-safe dict of the model's concrete fields."""
    data = {}
    for field in instance._meta.concrete_fields:
        name = field.attname
        if name in SKIP_FIELDS:
            continue
        if _is_sensitive(name):
            data[name] = "***"
            continue
        try:
            data[name] = _value(instance, field)
        except Exception:      # a deferred or broken FK — not worth failing over
            continue
    return data


def _diff(old, new):
    """Only the fields that actually changed, as {field: [old, new]}."""
    changed = {}
    for key, new_value in new.items():
        old_value = old.get(key)
        if old_value != new_value:
            changed[key] = [old_value, new_value]
    return changed


# --------------------------------------------------------------------------
# writing
# --------------------------------------------------------------------------
def record(action, entity_type, entity_id=None, old_data=None, new_data=None, user=None):
    """Write one audit row. Never raises."""
    from catalog.models import AuditLog

    try:
        request = _current_request()
        AuditLog.objects.create(
            user=user or _actor(),
            action=action,
            entity_type=entity_type,
            entity_id=str(entity_id) if entity_id is not None else None,
            old_data=old_data or None,
            new_data=new_data or None,
            ip_address=_client_ip(request),
            user_agent=(request.META.get("HTTP_USER_AGENT", "")[:400] if request else None),
        )
    except Exception:
        pass


# --------------------------------------------------------------------------
# signal handlers
# --------------------------------------------------------------------------
def _pre_save(sender, instance, raw=False, **kwargs):
    if raw or not instance.pk:
        return
    try:
        previous = sender.objects.filter(pk=instance.pk).first()
        instance._audit_old = _snapshot(previous) if previous else None
    except Exception:
        instance._audit_old = None


def _post_save(sender, instance, created, raw=False, **kwargs):
    # Unattributed writes are migrations, management commands and seeds — the
    # trail is about people, so skip anything with no request behind it.
    if raw or _current_request() is None:
        return

    name = sender.__name__
    new = _snapshot(instance)

    if created:
        record(f"{name.upper()}_CREATED", name, instance.pk, new_data=new)
        return

    old = getattr(instance, "_audit_old", None)
    changed = _diff(old, new) if old else None
    if old is not None and not changed:
        return          # a save() that changed nothing is noise
    record(f"{name.upper()}_UPDATED", name, instance.pk, old_data=old, new_data=changed or new)


def _post_delete(sender, instance, **kwargs):
    if _current_request() is None:
        return
    name = sender.__name__
    record(f"{name.upper()}_DELETED", name, instance.pk, old_data=_snapshot(instance))


def register_audit(model):
    """Start auditing a model. Idempotent — apps.ready() can run twice."""
    label = f"{model._meta.app_label}.{model.__name__}"
    if label in _registered:
        return
    _registered.add(label)
    uid = f"audit:{label}"
    pre_save.connect(_pre_save, sender=model, dispatch_uid=uid + ":pre")
    post_save.connect(_post_save, sender=model, dispatch_uid=uid + ":post")
    post_delete.connect(_post_delete, sender=model, dispatch_uid=uid + ":del")


def registered_models():
    return sorted(_registered)
