from django.db.models import TextChoices
from django.utils.translation import gettext_lazy as _



class Roles(TextChoices):
    ADMIN = "administration", _("Administration")
    MANAGER = "manager", _("Manager")
    AGENT = "agent", _("Agent")


class AllowedModules(TextChoices):
    TICKET = "ticket", _("Ticket")
    PR = "pr", _("PR")
