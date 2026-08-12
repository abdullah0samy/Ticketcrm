import json
from django.contrib.auth import get_user_model
from djangochannelsrestframework import permissions
from djangochannelsrestframework.generics import GenericAsyncAPIConsumer
# from djangochannelsrestframework.consumers import AsyncAPIConsumer
from channels.db import database_sync_to_async
from djangochannelsrestframework.observer import model_observer
from djangochannelsrestframework.decorators import action
from djangochannelsrestframework.mixins import (
    ListModelMixin, RetrieveModelMixin, PatchModelMixin,
    UpdateModelMixin, CreateModelMixin, DeleteModelMixin,
)
from django.db.models import Q
from django.utils.translation import gettext_lazy as _
from django.utils.timezone import now
from users.apis.serializers import UserSerializer
from ticket.apis.serializers import *
from ticket.models.models import *

USER_MODEL = get_user_model()


class LiveConsumer(ListModelMixin, RetrieveModelMixin,
                   PatchModelMixin, UpdateModelMixin,
                   CreateModelMixin, DeleteModelMixin, GenericAsyncAPIConsumer):

    queryset = USER_MODEL.objects.all()
    serializer_class = UserSerializer
    permission_classes = (permissions.IsAuthenticated,)
    lookup_field = "pk"

    async def connect(self):
        user_id = self.scope["user"].id

        if user_id:
            # Join ticket group
            await self.channel_layer.group_add(
                "{}".format(user_id),
                self.channel_name
            )
            
            await self.accept()

    async def disconnect(self, code):
        tickets = await self.get_current_user_tickets_id()
        for ticket in tickets:
            await self.remove_user_from_ticket(ticket)
        await super().disconnect(code)


    
# =========================== Plug message for each ticket ===============================
    @model_observer(TicketComment, serializer_class=TicketCommentSerializer)
    async def message_activity(self, message, action, subscribing_request_ids=[], **kwargs):
        if action == "create":
            for request_id in subscribing_request_ids:
                await self.reply(data=message, action="talk", request_id=request_id)

    @message_activity.groups_for_signal
    def message_activity(self, instance: TicketComment, **kwargs):
        yield f'ticket__{instance.ticket_id}'
        yield f'pk__{instance.pk}'

    @message_activity.groups_for_consumer
    def message_activity(self, ticket=None, **kwargs):
        if ticket is not None:
            yield f'ticket__{ticket}'

    @action()
    async def join_ticket(self, pk, request_id, **kwargs):
        if not await self.ticket_exists(pk):
            # return the content and the response code.
            return {"error": "Ticket not found"}, 404
        self.ticket_subscribe = pk
        await self.subscribe_to_messages_in_ticket(pk, request_id, **kwargs)

    @action()
    async def subscribe_to_messages_in_ticket(self, pk, request_id, **kwargs):
        await self.add_user_to_ticket(pk)
        await self.message_activity.subscribe(ticket=pk, request_id=request_id, **kwargs)

    @database_sync_to_async
    def add_user_to_ticket(self, pk):
        user: USER_MODEL = self.scope["user"]
        if not user.ticket_subscribers.filter(pk=pk).exists():
            user.ticket_subscribers.add(Ticket.objects.get(pk=pk))

    @action()
    async def leave_ticket(self, pk, request_id, **kwargs):
        if not await self.ticket_exists(pk):
            # return the content and the response code.
            return {"error": "Ticket not found"}, 404

        await self.unsubscribe_to_messages_in_ticket(pk, request_id, **kwargs)

    @action()
    async def unsubscribe_to_messages_in_ticket(self, pk, request_id, **kwargs):
        await self.remove_user_from_ticket(pk)
        await self.message_activity.unsubscribe(ticket=pk, request_id=request_id, **kwargs)

    @database_sync_to_async
    def remove_user_from_ticket(self, pk):
        user: USER_MODEL = self.scope["user"]
        user.ticket_subscribers.remove(Ticket.objects.get(pk=pk))

    @database_sync_to_async
    def get_ticket(self, pk: int) -> Ticket:
        return Ticket.objects.get(id=pk)

    @database_sync_to_async
    def get_current_user_tickets_id(self) -> list:
        return [ticket.id for ticket in self.scope['user'].ticket_subscribers.all()]

    
    @database_sync_to_async
    def ticket_exists(self, pk: int) -> bool:
        return True if Ticket.objects.filter(pk=pk, complaint__department=self.scope['user'].department).exists() or Ticket.objects.filter(pk=pk, department=self.scope['user'].department).exists() else False

    async def task_notification(self, event):
        data = event['data']
        request_id = int(now().strftime('%Y%m%d'))

        await self.send(json.dumps({
            "action": "notifications",
            "request_id": request_id,
            "data": data
        }))

    async def inform_updates(self, event):
        data = event['data']
        request_id = int(now().strftime('%Y%m%d'))

        await self.send(json.dumps({
            "action": "realtime_changes",
            "type": data['type'],
            "model": data['model'],
            "object": data['object'],
            "request_id": request_id,
        }))


    async def task_export(self, event):
        data = event['data']
        request_id = int(now().strftime('%Y%m%d'))

        await self.send(json.dumps({
            "action": "export",
            "request_id": request_id,
            "data": data
        }))
