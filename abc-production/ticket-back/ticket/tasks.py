import math
from django.http import HttpResponse
from django.core.files.base import ContentFile
from django.utils import timezone
from datetime import date, timedelta
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.contrib.auth import get_user_model

# =========== main app ============
from ticket.helpers import *
from ticket.models.resources import *
from ticket.models.models import *
from ABCHospital.helpers import *
from users.models.models import Notification
from django.utils.translation import gettext_lazy as _


USER_MODEL = get_user_model()


def exporting(data):
    # get current
    channel_layer = get_channel_layer()
    exporter = USER_MODEL.objects.get(id=data['user'])
    department = exporter.department
    range_time = data.get('range_time', None)
    filename = data.get('filename', None)
    
    try:
        exporter.status = 1
        exporter.save()
        async_to_sync(channel_layer.group_send)(
            f'{exporter.id}',
            {
                'type': 'task_export',
                'data': {
                        "message": exporter.status,
                        "created_at": f"{timezone.localtime(timezone.now()).isoformat()}"
                }
            }
        )

        if range_time:

            start_time, end_time = rangetime(range_time)
        else:
            start_time, end_time = timezone.now() - timedelta(days=1), timezone.now()

        if data['archieved']:
            tickets = Ticket.objects.filter(department=department, created_at__range=(
                start_time, end_time)) | Ticket.deleted_objects.filter(department=department, created_at__range=(start_time, end_time))
        else:
            tickets = Ticket.objects.filter(
                department=department, created_at__range=(start_time, end_time))

       
        filepaths = []
        itr = 1
        for ticket in chunked_queryset(tickets, math.ceil(tickets.count() / data['chunk'])):
            filename_chunk = f"{data['filename']}_{itr}_{date.today()}.xls" if filename else f"ticketscrm_{itr}_{date.today()}.xls"
            dataset = TicketResource().export(ticket)

            response = HttpResponse(
                dataset.xlsx, content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
            response['Content-Disposition'] = f'attachment;filename={filename_chunk}'

            temp_file = ContentFile(response.content)
            obj = ImportExportFile.objects.create(
                user=exporter, department=department, title=filename_chunk, is_import=False)
            obj.files.save(f'{filename_chunk}', temp_file)
            
            message = str(_(f"file {filename_chunk} been exported"))
            notification = Notification.objects.create(
                user=exporter, message=message, types=3)
            data = {
                "types": notification.types,
                "message": notification.message,
                "created_at": f"{notification.created_at.isoformat()}"
            }
            async_to_sync(channel_layer.group_send)(
                f'{exporter.id}',
                {
                    'type': 'task_notification',
                    'data': data
                }
            )
            itr += 1
            filepaths.append(obj.files.url)

        exporter.status = 0
        exporter.save()
        async_to_sync(channel_layer.group_send)(
            f'{exporter.id}',
            {
                'type': 'task_export',
                'data': {
                        "message": exporter.status,
                        "created_at": f"{timezone.localtime(timezone.now()).isoformat()}"
                }
            }
        )
        return filepaths

    except Exception as e:
        exporter.status = 0
        exporter.save()
        message = str(_("export failed"))

        notification = Notification.objects.create(
            user=exporter, message=message, types=3)
        data = {
            "types": notification.types,
            "message": notification.message,
            "created_at": f"{notification.created_at.isoformat()}"
        }

        async_to_sync(channel_layer.group_send)(
            f'{exporter.id}',
            {
                'type': 'task_notification',
                'data': data
            }
        )

        async_to_sync(channel_layer.group_send)(
            f'{exporter.id}', {
                'type': 'task_export',
                'data': {
                    "message": exporter.status,
                    "created_at": f"{timezone.localtime(timezone.now()).isoformat()}"
                }
            })
        print(e)
