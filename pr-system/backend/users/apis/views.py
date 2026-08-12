from django.contrib.auth import authenticate
from django.utils.translation import gettext_lazy as _
from rest_framework import serializers
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.status import HTTP_200_OK

from users.apis.serializers import LoginSerializer, UserSerializer
from users.models.models import UserInfo


@api_view(["POST"])
@permission_classes((AllowAny,))
def loginapi(request):
    """Issue a DRF token for a `fingerid` + password pair.

    The token table is shared with the ticketing monolith, so a token minted here
    is equally valid there and vice-versa — that is what keeps the split
    transparent to users while the two services run side by side.
    """
    serializer = LoginSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    fingerid = serializer.data["fingerid"]
    password = serializer.data["password"]

    if not UserInfo.objects.filter(fingerid=fingerid).exists():
        raise serializers.ValidationError({"error": _("fingerid or password wrong")})

    user = authenticate(fingerid=fingerid, password=password)
    if not user:
        raise serializers.ValidationError({"error": _("fingerid or password wrong")})

    token, _created = Token.objects.get_or_create(user=user)
    data = UserSerializer(user, context={"request": request}).data
    data["token"] = token.key
    data["status"] = HTTP_200_OK
    data["message"] = _("Sign-in successful")
    return Response(data, status=HTTP_200_OK)


@api_view(["GET"])
@permission_classes((IsAuthenticated,))
def profile(request):
    """Current user — used by the SPA to restore a session on reload."""
    return Response(UserSerializer(request.user, context={"request": request}).data)
