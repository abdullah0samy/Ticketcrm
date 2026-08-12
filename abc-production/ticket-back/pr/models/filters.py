
import django_filters
from pr.models.models import SurveyQuestion, Survey


class QuestionSurveyFilter(django_filters.FilterSet):
    status = django_filters.BooleanFilter(method="get_status", required=True)

    class Meta:
        model = SurveyQuestion
        fields = [
            "status",
        ]

    def get_status(self, queryset, name, value):
        if value == True:
            return queryset.filter(template__flag=True)
        return queryset.filter(template__flag=False)




class SurveyFilter(django_filters.FilterSet):
    satisfied = django_filters.BooleanFilter(method="get_satisfied", required=True)

    class Meta:
        model = Survey
        fields = [
            "satisfied",
        ]

    def get_satisfied(self, queryset, name, value):
        if value == True:
            return queryset.filter(satisfied=True)
        return queryset.filter(satisfied=False)

