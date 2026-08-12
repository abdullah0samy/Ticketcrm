import threading
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.utils.translation import gettext_lazy as _



class WSManager:
    def __init__(self, users):
        self.users = users
        
    @staticmethod
    def __ws_notification(users, ws_type, data):
        channel_layer = get_channel_layer()

        for user in users:
            if user:
                async_to_sync(channel_layer.group_send)(
                    f'{user.id}',
                    {
                        'type': ws_type,
                        'data': data
                    }
                )
    def notify(self, ws_type, data={}):
        WSManager.__ws_notification(self.users, ws_type, data)