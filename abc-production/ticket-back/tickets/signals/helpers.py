
import threading
from django.db.models import Q
from django.utils.timezone import now
from asgiref.sync import async_to_sync
from users.models.models import Notification
from ABCHospital.tasks import sendFCM
from ABCHospital.middlewares import RequestMiddleware
from django.utils.translation import gettext_lazy as _
from django.contrib.auth import get_user_model
from ABCHospital.ws.notifications import WSManager
from ticket.apis.serializers import *


USERMODEL = get_user_model()


def notify_to_department(request, channel_layer, instance):
    sender = instance.complaint
    title = f"{sender.get_full_name()} " + _("from") + \
        f" {sender.department.name if sender.department else 'Administration'}"
    message = f"{title} " + _("added ticket with code") + f" {instance.id}"
    image_url = f"{request.build_absolute_uri(sender.image.url)}" if sender.image else ""
    recievers = instance.department.user_department.all()

    data = {
        "message": message,
        "types": 2,
        "created_at": f"{now().isoformat()}",
    }
    for user in recievers:
        Notification.objects.create(user=user, **data)

        async_to_sync(channel_layer.group_send)(
            f'{user.id}',
            {
                'type': 'task_notification',
                'data': data
            }
        )

    group = list(recievers.values_list('id', flat=True))
    data = {
        "users": group,
        "title": title,
        "message": message,
        "image_url": image_url
    }
    task = threading.Thread(target=sendFCM, args=(data, ))
    task.start()


def notify_to_complaint(request, channel_layer, instance, message=""):
    reciever = instance.complaint
    sender = request.user
    title = f"{sender.get_full_name()} " + _("from") + \
        f" {sender.department.name if sender.department else 'Administration'}"
    message = f"{title} " + message
    image_url = f"{request.build_absolute_uri(sender.image.url)}" if sender.image else ""

    data = {
        "message": message,
        "types": 2,
        "created_at": f"{now().isoformat()}",
    }

    Notification.objects.create(user=reciever, **data)

    async_to_sync(channel_layer.group_send)(
        f'{reciever.id}',
        {
            'type': 'task_notification',
            'data': data
        }
    )

    data = {
        "users": [reciever.id],
        "title": title,
        "message": message,
        "image_url": image_url
    }
    task = threading.Thread(target=sendFCM, args=(data, ))
    task.start()




def realtime_handler(query, action_type, model, serializer_data):
    request = RequestMiddleware(get_response=None)
    request = request.thread_local.current_request
    users = USERMODEL.objects.filter(query).exclude(id=request.user.id)
    manager = WSManager(users)
    data = {
        "action": "realtime_changes",
        "type": action_type,
        "model": model,
        "object": serializer_data
    }
    manager.notify("inform_updates", data)


def send_ticket_update(created, instance):
    query = Q(department=instance.department) | Q(id=instance.complaint.id)
    serializer_data = TicketSerializer(instance, read_only=True).data
    if created:
        realtime_handler(query, "create", "ticket", serializer_data)
    else:
        if instance.is_deleted:
            realtime_handler(query, "soft_delete", "ticket", {"id": instance.id})
        else:
            realtime_handler(query, "update", "ticket", serializer_data)
            
def send_note_update(created, instance):
    query = Q(department=instance.department)
    serializer_data = NoteSerializer(instance, read_only=True).data
    if created:
        realtime_handler(query, "create", "note", serializer_data)
    else:
        realtime_handler(query, "update", "note", serializer_data)
    