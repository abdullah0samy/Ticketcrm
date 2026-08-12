from rest_framework import serializers

from prcore.constants import ADMIN_DEPARTMENT
from users.models.models import Department, UserInfo


class LoginSerializer(serializers.Serializer):
    fingerid = serializers.CharField(required=True)
    password = serializers.CharField(required=True)


class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = ["id", "name", "reciever", "modules"]


class UserSerializer(serializers.ModelSerializer):
    """Mirrors the monolith's user payload so the extracted screens keep working.

    A user with no department is a global admin; the monolith represents that with
    a synthetic department object rather than `null`, and the frontend relies on it
    (it reads `department.modules`), so the same shape is reproduced here.
    """

    # The frontend gates every screen on this value (`CanView allowed={[...]}`).
    # It was missing from the extracted payload, so `role` came through as
    # undefined, every gate failed closed and the home page rendered empty.
    role = serializers.SerializerMethodField()

    class Meta:
        model = UserInfo
        fields = [
            "id", "first_name", "last_name", "fingerid",
            "image", "department", "is_staff", "is_superuser", "role",
        ]

    def get_role(self, obj):
        return obj.get_role

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data["department"] = (
            DepartmentSerializer(instance.department).data
            if instance.department
            else ADMIN_DEPARTMENT
        )
        return data
