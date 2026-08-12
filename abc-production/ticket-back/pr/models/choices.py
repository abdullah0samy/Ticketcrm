from django.db.models import TextChoices, IntegerChoices
from django.utils.translation import gettext_lazy as _


class QuestionType(TextChoices):
    RATE = "rate", _("Rate")
    YES_NO = "yes_no", _("YES/NO")


class SurveyType(TextChoices):
    IN_PERSON = "in_person", _("In Person")
    CALL = "call", _("Call")



class QuestionWeight(IntegerChoices):
    LOW = 1, _("Low")
    MEDIUM = 2, _("Medium")
    HIGH = 3, _("High")

    
    
class QuestionCategory(TextChoices):
    DOCTOR = "medical", _("Medical")
    NURSING = "nursing", _("Nursing")
    RESEPTIONIST = "admission_office", _("Admission Office")
    SECURITY = "security", _("Security")
    KITCHEN = "food_and_beverages", _("Food & Beverages")
    CARE = "hospitality", _("Hospitality")
    RECOMMENDATION = "recommendation", _("Recommendation")