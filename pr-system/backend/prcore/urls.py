"""URL configuration for the standalone PR service.

The whole service is mounted under `/api/pr/` so it keeps the exact same public
paths it had inside the monolith — an nginx/proxy rule can route `/api/pr/*` to
this service without any client change.
"""
from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from django.views.generic import RedirectView
from drf_yasg import openapi
from drf_yasg.views import get_schema_view
from rest_framework import permissions

from pr.apis.dashboard import SurveyDashboardAPIView

schema_view = get_schema_view(
    openapi.Info(
        title="ABC Hospital — PR Service API",
        default_version="v1",
        description="Patient Relations & Satisfaction service (extracted from the ABCHospital monolith).",
    ),
    public=settings.DEBUG,
    permission_classes=(permissions.AllowAny,) if settings.DEBUG else (permissions.IsAdminUser,),
)

urlpatterns = [
    # API-only service: send "/" to the docs instead of returning a bare 404.
    path("", RedirectView.as_view(url="/swagger/", permanent=False), name="pr-root"),

    path("admin/", admin.site.urls),

    # Authentication. The token table is shared with the ticketing monolith, so
    # tokens issued here work there too — the service is standalone without
    # forcing users to hold two sessions.
    path("api/users/", include("users.apis.urls")),

    # Same public path as in the monolith, so clients need no change.
    path("api/pr/", include("pr.apis.urls")),

    # The survey dashboard lived in the monolith's `dashboard` app and was not
    # carried over with the split, so the Statistics screen was calling a URL
    # that returned 404 here. Same path as before, so the client is unchanged.
    path("api/dashboard/pr/", SurveyDashboardAPIView.as_view(), name="pr-dashboard"),

    path("swagger<format>/", schema_view.without_ui(cache_timeout=0), name="schema-json"),
    path("swagger/", schema_view.with_ui("swagger", cache_timeout=0), name="schema-swagger-ui"),
    path("redoc/", schema_view.with_ui("redoc", cache_timeout=0), name="schema-redoc"),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
