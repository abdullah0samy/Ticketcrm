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
from django.urls import path, include
from fcm_django.api.rest_framework import FCMDeviceAuthorizedViewSet

from users.apis.views import *

app_name = 'users'


urlpatterns = [
    # funcation based apis
    path('login/', loginapi),
    path('profile/', profile),
    path('change-password/', change_password),
    # class based apis
    path('router/department/select/', DepartmentModelViewSet.as_view({'get': 'select'})),
    path('router/notification/', NotificationModelViewSet.as_view({'get': 'list', "delete": 'delete'})),
    # fcm apis
    path('fcm/devices/', FCMDeviceAuthorizedViewSet.as_view({'post': 'create'})),
]
