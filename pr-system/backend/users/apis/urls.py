from django.urls import path

from users.apis.views import loginapi, profile

app_name = "users"

urlpatterns = [
    path("login/", loginapi),
    path("profile/", profile),
]
