from prcore.helpers import PhoneNumber


def validate_phone(value):
    phonevaliator = PhoneNumber(value, "EG")
    phonevaliator.isvalid(raise_exception=True, allow_blank=True)
