from django.urls import include, path
from rest_framework import routers

from catalog.apis.permissions_api import (DeptPermissionsViewSet,
                                          UserPermissionOverrideViewSet)
from catalog.apis.views import (AssetViewSet, AuditLogViewSet, BuildingViewSet,
                                DepartmentAdminViewSet, FloorViewSet,
                                KnowledgeArticleViewSet,
                                KnowledgeCategoryViewSet,
                                TicketTypeAdminViewSet, UserAdminViewSet)

app_name = "catalog"

router = routers.DefaultRouter()
# Explicit basenames: several of these share a queryset model or build it
# dynamically, so DRF cannot infer a unique name.
router.register("buildings", BuildingViewSet, basename="buildings")
router.register("floors", FloorViewSet, basename="floors")
router.register("departments", DepartmentAdminViewSet, basename="admin-departments")
router.register("ticket-types", TicketTypeAdminViewSet, basename="admin-ticket-types")
router.register("users", UserAdminViewSet, basename="admin-users")
router.register("assets", AssetViewSet, basename="assets")
router.register("knowledge-categories", KnowledgeCategoryViewSet, basename="kb-categories")
router.register("knowledge-articles", KnowledgeArticleViewSet, basename="kb-articles")
router.register("audit-logs", AuditLogViewSet, basename="audit-logs")
router.register("permission-sets", DeptPermissionsViewSet, basename="permission-sets")
router.register("user-permissions", UserPermissionOverrideViewSet, basename="user-permissions")

urlpatterns = [
    path("", include(router.urls)),
]
