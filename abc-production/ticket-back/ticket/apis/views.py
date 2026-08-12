import threading
from django.db import transaction
from django.db.models import Q
from rest_framework import serializers
from rest_framework.response import Response
from rest_framework.decorators import action, api_view, permission_classes
from django.views.decorators.csrf import csrf_exempt
from rest_framework.status import (HTTP_200_OK, HTTP_400_BAD_REQUEST,
                                   HTTP_403_FORBIDDEN)
from nested_multipart_parser.drf import DrfNestedParser
from rest_framework.parsers import JSONParser, MultiPartParser, FormParser
from django.utils.translation import gettext_lazy as _
from rest_framework import viewsets, mixins
from rest_framework.authentication import TokenAuthentication

from ticket.models.models import *
from ticket.signals.signals import *
from ticket.apis.serializers import *
from ticket.permissions import *
from ticket.tasks import *
from ticket.models.choices import *
from ticket.models.filters import *
from users.apis.serializers import ReceiverDepartmentSerializer
from users.models.choices import Roles
from users.models.models import UserInfo
from ABCHospital.helpers import *
from ABCHospital.paginators import ChatPagination
from ABCHospital.views.mixins import SelectModeSerializerMixin



class ISSUESTypeModelViewSet(SelectModeSerializerMixin, viewsets.GenericViewSet):
    queryset = ISSUESType.objects.all().order_by('-id')
    serializer_class = ISSUESTypeSerializer
    selectserializer_class = SelectISSUESTypeSerializer
    authentication_classes = (TokenAuthentication,)
    filterset_class = ISSUESTypeFilter
    
    @action(detail=False, methods=['get'])
    def select(self, request, *args, **kwargs):
        queryset = self.get_queryset(*args, **kwargs)
        filterset = self.filterset_class(request.GET, queryset=queryset, request=request, *args, **kwargs)
        serializer = self.get_serializer_class(*args, **kwargs)(filterset.qs, many=True, read_only=True, context={"request": request, 'view': self}) 
    
        data = {
            "results": serializer.data,
            "message": _("selected successfully"),
            "status": HTTP_200_OK
        }
        return Response(data, status=HTTP_200_OK)

class TicketModelViewSet(viewsets.ModelViewSet):
    queryset = Ticket.objects.all().order_by('-id')
    serializer_class = TicketSerializer
    authentication_classes = (TokenAuthentication,)
    permission_classes = (TicketPermission, )
    parser_classes = (DrfNestedParser, JSONParser)
    filterset_class = TicketFilterSet

    @action(detail=False, methods=['post'])
    def transfer(self, request, *args, **kwargs):
        serializer = TransferTicketSerializer(data=self.request.data)
        serializer.is_valid(raise_exception=True)

        option = serializer.validated_data['option']
        department = serializer.validated_data['department']
        tickets = serializer.validated_data['ticket']
        reason = serializer.validated_data.get('reason')

        # `option=False` used to mean "wipe the trail": it deleted every history
        # row and every comment on the ticket. That is unrecoverable data loss on
        # a clinical record, so it no longer deletes anything — the intent is
        # recorded as `fresh_start` and clients can collapse earlier
        # correspondence in the UI instead.
        fresh_start = not option

        with transaction.atomic():
            for ticket in tickets:
                previous_department = ticket.department
                ticket.department = department
                ticket.save()

                TicketTransfer.objects.create(
                    ticket=ticket,
                    from_department=previous_department,
                    to_department=department,
                    transferred_by=request.user if request.user.is_authenticated else None,
                    fresh_start=fresh_start,
                    reason=reason,
                )

        return Response({"message": _("transfer successfully"), "status": HTTP_200_OK}, status=HTTP_200_OK)
    
    @action(detail=True, methods=['patch'])
    def assign(self, request, *args, **kwargs):
        """Assign (or unassign) a ticket to an agent.

        Body: {"assigned_to": &lt;user id&gt;} — send null to unassign.
        The agent must belong to the ticket's department, otherwise a ticket
        could be handed to someone with no access to it.
        """
        ticket = self.get_object()
        user_id = request.data.get('assigned_to', None)

        if user_id in (None, '', 'null'):
            ticket.assigned_to = None
        else:
            agent = UserInfo.objects.filter(
                id=user_id, department=ticket.department, is_active=True).first()
            if agent is None:
                return Response(
                    {"assigned_to": _("agent must belong to the ticket's department")},
                    status=HTTP_400_BAD_REQUEST,
                )
            ticket.assigned_to = agent

        ticket.save()
        serializer = self.get_serializer(ticket, context={"request": request, 'view': self})
        return Response(serializer.data, status=HTTP_200_OK)

    @action(detail=False, methods=['get'])
    def assignable_agents(self, request, *args, **kwargs):
        """Users who may be assigned tickets in the caller's department."""
        department = request.user.department
        if department is None:
            agents = UserInfo.objects.filter(is_active=True, department__isnull=False)
        else:
            agents = UserInfo.objects.filter(is_active=True, department=department)

        return Response({
            "results": [
                {
                    "value": u.id,
                    "label": u.get_full_name() or str(u.fingerid),
                    "fingerid": u.fingerid,
                }
                for u in agents.order_by('first_name')
            ],
            "status": HTTP_200_OK,
        }, status=HTTP_200_OK)

    @action(detail=True, methods=['patch'])
    def close(self, request, *args, **kwargs):
        instance = self.get_object()
        if not instance.status == TicketStatus.COMPLETE:
            return Response(status=HTTP_400_BAD_REQUEST)
        
        instance.status = TicketStatus.CLOSED
        instance.save()
        
        serializer = self.get_serializer(instance, context={"request": request, 'view': self})
        
        return Response(serializer.data, status=HTTP_200_OK)
    
    def delete(self, request, *args, **kwargs):
        serializer = SoftDeleteTicketSerializer(data=self.request.data)
        serializer.is_valid(raise_exception=True)
        
        tickets = self.queryset.filter(
            id__in={ticket.id for ticket in serializer.validated_data['ticket']}, 
            department=self.request.user.department
        )

        tickets.delete()
        return Response(status=HTTP_200_OK)


