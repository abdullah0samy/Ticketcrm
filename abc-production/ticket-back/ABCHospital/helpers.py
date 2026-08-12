import threading
import phonenumbers
import requests
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from rest_framework import serializers
from datetime import datetime, timedelta
from django.db.models.fields.files import ImageFieldFile
from twilio.rest import Client

def ModelFilter(model, self, **kwargs):
    return model.objects.exclude(id=self.id)


def rangetime(x):
    start, end = x.split(' ')
    return datetime.strptime(start, '%d-%m-%Y'), datetime.strptime(end, '%d-%m-%Y') + timedelta(days=1)


def get_time(x):
    return datetime.strptime(x, '%d-%m-%Y')


class Serializer:

    def __init__(self, request, instance, attr, lst, include):
        self.request = request
        self.instance = instance
        self.attr = attr
        self.lst = lst
        self.include = include

    def normalize(self, value, k):
        v = getattr(value, k, None)
        if v:
            if isinstance(v, str):
                return v.title()
            elif isinstance(v, ImageFieldFile):
                return self.request.build_absolute_uri(f"{v.url}")
            else:
                return v
        return None

    def serialized(self):
        value = getattr(self.instance, self.attr, None)

        if value is not None:
            if not self.lst:
                return {k: self.normalize(value, k) for k in value.__dict__.keys()} if self.include else {}
            else:
                return {k: self.normalize(value, k) for k in value.__dict__.keys() if k in self.lst} if self.include else {k: self.normalize(value, k) for k in value.__dict__.keys() if k not in self.lst}
        return None

    def serialize(self):
        return self.serialized()

class PhoneNumber:
    def __init__(self, value, locale=None):
        self.locale = locale
        self.value = value
        
    def isvalid(self, raise_exception=False, allow_blank=True):
        if not (allow_blank or self.value):
            if raise_exception:
                raise serializers.ValidationError({"details": _("This field may not be blank.")}, code="required")
            return False

        if self.value:
            try:
                phone_parser = phonenumbers.parse(self.value, self.locale)
                if not phonenumbers.is_valid_number(phone_parser):
                    if raise_exception:
                        raise serializers.ValidationError({"details": _("The string supplied did not seem to be a phone number.")}, code="invalid")
                    return False
                return self.value
            except phonenumbers.phonenumberutil.NumberParseException:
                if raise_exception:
                    raise serializers.ValidationError({"details": _("The string supplied did not seem to be a phone number.")}, code="invalid")
                return False
        return self.value
    
    def format(self, raise_exception=False, allow_blank=True):
        value = self.isvalid(raise_exception, allow_blank)
        if value:
            parser = phonenumbers.parse(value, self.locale)
            return phonenumbers.format_number(parser, phonenumbers.PhoneNumberFormat.E164)



class WhatsAppHandler:
    @staticmethod
    def send(number, message=None, types="text", priority=1):
        from pr.models.models import SurveyConfig, Link

        if message is None:
            survey_conf = SurveyConfig.get_solo()
            intro_message = survey_conf.message + '\n'
            links = '\n'.join(list(Link.objects.filter(config=survey_conf).order_by('-order').values_list('link', flat=True)))
            message = f"""{intro_message} {links}"""

        WhatsAppHandler.send_async(number, message, types, priority)
        # task = threading.Thread(target=WhatsAppHandler.send_async, args=(number, message, types, priority))
        # task.start()

    @staticmethod
    def send_async(number, message, types="text", priority=1):
        url = f"https://waha.telasttechnologies.com/api/sendText"
        data = {"chatId": f"{number.replace('+', '')}", "text": message, "session": "default"}
        requests.post(url, data, verify=False)
        
        # requests.post("https://saas.csch-svu.com/saas/Install/api/send/whatsapp", params={
        #     "secret": settings.ZENDAR_API_KEY,
        #     "account": settings.ZENDAR_ACCOUNT,
        #     "recipient": number,
        #     "type": types,
        #     "message": message,
        #     "priority": priority
        # }, verify=False)



