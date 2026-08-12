from functools import reduce
import operator
from django.db.models import Q
from django.contrib.auth import authenticate
from rest_framework.response import Response
from rest_framework.decorators import (action, api_view, permission_classes)
from rest_framework.permissions import (AllowAny, IsAuthenticated)
from django.views.decorators.csrf import csrf_exempt
from rest_framework.status import (
    HTTP_200_OK,
    HTTP_204_NO_CONTENT
)
from rest_framework.viewsets import ModelViewSet
from rest_framework.authentication import TokenAuthentication
from rest_framework.authtoken.models import Token
from django.utils.translation import gettext_lazy as _

from users.models.models import *
from users.apis.serializers import *
from users.signals.signals import *
from ABCHospital.views.mixins import SelectModeSerializerMixin


class DepartmentModelViewSet(SelectModeSerializerMixin, ModelViewSet):
    queryset = Department.objects.all().order_by('-id')
    serializer_class = DepartmentSerializer
    selectserializer_class = SelectDepartmentSerializer
    authentication_classes = (TokenAuthentication,)
    http_method_names = ['get']
    
    def get_queryset(self):
        standards = ['name', 'reciever', 'created_at']

        filters = {k: v for k, v in dict(
            self.request.query_params).items() if k in standards}

        qs = []
        for k, vs in filters.items():
            if k in ['name']:
                qs.append(
                    reduce(operator.or_, (Q(**{"%s__%s" % (k, "contains"): v}) for v in vs)))

            elif k in ['created_at']:
                qs.append(reduce(
                    operator.or_, (Q(**{"%s__%s" % (k, "range"): rangetime(v)}) for v in vs)))
        if self.request.GET.get('reciever', False) == 'true':
            if self.request.user.department:
                return self.queryset.exclude(id=self.request.user.department.id).filter(*qs, reciever=True).order_by('-id')
            else:
                return self.queryset.filter(*qs, reciever=True).order_by('-id')

        elif self.request.GET.get('reciever', False) == 'false':
            return self.queryset.filter(*qs, reciever=False).order_by('-id')

        return self.queryset.filter(*qs).order_by('-id')


    @action(detail=False, methods=['get'])
    def select(self, request, *args, **kwargs):
        queryset = self.get_queryset(*args, **kwargs)
        serializer = self.get_serializer_class(*args, **kwargs)(queryset, many=True, read_only=True, context={"request": request, 'view': self}) 
    
        data = {
            "results": serializer.data,
            "message": _("selected successfully"),
            "status": HTTP_200_OK
        }
        return Response(data, status=HTTP_200_OK)


class NotificationModelViewSet(ModelViewSet):
    queryset = Notification.objects.all().order_by('-id')
    serializer_class = NotificationSerializer
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated, )
    http_method_names = ['get', 'delete']

    def get_queryset(self):
        standards = ['types', 'created_at']
        filters = {k: v for k, v in dict(
            self.request.query_params).items() if k in standards}

        qs = []
        for k, vs in filters.items():
            if k in ['types']:
                qs.append(
                    reduce(operator.or_, (Q(**{"%s" % (k, ): v}) for v in vs)))
            elif k in ['created_at']:
                qs.append(reduce(
                    operator.or_, (Q(**{"%s__%s" % (k, "range"): rangetime(v)}) for v in vs)))

        return self.queryset.filter(*qs, user=self.request.user).order_by('-id')

    def list(self, request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)
        data = response.data

        queryset = self.get_queryset().filter(read=False)
        queryset.update(read=True)

        if isinstance(data, dict):
            data["status"] = response.status_code
            data["message"] = _("got successfully")
        else:
            data = {
                "results": data,
                'message': _("got successfully"),
                "status": response.status_code
            }

        return Response(data, status=response.status_code)

    @action(detail=True, methods=['delete'])
    def delete(self, request, pk=None, *args, **kwargs):
        instance = self.get_object()
        instance.delete()
        return Response(status=HTTP_204_NO_CONTENT)


@csrf_exempt
@api_view(["POST"])
@permission_classes((AllowAny,))
def loginapi(request):
    serializer = LoginSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    
    from catalog.audit import record as audit_record

    fingerid = serializer.data["fingerid"]
    password = serializer.data["password"]
    GetUser = UserInfo.objects.filter(fingerid=fingerid)
    if GetUser.exists():
        fingerid = GetUser.get().fingerid
        userLog = authenticate(fingerid=fingerid, password=password)
        if userLog:
            token, __ = Token.objects.get_or_create(user=userLog)
            serializer = UserSerializer(
                userLog, read_only=True, context={"request": request})
            data = serializer.data
            data['token'] = token.key
            data['status'] = HTTP_200_OK
            data['message'] = _('Sign-in successful')
            # Sign-ins and failed attempts are the first thing an auditor asks
            # for; the signal-based trail cannot see them because nothing is saved.
            audit_record("LOGIN_SUCCESS", "UserInfo", userLog.pk, user=userLog,
                         new_data={"fingerid": fingerid})
            return Response(data, status=HTTP_200_OK)
        else:
            audit_record("LOGIN_FAILED", "UserInfo", GetUser.get().pk, user=None,
                         new_data={"fingerid": fingerid, "reason": "bad password"})
            raise serializers.ValidationError(
                {"error": _("fingerid or password worng")})
    else:
        audit_record("LOGIN_FAILED", "UserInfo", None, user=None,
                     new_data={"fingerid": fingerid, "reason": "unknown fingerid"})
        raise serializers.ValidationError(
            {"error": _("fingerid or password worng")})


@api_view(['GET', "PUT", "PATCH"])
@csrf_exempt
@permission_classes((IsAuthenticated,))
def profile(request):
    if request.method in ["PUT", "PATCH"]:
        serializer = UserProfileSerializer(
            request.user, data=request.data, partial=True, context={"request": request})

        serializer.is_valid(raise_exception=True)

        status = HTTP_200_OK
        serializer.update(request.user, serializer.validated_data)
        data = serializer.data
        data['status'] = status
        data['message'] = _("updated successfully")

    elif request.method == "GET":
        status = HTTP_200_OK
        serializer = UserProfileSerializer(
            request.user, read_only=True, context={"request": request})
        data = serializer.data
        
        data['status'] = status
        data['message'] = _("got successfully.")
    
    return Response(data, status=HTTP_200_OK)


@api_view(['PATCH'])
@csrf_exempt
@permission_classes((IsAuthenticated,))
def change_password(request):
    serializer = ChangePasswordSerializer(data=request.data, context={"request": request})
    serializer.is_valid(raise_exception=True)
    
    old_pass = serializer.data['old_password']
    new_pass = serializer.data['new_password']
    confirm_pass = serializer.data['confirm_new_password']

    user = authenticate(fingerid=request.user.fingerid, password=old_pass)

    if new_pass == old_pass:
        raise serializers.ValidationError(
            {"password": _("you used your old password.Please try new one.")})
    elif not user:
        raise serializers.ValidationError(
            {"password": _("old password is wrong.")})
    elif not new_pass == confirm_pass:
        raise serializers.ValidationError(
            {"password": _("password does not match")})

    status = HTTP_200_OK
    request.user.set_password(new_pass)
    request.user.save()
    data = {
        "message": 'Password edited successfuly!',
        "status": status
    }
    return Response(data, status=status)
