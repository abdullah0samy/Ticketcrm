from django.db import models
from pr.models.choices import *
from ABCHospital.validators import validate_phone
from pr.utils import AnswerResponse
from rest_framework import serializers
from django.utils.translation import gettext_lazy as _
from django_extensions.db.models import TimeStampedModel
from ABCHospital.helpers import PhoneNumber
from solo.models import SingletonModel


class PRSiteConfig(SingletonModel):
    satisfied_message = models.TextField(_("default satisfied message"))
    unsatisfied_message = models.TextField(_("default unsatisfied message"))

    def __str__(self):
        return "PR Site Config"
    
    class Meta:
        verbose_name = "PR Site Config"



class SurveyConfig(SingletonModel):
    message = models.TextField()

    def __str__(self):
        return "Survey Whatsapp Message Config"
    
    class Meta:
        verbose_name = "Survey Whatsapp Message Config"

class Link(models.Model):
    config = models.ForeignKey(SurveyConfig, on_delete=models.CASCADE)
    link = models.URLField()
    order = models.PositiveIntegerField(null=True, blank=True, default=0)

    def __str__(self):
        return self.link

    class Meta:
        ordering = ["-order"]


class SurveyTemplate(models.Model):
    title       = models.CharField(max_length=50)
    flag        = models.BooleanField(_("out patient"), unique=True)
    order       = models.PositiveIntegerField(null=True, blank=True, default=0)

    class Meta:
        ordering = ["-order"]

    def __str__(self):
        return self.title
    
class SurveyQuestion(models.Model):
    template    = models.ForeignKey(SurveyTemplate, on_delete=models.CASCADE)
    question    = models.CharField(max_length=255)
    group       = models.CharField(max_length=50, choices=QuestionType.choices)
    category    = models.CharField(max_length=50, choices=QuestionCategory.choices)
    periority   = models.PositiveIntegerField(_("periority"), default=QuestionWeight.LOW, choices=QuestionWeight.choices)
    order       = models.PositiveIntegerField(null=True, blank=True, default=0)

    class Meta:
        ordering = ["-order"]

    def __str__(self):
        return self.question

class SurveyAnswer(models.Model):
    question    = models.CharField(max_length=255)
    group       = models.CharField(max_length=50, choices=QuestionType.choices)
    answer      = models.PositiveIntegerField()
    category    = models.CharField(max_length=50, choices=QuestionCategory.choices)
    periority   = models.PositiveIntegerField(_("periority"), default=QuestionWeight.LOW, choices=QuestionWeight.choices)    
    def clean(self, *args, **kwargs):
    
        if self.answer not in AnswerResponse[self.group]:
            raise serializers.ValidationError(
                {"answer": _("invalid answer")})
        
        super().clean()

    def save(self, *args, **kwargs):
        self.clean(*args, **kwargs)
        super().save()

    def __str__(self):
        return self.question
    
class SurveyInfo(models.Model):
    room_no         = models.PositiveIntegerField()
    admission_no    = models.CharField(max_length=255)
    enter_date      = models.DateTimeField()
    doctor          = models.CharField(max_length=255)
    patient         = models.CharField(max_length=255)
    phone           = models.CharField(max_length=255, validators=[validate_phone])

    def save(self, *args, **kwargs):
        phonenumber = PhoneNumber(self.phone, "EG")
        self.phone = phonenumber.format(raise_exception=True, allow_blank=True)
        super().save()



class Survey(TimeStampedModel):
    info            = models.OneToOneField(SurveyInfo, on_delete=models.CASCADE)
    answers         = models.ManyToManyField(SurveyAnswer)
    flag            = models.BooleanField()
    survey_type     = models.CharField(max_length=50, choices=SurveyType.choices, default=SurveyType.IN_PERSON)
    satisfied       = models.BooleanField(default=True)
    comment         = models.TextField(null=True, blank=True)
    
    
    def __str__(self):
        return self.info.patient
