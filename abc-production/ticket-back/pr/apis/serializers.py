from rest_framework import serializers
from django.utils.translation import gettext_lazy as _
from pr.models.models import *
from ABCHospital.helpers import Serializer
from django.db import transaction


class SurveyQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = SurveyQuestion
        exclude = ['template', 'id']


class SurveyAnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = SurveyAnswer
        exclude = ['id']


class SurveyInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = SurveyInfo
        exclude = ['id']



class SurveySerializer(serializers.ModelSerializer):
    info = SurveyInfoSerializer()
    answers = SurveyAnswerSerializer(many=True, allow_empty=False)
    class Meta:
        model = Survey
        fields = '__all__'


    def create(self, validated_data):
        with transaction.atomic():
            info_data = validated_data.pop('info')
            info_serializer = self.fields['info']
            info = info_serializer.create(info_data)
            
            answers_data = validated_data.pop('answers', [])
            answers = []
            for answer_data in answers_data:
                answer = SurveyAnswer.objects.create(**answer_data)
                answers.append(answer)

            instance = self.Meta.model.objects.create(info=info, **validated_data)
            instance.answers.set(answers)
            return instance