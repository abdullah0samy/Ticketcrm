
import pandas as pd
from datetime import timedelta
from django.db.models import Value, F
from django.db.models.functions import Concat
from django.utils.timezone import now
from rest_framework import status, generics
from django.utils.translation import gettext_lazy as _
from ticket.permissions import TicketAdminOrCeoPermission
from pr.permissions import PRManagerOrCeoPermission
from ABCHospital.helpers import rangetime
from rest_framework import serializers
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend

from users.apis.serializers import ReceiverDepartmentSerializer
from users.models.models import Department
from users.models.choices import Roles

from ticket.models.models import Ticket
from ticket.models.choices import TicketStatus
from ticket.apis.serializers import TicketSerializer
from ticket.models.filters import TicketFilterSet

from pr.models.models import Survey
from pr.models.choices import SurveyType, QuestionType
from dashboard.utils import process_survey_data, transpose_dicts, calculate_aht


class GetTicketStatisticTableAPIView(generics.ListAPIView):
    permission_classes = [TicketAdminOrCeoPermission]
    queryset = (Ticket.objects.all() | Ticket.deleted_objects.all()).distinct() 
    serializer_class = TicketSerializer
    filter_backends = [SearchFilter, OrderingFilter, DjangoFilterBackend]
    search_fields = ["title", "description"]
    filterset_class = TicketFilterSet
    
    def get_queryset(self):
        # get tickerts 
        queryset = super().get_queryset()
        if not self.request.GET.get('created_at'):
            queryset = queryset.filter(created_at__gte=now() - timedelta(days=1))
             
        if self.request.user.get_role == Roles.ADMIN:
            return queryset
        return queryset.filter(department=self.request.user.department)
    
class TicketDashboardAPIView(APIView):
    permission_classes = [TicketAdminOrCeoPermission]

    def get(self, request, *args, **kwargs):
 
        range_time = request.GET.get('created_at', None)

        if range_time:
            try:
                start_time, end_time = rangetime(range_time)
            except:
                raise serializers.ValidationError(
                    {"ticket": _("invalid range time format")})
        else:
            start_time, end_time = now() - timedelta(days=1), now()

        if request.user.department:
            department = request.user.department
        else:
            if 'department' in request.GET:
                serializer = ReceiverDepartmentSerializer(data=request.GET)
                serializer.is_valid(raise_exception=True)

                department = Department.objects.get(pk=serializer.data['department'])
            else:
                departments = Department.objects.filter(reciever=True)
                if departments.exists():
                    department = departments.first()
                else:
                    department = None

        qs = Ticket.objects.filter(created_at__range=(start_time, end_time), department=department) | Ticket.deleted_objects.filter(
            created_at__range=(start_time, end_time), department=department)

        on_hold = qs.filter(status=TicketStatus.ON_HOLD).order_by("-id")
        complete = qs.filter(status=TicketStatus.COMPLETE).order_by("-id")
        in_progress = qs.filter(status=TicketStatus.IN_PROGRESS).order_by("-id")
        closed = qs.filter(status=TicketStatus.CLOSED).order_by("-id")
        
        number_all = qs.count()
        number_on_hold = on_hold.count()
        number_complete = complete.count()
        number_in_progress = in_progress.count()
        number_closed = closed.count()
        
        internal_tickets = qs.filter(is_external=False).count()
        external_tickets = qs.filter(is_external=True).count()
        
        period = (end_time - start_time).days

        df = pd.DataFrame(
            qs.annotate(
                issuetype_name=F('issuetype__name'),
                department_name=F('department__name'),
                complaint_department=F('complaint__department__name'),
                complaint_name=Concat('complaint__first_name',
                                    Value(' '), 'complaint__last_name')
            ).values(
                'created_at', 'complaint_name', 'complaint_department', 'department_name', 'issuetype_name', 'description', 'status', 'extension', 'floor', 'building'
            ))

        df.fillna({"issuetype_name": "unknown",
                "complaint_department": "Administration"}, inplace=True)

        most_issue_types = []
        most_departments = []

        if not df.empty:

            unique_issuetype = df.groupby(['issuetype_name'])['department_name'].count(
            ).sort_values(ascending=False).reset_index(name='count')
            unique_department = df.groupby(['complaint_department'])['department_name'].count(
            ).sort_values(ascending=False).reset_index(name='count')

            for i, row in unique_department.iterrows():
                most_departments.append(
                    {
                        "department": row['complaint_department'],
                        "count": row['count'],
                        "percent":  round(row['count'] / number_all * 100, 2) if number_all > 0 else 0,
                    }
                )

            for i, row in unique_issuetype.iterrows():
                most_issue_types.append(
                    {
                        "issuetype": row['issuetype_name'],
                        "count": row['count'],
                        "percent":  round(row['count'] / number_all * 100, 2) if number_all > 0 else 0,
                    }
                )

            data = {
                "tickets": {
                    "all": {
                        "count": number_all,
                        "rate":  (number_all / (100 * period))
                    },
                    "on_hold":number_on_hold,
                    "complete": number_complete,
                    "in_progress": number_in_progress,
                    "closed": number_closed,
                    "internal_tickets": internal_tickets,
                    "external_tickets": external_tickets,
                    "aht": f"{calculate_aht(qs)}".split('.')[0]
                },
                "most_issuetypes": most_issue_types[: 10] if len(most_issue_types) > 10 else most_issue_types,
                "most_departments": most_departments[: 10] if len(most_departments) > 10 else most_departments,
                "status": status.HTTP_200_OK
            }
        else:
            data = {
                "tickets": {
                    "all": {
                        "count": 0,
                        "rate": 0
                    },
                    "on_hold":  0,
                    "in_progress": 0,
                    "complete": 0,
                    "closed": 0,
                    "internal_tickets": 0,
                    "external_tickets": 0,
                    "aht": "00:00:00"
                },
                "most_issuetypes": most_issue_types,
                "most_departments": most_departments,
                "status": status.HTTP_200_OK
            }
        return Response(data, status=status.HTTP_200_OK)



