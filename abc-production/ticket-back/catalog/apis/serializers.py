from rest_framework import serializers

from catalog.models import (Asset, AuditLog, Building, Floor,
                            KnowledgeArticle, KnowledgeCategory)
from users.models.models import Department, UserInfo


class BuildingSerializer(serializers.ModelSerializer):
    floors_count = serializers.IntegerField(source='floors.count', read_only=True)

    class Meta:
        model = Building
        fields = ['id', 'name_ar', 'name_en', 'code', 'is_active',
                  'floors_count', 'created_at']


class FloorSerializer(serializers.ModelSerializer):
    building_name = serializers.CharField(source='building.name_en', read_only=True)

    class Meta:
        model = Floor
        fields = ['id', 'building', 'building_name', 'name_ar', 'name_en',
                  'code', 'is_active', 'created_at']


class AssetSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source='department.name', read_only=True)

    class Meta:
        model = Asset
        fields = ['id', 'name', 'serial_number', 'asset_type', 'location',
                  'department', 'department_name', 'status', 'purchase_date',
                  'warranty_expiry', 'notes', 'created_at']


class KnowledgeCategorySerializer(serializers.ModelSerializer):
    articles_count = serializers.IntegerField(source='articles.count', read_only=True)

    class Meta:
        model = KnowledgeCategory
        fields = ['id', 'name_ar', 'name_en', 'is_active', 'articles_count', 'created_at']


class KnowledgeArticleSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name_en', read_only=True)
    author_name = serializers.SerializerMethodField()

    class Meta:
        model = KnowledgeArticle
        fields = ['id', 'category', 'category_name', 'title_ar', 'title_en',
                  'content_ar', 'content_en', 'author', 'author_name', 'views',
                  'is_active', 'created_at']
        extra_kwargs = {'author': {'read_only': True}, 'views': {'read_only': True}}

    def get_author_name(self, obj):
        return obj.author.get_full_name() if obj.author else None


class AuditLogSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()

    class Meta:
        model = AuditLog
        fields = ['id', 'user', 'user_name', 'action', 'entity_type', 'entity_id',
                  'old_data', 'new_data', 'ip_address', 'user_agent', 'created_at']

    def get_user_name(self, obj):
        return obj.user.get_full_name() if obj.user else None


class DepartmentAdminSerializer(serializers.ModelSerializer):
    users_count = serializers.IntegerField(source='userinfo_set.count', read_only=True)

    class Meta:
        model = Department
        fields = ['id', 'name', 'reciever', 'modules', 'sla_hours',
                  'discribtion', 'users_count', 'created_at']


class UserAdminSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source='department.name', read_only=True)
    role = serializers.CharField(source='get_role', read_only=True)
    full_name = serializers.SerializerMethodField()
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = UserInfo
        fields = ['id', 'fingerid', 'first_name', 'last_name', 'full_name',
                  'department', 'department_name', 'role', 'is_active',
                  'is_staff', 'is_superuser', 'password', 'date_joined']
        extra_kwargs = {'date_joined': {'read_only': True}}

    def get_full_name(self, obj):
        return obj.get_full_name() or str(obj.fingerid)

    def create(self, validated_data):
        password = validated_data.pop('password', None) or 'Change@123'
        user = UserInfo(**validated_data)
        user.set_password(password)
        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        if password:
            instance.set_password(password)
        return super().update(instance, validated_data)