class RestoreTicketModelViewSet(
    mixins.CreateModelMixin,
    mixins.ListModelMixin, 
    mixins.RetrieveModelMixin, 
    viewsets.GenericViewSet
):

    queryset = Ticket.deleted_objects.all().order_by('-id')
    serializer_class = TicketSerializer
    authentication_classes = (TokenAuthentication,)
    permission_classes = (TicketAdminPermission, )
    filterset_class = TicketFilterSet

    def get_qs(self, request, *args, **kwargs):
        serializer = RestoreTicketSerializer(data=self.request.data)
        serializer.is_valid(raise_exception=True)

        qs = Ticket.deleted_objects.filter(
            id__in={ticket.id for ticket in serializer.validated_data['ticket']}, 
            department=self.request.user.department
        ).order_by('-id')
        return qs
    

    def create(self, request, *args, **kwargs):
        qs = self.get_qs(request)
        tickets = []
        for q in qs:
            tickets.append(q.id)
        qs.restore()

        return Response(status=HTTP_200_OK)

    

class TicketCommentModelViewSet(
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet
):
    queryset = TicketComment.objects.all().order_by('-id')
    serializer_class = TicketCommentSerializer
    authentication_classes = (TokenAuthentication,)
    # Messages now carry photos, voice notes and files, so the endpoint has to
    # accept multipart as well as JSON.
    parser_classes = (MultiPartParser, FormParser, JSONParser)
    permission_classes = (TicketCommentPermission,)
    pagination_class = ChatPagination

    def get_queryset(self, *args, **kwargs):
        qs = self.queryset.select_related(
            'commenter', 'reply_to', 'reply_to__commenter')
        if self.action != 'list':
            # `?id=` names the *ticket*, and detail routes never send it, so
            # applying the filter here matched nothing and every edit and
            # delete came back 404. Object-level access is enforced by
            # TicketCommentPermission instead.
            return qs.order_by('-id')
        pk = self.request.query_params.get('id', 0)
        return qs.filter(ticket__id=pk).order_by('-id')



class HistoryTicketModelViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    queryset = Ticket.history.model.objects.all().order_by('-id')
    serializer_class = TicketHistorySerializer
    authentication_classes = (TokenAuthentication,)

    def get_queryset(self, *args, **kwargs):
        pk = self.request.query_params.get('id', 0)
        self_query = Q(complaint=self.request.user)
        dept_query = Q(department=self.request.user.department)
        return self.queryset.filter(Q(self_query | dept_query), id=pk).order_by('-history_date')
    

