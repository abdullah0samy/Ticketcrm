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

# Explicit basenames are required: several viewsets share the same queryset model
# (Ticket for ticket/restore, ImportExportFile for exports/imports), and DRF derives
# the basename from the model — so without these it raises
# "Router with basename ... is already registered".
router.register('ticket', TicketModelViewSet, basename='ticket')
router.register('comment', TicketCommentModelViewSet, basename='comment')
router.register('note', NoteModelViewSet, basename='note')
router.register('note-comment', NoteCommentModelViewSet, basename='note-comment')
router.register('restore', RestoreTicketModelViewSet, basename='restore')
router.register('history', HistoryTicketModelViewSet, basename='history')
router.register('transfers', TicketTransferModelViewSet, basename='transfers')
router.register('exports', ExportFileModelViewSet, basename='exports')
router.register('imports', ImportFileModelViewSet, basename='imports')
router.register('issuetypes', ISSUESTypeModelViewSet, basename='issuetypes')

urlpatterns = [
    # funcation based apis
    path('export/', export_data),
    # class based apis
    path('router/', include(router.urls)),   
]