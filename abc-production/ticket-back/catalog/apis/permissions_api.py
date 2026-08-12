"""Read/write the permission matrix: department defaults and per-user overrides."""
from rest_framework import serializers, viewsets
from rest_framework.authentication import TokenAuthentication
from rest_framework.decorators import action
from rest_framework.permissions import BasePermission, IsAuthenticated
from rest_framework.response import Response
from rest_framework.status import HTTP_200_OK, HTTP_400_BAD_REQUEST

from users.models.choices import Roles
from users.models.models import Department, UserInfo
from users.models.permissions import (PERMISSION_FLAGS, DeptPermissions,
                                      UserPermissionOverride)
from users.permissions_resolver import get_permissions, invalidate, invalidate_all


class IsAdminRoleStrict(BasePermission):
    """Admins only, reads included.

    Unlike the reference-data `IsAdminRole`, this does not open GET to every
    authenticated user: the permission matrix says who can do what across the
    whole organisation, and per-user overrides are nobody else's business.
    """

    def has_permission(self, request, view):
        user = request.user
        return bool(user and user.is_authenticated and user.get_role == Roles.ADMIN)


class DeptPermissionsSerializer(serializers.ModelSerializer):
    departments = serializers.SerializerMethodField()

    class Meta:
        model = DeptPermissions
        fields = ['id', 'departments'] + PERMISSION_FLAGS

    def get_departments(self, obj):
        return [{"id": d.id, "name": d.name} for d in obj.departments.all()]


class UserPermissionOverrideSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()

    class Meta:
        model = UserPermissionOverride
        fields = ['id', 'user', 'user_name', 'allowed_transfer_dept_ids'] + PERMISSION_FLAGS

    def get_user_name(self, obj):
        return obj.user.get_full_name() or str(obj.user.fingerid)


class DeptPermissionsViewSet(viewsets.ModelViewSet):
    """Permission sets that departments point at."""
    queryset = DeptPermissions.objects.prefetch_related('departments').order_by('id')
    serializer_class = DeptPermissionsSerializer
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAdminRoleStrict,)

    def perform_create(self, serializer):
        serializer.save()
        invalidate_all()

    def perform_update(self, serializer):
        serializer.save()
        invalidate_all()

    @action(detail=False, methods=['get'])
    def flags(self, request):
        """The catalogue of capability names, for building the UI matrix."""
        return Response({"results": PERMISSION_FLAGS}, status=HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def assign_department(self, request, pk=None):
        """Point a department at this permission set."""
        permission_set = self.get_object()
        department_id = request.data.get('department')
        department = Department.objects.filter(id=department_id).first()
        if department is None:
            return Response({"department": "not found"}, status=HTTP_400_BAD_REQUEST)
        department.default_permissions = permission_set
        department.save(update_fields=['default_permissions'])
        invalidate_all()
        return Response({"message": "assigned"}, status=HTTP_200_OK)


class UserPermissionOverrideViewSet(viewsets.ModelViewSet):
    """Per-user exceptions. NULL on a flag means 'inherit the department default'."""
    queryset = UserPermissionOverride.objects.select_related('user').order_by('id')
    serializer_class = UserPermissionOverrideSerializer
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAdminRoleStrict,)

    def get_permissions(self):
        # Anyone may ask what *they* can do — `effective` narrows that below.
        if self.action == 'effective':
            return [IsAuthenticated()]
        return super().get_permissions()

    def get_queryset(self):
        qs = super().get_queryset()
        user_id = self.request.query_params.get('user')
        return qs.filter(user_id=user_id) if user_id else qs

    def perform_create(self, serializer):
        obj = serializer.save()
        invalidate(obj.user_id)

    def perform_update(self, serializer):
        obj = serializer.save()
        invalidate(obj.user_id)

    def perform_destroy(self, instance):
        user_id = instance.user_id
        instance.delete()
        invalidate(user_id)

    @action(detail=False, methods=['get'])
    def effective(self, request):
        """Resolved permissions for a user — what actually applies after merging.

        Non-admins may only ask about themselves.
        """
        user_id = request.query_params.get('user')
        is_admin = request.user.get_role == Roles.ADMIN
        if not user_id or not is_admin:
            user = request.user
        else:
            user = UserInfo.objects.filter(id=user_id).first()
        if user is None:
            return Response({"user": "not found"}, status=HTTP_400_BAD_REQUEST)
        return Response(
            {
                "user": user.id,
                "user_name": user.get_full_name() or str(user.fingerid),
                "role": user.get_role,
                "permissions": get_permissions(user, use_cache=False),
            },
            status=HTTP_200_OK,
        )