class NoteModelViewSet(viewsets.ModelViewSet):
    queryset = Note.objects.all()
    serializer_class = NoteSerializer
    authentication_classes = (TokenAuthentication,)
    permission_classes = (NotePermission, )

    def get_permissions(self):
        # Reacting to a teammate's note is not editing it.
        if self.action in ('like', 'likes', 'pin', 'list', 'retrieve'):
            return [NoteInteractionPermission()]
        return super().get_permissions()

    def get_queryset(self):
        # Pinned announcements first, then newest — see Note.Meta.ordering.
        return (self.queryset
                .filter(department=self.request.user.department)
                .select_related('poster')
                .prefetch_related('reactions', 'comment_note', 'media_note'))

    @action(detail=True, methods=['post'])
    def like(self, request, pk=None, *args, **kwargs):
        """Toggle this user's like. Idempotent in both directions."""
        note = self.get_object()
        reaction = NoteReaction.objects.filter(note=note, user=request.user).first()
        if reaction is not None:
            reaction.delete()
            liked = False
        else:
            NoteReaction.objects.create(note=note, user=request.user)
            liked = True
        # Count against the database, not `note.reactions` — the queryset
        # prefetches reactions, so that cache predates the write above.
        return Response(
            {"liked": liked,
             "likes_count": NoteReaction.objects.filter(note_id=note.pk).count()},
            status=HTTP_200_OK,
        )

    @action(detail=True, methods=['get'])
    def likes(self, request, pk=None, *args, **kwargs):
        """Who liked this note."""
        note = self.get_object()
        return Response(
            {"results": [
                {"id": r.user_id, "name": r.user.get_full_name(), "created_at": r.created_at}
                for r in note.reactions.select_related('user')
            ]},
            status=HTTP_200_OK,
        )

    @action(detail=True, methods=['patch'])
    def pin(self, request, pk=None, *args, **kwargs):
        """Pin/unpin an announcement. Managers and admins only."""
        if request.user.get_role == Roles.AGENT:
            return Response({"detail": _("only managers can pin notes")},
                            status=HTTP_403_FORBIDDEN)
        note = self.get_object()
        note.pinned = not note.pinned
        note.save(update_fields=['pinned'])
        return Response({"pinned": note.pinned}, status=HTTP_200_OK)


class NoteCommentModelViewSet(viewsets.ModelViewSet):
    """Comments on team-feed notes. The serializer existed but was never routed."""
    queryset = NoteComment.objects.all().order_by('id')
    serializer_class = NoteCommentSerializer
    authentication_classes = (TokenAuthentication,)
    permission_classes = (NoteInteractionPermission, )

    def get_queryset(self):
        qs = (self.queryset
              .filter(note__department=self.request.user.department)
              .select_related('commenter'))
        note_id = self.request.query_params.get('note')
        return qs.filter(note_id=note_id) if note_id else qs

    def destroy(self, request, *args, **kwargs):
        comment = self.get_object()
        # Your own comment, or anyone's if you run the department.
        if comment.commenter_id != request.user.id and request.user.get_role == Roles.AGENT:
            return Response({"detail": _("you can only delete your own comment")},
                            status=HTTP_403_FORBIDDEN)
        return super().destroy(request, *args, **kwargs)


class ImportExportFileModelViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    queryset = ImportExportFile.objects.all().order_by('-id')
    serializer_class = ImportExportFileSerializer
    authentication_classes = (TokenAuthentication,)
    permission_classes = (TicketAdminOrCeoPermission, )

    def get_queryset(self):
        if self.request.user.department:
            department = self.request.user.department
        else:
            if 'department' in self.request.GET:
                serializer = ReceiverDepartmentSerializer(data=self.request.GET)
                serializer.is_valid(raise_exception=True)

                department = Department.objects.get(pk=serializer.data['department'])
            else:
                departments = Department.objects.filter(reciever=True)
                if departments.exists():
                    department = departments.first()
                else:
                    department = None
                
            
        return self.queryset.filter(department=department).order_by('-id')


class ExportFileModelViewSet(ImportExportFileModelViewSet):
    def get_queryset(self):
        return super().get_queryset().filter(is_import=False).order_by('-id')


class ImportFileModelViewSet(ImportExportFileModelViewSet):

    def get_queryset(self):
        return super().get_queryset().filter(is_import=True).order_by('-id')


@csrf_exempt
@api_view(["GET"])
@permission_classes((TicketAdminPermission,))
def export_data(request):
    data = {}
    chunk = request.GET.get('chunk', 1)
    try:
        chunk = int(chunk)
        if chunk <= 0:
            chunk = None
    except:
        chunk = None
    if not chunk:
        raise serializers.ValidationError(
            {"response": _("provide invalid positive number")})

    range_time = request.GET.get('created_at', None)
    archieved = request.GET.get('archieved', 'true') == 'true'
    filename = request.GET.get('filename', None)
    department = request.user.department
    if department:
        data['user'] = request.user.id
        data['chunk'] = chunk
        data['filename'] = filename
        data['range_time'] = range_time
        data['archieved'] = archieved
        task = threading.Thread(target=exporting, args=(data, ))
        task.start()
        return Response({"response": "exporting...."})
    else:
        raise serializers.ValidationError(
            {"response": _("user isn't validated to export")})




class TicketTransferModelViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    """Read-only list of transfers involving the caller's department."""
    queryset = (TicketTransfer.objects
                .select_related('ticket', 'from_department', 'to_department', 'transferred_by')
                .all())
    serializer_class = TicketTransferSerializer
    authentication_classes = (TokenAuthentication,)

    def get_queryset(self):
        qs = super().get_queryset()
        department = self.request.user.department
        if department is not None:
            qs = qs.filter(Q(from_department=department) | Q(to_department=department))
        ticket_id = self.request.query_params.get('ticket')
        return qs.filter(ticket_id=ticket_id) if ticket_id else qs
