"""Helpers extracted from the ABCHospital monolith — only what the `pr` app uses.

Trimmed deliberately: the monolith's helpers module also carried Twilio, FCM and
ticket-export utilities that the PR service has no business depending on.
"""
import threading

import phonenumbers
import requests
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from rest_framework import serializers


class PhoneNumber:
    def __init__(self, value, locale=None):
        self.locale = locale
        self.value = value

    def isvalid(self, raise_exception=False, allow_blank=True):
        if not (allow_blank or self.value):
            if raise_exception:
                raise serializers.ValidationError(
                    {"details": _("This field may not be blank.")}, code="required"
                )
            return False

        if self.value:
            try:
                phone_parser = phonenumbers.parse(self.value, self.locale)
                if not phonenumbers.is_valid_number(phone_parser):
                    if raise_exception:
                        raise serializers.ValidationError(
                            {"details": _("The string supplied did not seem to be a phone number.")},
                            code="invalid",
                        )
                    return False
                return self.value
            except phonenumbers.phonenumberutil.NumberParseException:
                if raise_exception:
                    raise serializers.ValidationError(
                        {"details": _("The string supplied did not seem to be a phone number.")},
                        code="invalid",
                    )
                return False
        return self.value

    def format(self, raise_exception=False, allow_blank=True):
        value = self.isvalid(raise_exception, allow_blank)
        if value:
            parser = phonenumbers.parse(value, self.locale)
            return phonenumbers.format_number(parser, phonenumbers.PhoneNumberFormat.E164)


class WhatsAppHandler:
    """Sends the survey invitation over the WhatsApp gateway.

    NOTE: in the monolith this feature is DISABLED — `pr/signals/signals.py` has the
    `post_save` receiver commented out, so nothing ever calls it. It is carried over
    so the extraction is behaviour-identical; enable it deliberately, and fix
    `verify=False` (see below) before you do.
    """

    def __init__(self, phone, message=None):
        self.phone = phone
        self.message = message

    def _endpoint(self):
        return getattr(settings, "WHATSAPP_API_URL", "")

    def send(self):
        url = self._endpoint()
        if not url:
            return None

        # Lazy import keeps the service importable even if the config rows are absent.
        from pr.models.models import SurveyConfig, Link

        config = SurveyConfig.objects.first()
        links = Link.objects.all().order_by("order") if config else []
        body = self.message or (config.message if config else "")
        for link in links:
            body = f"{body}\n{link.url}"

        payload = {"phone": self.phone, "message": body}
        try:
            # SECURITY: the monolith called this with `verify=False`, disabling TLS
            # verification entirely. Verification is ON here.
            return requests.post(url, data=payload, timeout=10)
        except requests.RequestException:
            return None

    def send_async(self):
        threading.Thread(target=self.send, daemon=True).start()
