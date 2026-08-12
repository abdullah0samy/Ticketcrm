"""ABCHospital URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.urls import path, include, re_path
from rest_framework import routers

from ticket.apis.views import *

app_name = 'ticket'

router = routers.DefaultRouter()

router.register('ticket', TicketModelViewSet)
router.register('comment', TicketCommentModelViewSet)
router.register('note', NoteModelViewSet)
router.register('restore', RestoreTicketModelViewSet)
router.register('history', HistoryTicketModelViewSet)
router.register('exports', ExportFileModelViewSet)
router.register('imports', ImportFileModelViewSet)
router.register('issuetypes', ISSUESTypeModelViewSet)

urlpatterns = [
    # funcation based apis
    path('export/', export_data),
    # class based apis
    path('router/', include(router.urls)),   
]