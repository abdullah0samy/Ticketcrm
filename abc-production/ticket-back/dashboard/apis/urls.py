from django.urls import path

from dashboard.apis.views import TicketDashboardAPIView, SurveyDashboardAPIView, GetTicketStatisticTableAPIView
from dashboard.apis.summary import DashboardSummaryAPIView





app_name = "dashboard"

urlpatterns = [
    path('ticket_statistic_table/', GetTicketStatisticTableAPIView.as_view(), name='ticket_statistic_table'),
    path('summary/', DashboardSummaryAPIView.as_view(), name='dashboard_summary'),
    path('ticket/', TicketDashboardAPIView.as_view(), name='ticket_dashboard'),
    path('pr/', SurveyDashboardAPIView.as_view(), name='pr_dashboard'),

]