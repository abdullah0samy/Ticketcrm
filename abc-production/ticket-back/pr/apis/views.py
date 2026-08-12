from django.utils.translation import gettext_lazy as _
from rest_framework import viewsets, mixins, views
from rest_framework.response import Response
from rest_framework.authentication import TokenAuthentication
from pr.models.models import *
from pr.models.filters import *
from pr.permissions import *
from pr.apis.serializers import *
from pr.signals.signals import *
from ABCHospital.helpers import *


class SatisfyMessageView(views.APIView):
    authentication_classes = (TokenAuthentication,)
    permission_classes = (PRAgentPermission,)
    
    def get(self, request, format=None):
        """
        Return satisfy message.
        """
        is_satisfied = request.GET.get("satisfied", 'true') == 'true'
        message_config = PRSiteConfig.get_solo()
        if is_satisfied:
            message = message_config.satisfied_message
        else:
            message = message_config.unsatisfied_message
        return Response({"message": message})
    
class QuestionModelViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    queryset = SurveyQuestion.objects.all().order_by('-order')
    serializer_class = SurveyQuestionSerializer
    authentication_classes = (TokenAuthentication,)
    permission_classes = (PRAgentPermission,)
    filterset_class = QuestionSurveyFilter
    pagination_class = None


class SurveyModelViewSet(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin, 
    viewsets.GenericViewSet
):
    queryset = Survey.objects.all().order_by('-id')
    serializer_class = SurveySerializer
    permission_classes = (PRSurveyPermission,)
    authentication_classes = (TokenAuthentication,)
    filterset_class = SurveyFilter