class SurveyDashboardAPIView(APIView):
    permission_classes = [PRManagerOrCeoPermission]

    def get(self, request, *args, **kwargs):
 
        range_time = request.GET.get('created_at', None)

        if range_time:
            try:
                start_time, end_time = rangetime(range_time)
            except:
                raise serializers.ValidationError(
                    {"pr": _("invalid range time format")})
        else:
            start_time, end_time = now() - timedelta(days=1), now()

        qs = Survey.objects.filter(created__range=(start_time, end_time)) 
        number_all = qs.count()
        
        satisfied = qs.filter(satisfied=True).order_by("-id")
        number_satisfied = satisfied.count()
        
        inpatient = qs.filter(flag=False).order_by("-id")
        inpatient_count = inpatient.count()
        outpatient = qs.filter(flag=True).order_by("-id")
        outpatient_count = outpatient.count()
        
        unsatisfied = qs.filter(satisfied=False).annotate(
            doctor=F('info__doctor'), 
            patient=F('info__patient'),
            medical_no=F('info__admission_no')
            
        ).values('id', 'doctor', 'patient', 'medical_no', 'comment')  
                
        # Process inpatient and outpatient data
        inpatient_result_df = process_survey_data(inpatient)
        outpatient_result_df = process_survey_data(outpatient)

        inpatient_dict = {"inpatient": inpatient_result_df.transpose().to_dict()}
        outpatient_dict = {"outpatient": outpatient_result_df.transpose().to_dict()}
        
        categories = transpose_dicts(inpatient_dict, outpatient_dict)
        
        data = {
            "counts": {
                "all": number_all,
                "inpatient": inpatient_count,
                "outpatient": outpatient_count,
                "overall_rate": (number_satisfied/number_all) * 100 if number_all > 0 else 0,
                "inpatient": {
                      "inperson": inpatient.filter(survey_type=SurveyType.IN_PERSON).count(), 
                      "call": inpatient.filter(survey_type=SurveyType.CALL).count()
                },
                "outpatient": {
                      "inperson": outpatient.filter(survey_type=SurveyType.IN_PERSON).count(),
                      "call": outpatient.filter(survey_type=SurveyType.CALL).count()
                }
            },
            "categories": categories,
            "unsatisfied": unsatisfied[:10] if len(unsatisfied) > 10 else unsatisfied,
            "status": status.HTTP_200_OK
        }
        return Response(data, status=status.HTTP_200_OK)
