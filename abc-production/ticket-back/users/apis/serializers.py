
from rest_framework import serializers
from django.utils.translation import gettext_lazy as _
from users.models.models import *
from ABCHospital.constants import ADMIN_DEPARTMENT
from ABCHospital.helpers import Serializer


# User Serializer
class LoginSerializer(serializers.Serializer):
    fingerid = serializers.CharField(required=True)
    password = serializers.CharField(required=True)

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)
    confirm_new_password = serializers.CharField(required=True)
    
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserInfo
        fields = ['id', 'first_name', 'last_name',  'fingerid',
                  'password', 'image', 'department', 'is_staff', 'is_superuser']
        extra_kwargs = {
            'password': {'write_only': True},
        }

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = UserInfo.objects.create(**validated_data)
        user.set_password(password)
        return user

    def update(self, instance, validated_data):

        if validated_data.get('password', None):
            instance.set_password(validated_data.pop('password'))
        return super(UserSerializer, self).update(instance=instance, validated_data=validated_data)

    def to_representation(self, instance):
        data = super(UserSerializer, self).to_representation(instance)
        # phone_parser = phonenumbers.parse(instance.phone) if instance.phone else None
        data.update(
            department=Serializer(self.context['request'], instance, 'department', ['id', 'name', 'reciever', 'modules'], True).serialize() if instance.department else ADMIN_DEPARTMENT,
        )
        return data


class UserProfileSerializer(UserSerializer):
    role = serializers.SerializerMethodField('get_role')
    notifications_count = serializers.SerializerMethodField('get_notifications_count')
    class Meta:
        model = UserInfo
        fields = ['id', 'first_name', 'last_name',  'fingerid',
                  'password', 'image', 'department', 'is_staff', 'is_superuser', 'role', 'notifications_count']
        extra_kwargs = {
            'password': {'write_only': True},
        }

    def get_role(self, obj):
        return obj.get_role

    def get_notifications_count(self, obj):
        return Notification.objects.filter(user=obj, read=False).count()

    


class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = ['id', 'name', 'reciever']


class ReceiverDepartmentSerializer(serializers.Serializer):
    department = serializers.PrimaryKeyRelatedField(
        queryset=Department.objects.filter(reciever=True)
    )
    
class SelectDepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model =  Department
        fields = ['id', 'name']
        extra_kwargs = {
            'name': {'read_only': True}, 
            "id":  {'read_only': True}, 
        } 

    def to_representation(self, instance):
        data = super(self.__class__, self).to_representation(instance)        
        data['label'] = data.pop('name', None)
        data['value'] = data.pop('id', None)
        return data


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        exclude = ['user']
