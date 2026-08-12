from ABCHospital.middlewares import RequestMiddleware
from ticket.signals.helpers import *
from ticket.models import *
from channels.layers import get_channel_layer
from django.utils.translation import gettext_lazy as _
from django.contrib.auth import get_user_model
from ticket.models.choices import TicketStatus
from django.utils import timezone

USER_MODEL = get_user_model()
CHANNEL_LAYER = get_channel_layer()

def postsave_ticket_handler(data):
    CURRENT_REQUEST = RequestMiddleware(get_response=None)
    CURRENT_REQUEST = CURRENT_REQUEST.thread_local.current_request

    created = data.get("created")
    instance = data.get("instance")

    if created:
        notify_to_department(CURRENT_REQUEST, CHANNEL_LAYER, instance)
    else:
        curr = instance.history.latest()
        prev = curr.prev_record if curr.prev_record else None

        if prev and Ticket.objects.filter(id=instance.id).exists():

            delta = curr.diff_against(prev)
            fields = [change.field for change in delta.changes]

            if 'department' in fields:
                instance.subscribers.set([])
                instance.status = TicketStatus.ON_HOLD
                instance.save()
                notify_to_department(CURRENT_REQUEST, CHANNEL_LAYER, instance)
                if not CURRENT_REQUEST.user == instance.complaint:
                    message = _("has transfered ticket with code") + \
                        f" {instance.id}"
                    notify_to_complaint(
                        CURRENT_REQUEST, CHANNEL_LAYER, instance, message)

            if 'issuetype' in fields and not instance.status == TicketStatus.COMPLETE:
                instance.status = TicketStatus.COMPLETE
                instance.closed_at = timezone.now()
                instance.save()

            if 'status' in fields:
                if instance.status == TicketStatus.IN_PROGRESS:
                    if not CURRENT_REQUEST.user == instance.complaint:
                        message = _(
                            "has a started progress on ticket with code") + f" {instance.id}"
                        notify_to_complaint(
                            CURRENT_REQUEST, CHANNEL_LAYER, instance, message)
                elif instance.status == TicketStatus.COMPLETE:
                    if not CURRENT_REQUEST.user == instance.complaint:
                        message = _("has closed ticket with code") + \
                            f" {instance.id}"
                        notify_to_complaint(
                            CURRENT_REQUEST, CHANNEL_LAYER, instance, message)


def postsave_ticket_comment_handler(data):
    CURRENT_REQUEST = RequestMiddleware(get_response=None)
    CURRENT_REQUEST = CURRENT_REQUEST.thread_local.current_request

    created = data.get("created")
    instance = data.get("instance")
    ticket = instance.ticket

    if created:
        if instance.commenter == ticket.complaint:
            # =============== sender data ===================
            sender = ticket.complaint
            title = f"{sender.get_full_name()} " + _("from") + \
                f" {sender.department.name if sender.department else 'Admininstration'}"
            message = f"{title} " + \
                _("has a message on ticket with code") + f" {ticket.id}"
            image_url = f"{CURRENT_REQUEST.build_absolute_uri(sender.image.url)}" if sender.image else ""
            # =========== recievers ================
            recievers = USER_MODEL.objects.filter(department=ticket.department).exclude(
                id__in=ticket.subscribers.values_list('id', flat=True))
            data = {
                "message": message,
                "types": 1,
                "created_at": f"{now().isoformat()}",
            }

            for reciever in recievers:
                Notification.objects.create(user=reciever, **data)

                async_to_sync(CHANNEL_LAYER.group_send)(
                    f'{reciever.id}',
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

        else:

            # ================ senedr data =============
            sender = instance.commenter
            title = f"{sender.get_full_name()} " + _("from") + \
                f" {sender.department.name if sender.department else 'Administration'}"
            message = f"{title} " + \
                _("has a message on ticket with code") + f" {ticket.id}"
            image_url = f"{CURRENT_REQUEST.build_absolute_uri(sender.image.url)}" if sender.image else ""
            # =============== reciever data ================
            reciever = ticket.complaint
            if reciever not in ticket.subscribers.all():
                data = {
                    "message": message,
                    "types": 1,
                    "created_at": f"{now().isoformat()}",
                }
                Notification.objects.create(user=reciever, **data)
                async_to_sync(CHANNEL_LAYER.group_send)(
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

                task = threading.Thread(target=sendFCM, args=(data, ))
                task.start()
