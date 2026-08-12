"""Admin CRUD surfaces for reference data, assets, the knowledge base and the audit log."""
from django.db.models import Q
from rest_framework import mixins, viewsets
from rest_framework.authentication import TokenAuthentication
from rest_framework.decorators import action
from rest_framework.permissions import BasePermission, IsAuthenticated
from rest_framework.response import Response
from rest_framework.status import HTTP_200_OK

from catalog.apis.serializers import (AssetSerializer, AuditLogSerializer,
                                      BuildingSerializer,
                                      DepartmentAdminSerializer, FloorSerializer,
                                      KnowledgeArticleSerializer,
                                      KnowledgeCategorySerializer,
                                      UserAdminSerializer)
from catalog.models import (Asset, AuditLog, Building, Floor, KnowledgeArticle,
                            KnowledgeCategory)
from users.models.choices import Roles
from users.models.models import Department, UserInfo


class IsAdminRole(BasePermission):
    """Only global admins (users with no department) may manage reference data."""

    def has_permission(self, request, view):
        user = request.user
        if not (user and user.is_authenticated):
            return False
        if request.method in ("GET", "HEAD", "OPTIONS"):
            return True
        return user.get_role == Roles.ADMIN


class SearchableModelViewSet(viewsets.ModelViewSet):
    """Shared CRUD behaviour: token auth, admin-gated writes, `?search=`."""
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAdminRole,)
    search_fields = ()

    def get_queryset(self):
        qs = super().get_queryset()
        term = self.request.query_params.get("search", "").strip()
        if term and self.search_fields:
            query = Q()
            for field in self.search_fields:
                query |= Q(**{f"{field}__icontains": term})
            qs = qs.filter(query)
        return qs


class BuildingViewSet(SearchableModelViewSet):
    queryset = Building.objects.all()
    serializer_class = BuildingSerializer
    search_fields = ("name_ar", "name_en", "code")


class FloorViewSet(SearchableModelViewSet):
    queryset = Floor.objects.select_related("building").all()
    serializer_class = FloorSerializer
    search_fields = ("name_ar", "name_en", "code", "building__name_en")

    def get_queryset(self):
        qs = super().get_queryset()
        building = self.request.query_params.get("building")
        return qs.filter(building_id=building) if building else qs


class AssetViewSet(SearchableModelViewSet):
    queryset = Asset.objects.select_related("department").all()
    serializer_class = AssetSerializer
    search_fields = ("name", "serial_number", "asset_type", "location")

    def get_queryset(self):
        qs = super().get_queryset()
        status_filter = self.request.query_params.get("status")
        return qs.filter(status=status_filter) if status_filter else qs


class DepartmentAdminViewSet(SearchableModelViewSet):
    queryset = Department.objects.all().order_by("name")
    serializer_class = DepartmentAdminSerializer
    search_fields = ("name",)


class TicketTypeAdminViewSet(SearchableModelViewSet):
    """CRUD for ISSUESType — the ticket/issue categories."""
    serializer_class = None  # set below to avoid a circular import at module load
    search_fields = ("name",)

    def get_serializer_class(self):
        from ticket.apis.serializers import ISSUESTypeSerializer
        return ISSUESTypeSerializer

    def get_queryset(self):
        from ticket.models.models import ISSUESType
        qs = ISSUESType.objects.select_related("department").all().order_by("name")
        term = self.request.query_params.get("search", "").strip()
        if term:
            qs = qs.filter(name__icontains=term)
        department = self.request.query_params.get("department")
        return qs.filter(department_id=department) if department else qs


class UserAdminViewSet(SearchableModelViewSet):
    queryset = UserInfo.objects.select_related("department").all().order_by("first_name")
    serializer_class = UserAdminSerializer
    search_fields = ("first_name", "last_name", "fingerid")

    @action(detail=True, methods=["patch"])
    def toggle_active(self, request, pk=None):
        user = self.get_object()
        user.is_active = not user.is_active
        user.save(update_fields=["is_active"])
        return Response(self.get_serializer(user).data, status=HTTP_200_OK)

    @action(detail=True, methods=["patch"])
    def reset_password(self, request, pk=None):
        user = self.get_object()
        new_password = request.data.get("password") or "Change@123"
        user.set_password(new_password)
        user.save()
        return Response({"message": "password updated"}, status=HTTP_200_OK)


class KnowledgeCategoryViewSet(SearchableModelViewSet):
    queryset = KnowledgeCategory.objects.all()
    serializer_class = KnowledgeCategorySerializer
    search_fields = ("name_ar", "name_en")
    # Reading the KB is open to every authenticated user; writing stays admin-only.
    permission_classes = (IsAdminRole,)


class KnowledgeArticleViewSet(SearchableModelViewSet):
    queryset = KnowledgeArticle.objects.select_related("category", "author").all()
    serializer_class = KnowledgeArticleSerializer
    search_fields = ("title_ar", "title_en", "content_ar", "content_en")

    def get_queryset(self):
        qs = super().get_queryset()
        category = self.request.query_params.get("category")
        return qs.filter(category_id=category) if category else qs

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated])
    def view(self, request, pk=None):
        """Increment the read counter without a full update round-trip."""
        article = self.get_object()
        KnowledgeArticle.objects.filter(pk=article.pk).update(views=article.views + 1)
        return Response({"views": article.views + 1}, status=HTTP_200_OK)


class AuditLogViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin,
                      viewsets.GenericViewSet):
    """Read-only: the audit trail must never be edited through the API."""
    queryset = AuditLog.objects.select_related("user").all()
    serializer_class = AuditLogSerializer
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        qs = super().get_queryset()
        params = self.request.query_params
        if params.get("action"):
            qs = qs.filter(action=params["action"])
        if params.get("entity_type"):
            qs = qs.filter(entity_type=params["entity_type"])
        if params.get("entity_id"):
            qs = qs.filter(entity_id=params["entity_id"])
        if params.get("user"):
            qs = qs.filter(user_id=params["user"])
        return qs

    @action(detail=False, methods=["get"])
    def actions(self, request):
        """Distinct action names, for populating a filter dropdown."""
        names = AuditLog.objects.values_list("action", flat=True).distinct().order_by("action")
        return Response({"results": list(names)}, status=HTTP_200_OK)
