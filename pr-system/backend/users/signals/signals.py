from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver
from users.signals.handlers import *


@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def postsave_user_signal(sender, instance=None, created=False, **kwargs):
    data = {"sender": sender, "instance": instance,
            "created": created, "kwargs": kwargs}
    postsave_user_handler(data)
