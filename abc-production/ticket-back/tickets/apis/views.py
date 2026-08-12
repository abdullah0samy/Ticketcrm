import threading
from django.db.models import Q
from rest_framework import serializers
from rest_framework.response import Response
from rest_framework.decorators import action, api_view, permission_classes
from django.views.decorators.csrf import csrf_exempt
from rest_framework.status import HTTP_200_OK
from nested_multipart_parser.drf import DrfNestedParser
from rest_framework.parsers import JSONParser
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
        
        if option:
            for ticket in tickets:
                # transfer
                ticket.department = department
                ticket.save()
        else:
            for ticket in tickets:
                # transfer
                ticket.department = department
                ticket.save()
                # remove history
                ticket.history.all().delete()
                TicketComment.objects.filter(ticket=ticket).delete()
                
        return Response({"message": _("transfer successfully"), "status": HTTP_200_OK}, status=HTTP_200_OK)

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
    mixins.DestroyModelMixin, 
    viewsets.GenericViewSet
):
    queryset = TicketComment.objects.all().order_by('-id')
    serializer_class = TicketCommentSerializer
    authentication_classes = (TokenAuthentication,)
    pagination_class = ChatPagination

    def get_queryset(self, *args, **kwargs):
        pk = self.request.query_params.get('id', 0)
        return self.queryset.filter(ticket__id=pk).order_by('-id')



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
    queryset = Note.objects.all().order_by('-id')
    serializer_class = NoteSerializer
    authentication_classes = (TokenAuthentication,)
    permission_classes = (NotePermission, )

    def get_queryset(self):
        return self.queryset.filter(department=self.request.user.department).order_by('-id')


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


