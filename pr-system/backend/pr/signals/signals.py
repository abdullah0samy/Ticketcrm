from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from pr.signals.handlers import *
from pr.models.models import *
from django.utils.translation import gettext_lazy as _
from django.db.models import Q




        
@receiver(post_save, sender=Survey)
def postsave_survey_signal(sender, instance=None, created=False, **kwargs):
    data = {"sender": sender, "instance": instance,
        "created": created, "kwargs": kwargs}
    
    # postsave_survey_handler(data)

    