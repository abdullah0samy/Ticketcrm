
from django.db.models import TextChoices
from django.utils.translation import gettext_lazy as _


class Buildings(TextChoices):
    BUILDING_1 = "building_1", _("Building 1")
    BUILDING_2 = "building_2", _("Building 2")
    STORES = "stores", _("Stores")

class Floors(TextChoices):
    BASEMENT = "basement", _("Basement")
    GROUND = "ground", _("Ground")
    ADMIN = "admin", _("Admin")
    EL_HEGAZ = "el_hegaz", _("El-Hegaz")
    LEBANON_SQAURE = "lebanon_sqaure", _("Lebanon-Sqaure")
    FLOOR_1 = "floor_1", _("Floor 1")
    FLOOR_2 = "floor_2", _("Floor 2")
    FLOOR_3 = "floor_3", _("Floor 3")
    FLOOR_4 = "floor_4", _("Floor 4")
    FLOOR_5 = "floor_5", _("Floor 5")
    FLOOR_6 = "floor_6", _("Floor 6")
    FLOOR_7 = "floor_7", _("Floor 7")
    LABORATORY = "laboratory", _("Laboratory")
    ENDOSCOPY = "endoscopy", _("Endoscopy")
    OR = "or", _("OR")


class TicketPriority(TextChoices):
    """Urgency of the request. Drives SLA multipliers and inbox ordering."""
    LOW = "low", _("Low")
    NORMAL = "normal", _("Normal")
    HIGH = "high", _("High")
    CRITICAL = "critical", _("Critical")


# SLA hours are multiplied by these so an urgent ticket is due sooner.
PRIORITY_SLA_MULTIPLIER = {
    TicketPriority.LOW: 1.5,
    TicketPriority.NORMAL: 1.0,
    TicketPriority.HIGH: 0.5,
    TicketPriority.CRITICAL: 0.25,
}


class TicketStatus(TextChoices):
    ON_HOLD = "on_hold", _("On Hold")
    IN_PROGRESS = "in_progress", _("In Progress")
    COMPLETE = "complete", _("Complete")
    CLOSED = "closed", _("Closed")  
