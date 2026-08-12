from django.db import transaction
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from ticket.signals.handlers import *
from ticket.models.models import *
from django.utils.translation import gettext_lazy as _
from ticket.apis.serializers import *
from django.db.models import Q




        
@receiver(post_save, sender=Ticket)
def postsave_ticket_signal(sender, instance=None, created=False, **kwargs):
    data = {"sender": sender, "instance": instance,
        "created": created, "kwargs": kwargs}
    
    postsave_ticket_handler(data)
    transaction.on_commit(lambda: send_ticket_update(created, instance))

    
@receiver(post_save, sender=Note)
def postsave_note_signal(sender, instance=None, created=False, **kwargs):
    transaction.on_commit(lambda: send_note_update(created, instance))

@receiver(post_delete, sender=Note)
def postdelete_note_signal(sender, instance=None, created=False, **kwargs):
    query = Q(department=instance.department)
    serializer_data = {"id": instance.id}
    realtime_handler(query, "delete", "note", serializer_data) 



@receiver(post_save, sender=TicketComment)
def postsave_ticket_comment_signal(sender, instance=None, created=False, **kwargs):
    data = {"sender": sender, "instance": instance,
            "created": created, "kwargs": kwargs}

    postsave_ticket_comment_handler(data)
