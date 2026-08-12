from fcm_django.models import FCMDevice
from firebase_admin.messaging import Message
from firebase_admin.messaging import Notification as FCM_Notification
from django.contrib.auth import get_user_model
from django.utils.translation import gettext_lazy as _
# =========== main app ============

USER_MODEL = get_user_model()


def sendFCM(data):
    users = USER_MODEL.objects.filter(id__in=data['users'])
    devices = FCMDevice.objects.filter(user__in=users)
    if devices.exists():

        devices.send_message(
            Message(
                notification=FCM_Notification(
                    title=data['title'], body=data['message'], image=data['image_url'])
            )
        )

