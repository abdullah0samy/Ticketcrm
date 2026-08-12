from django.urls import path

from dashboard.apis.views import TicketDashboardAPIView, SurveyDashboardAPIView





app_name = "dashboard"

urlpatterns = [
    path('ticket/', TicketDashboardAPIView.as_view(), name='ticket_dashboard'),
    path('pr/', SurveyDashboardAPIView.as_view(), name='pr_dashboard'),

]
