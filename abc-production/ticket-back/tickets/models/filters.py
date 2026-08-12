import operator
from ticket.models.models import *
from functools import reduce
from django.db.models import Q
import django_filters
from ABCHospital.helpers import *


class TicketFilterSet(django_filters.FilterSet):
    # Define filters for each field
    id = django_filters.CharFilter(method='filter_id')
    department = django_filters.CharFilter(method='filter_department')
    status = django_filters.CharFilter(method='filter_status')
    issuetype = django_filters.CharFilter(method='filter_issuetype')
    created_at = django_filters.CharFilter(method='filter_created_at')
    me = django_filters.BooleanFilter(method='filter_me')  # Add BooleanFilter for 'me'

    def filter_id(self, queryset, name, value):
        return queryset.filter(reduce(operator.or_, [Q(id=v) for v in value.split(',')]))

    def filter_department(self, queryset, name, value):
        return queryset.filter(reduce(operator.or_, [Q(department__id=v) if v != "0" else Q(department__id=None) for v in value.split(',')]))

    def filter_status(self, queryset, name, value):
        return queryset.filter(reduce(operator.or_, [Q(status=v) for v in value.split(',')]))

    def filter_issuetype(self, queryset, name, value):
        return queryset.filter(reduce(operator.or_, [Q(issuetype__id=v) if v != "0" else Q(issuetype__id=None) for v in value.split(',')]))

    def filter_created_at(self, queryset, name, value):
        return queryset.filter(reduce(operator.or_, [Q(created_at__range=rangetime(v)) for v in value.split(',')]))

    def filter_me(self, queryset, name, value):
        if value and self.request:
            return queryset.filter(Q(complaint=self.request.user))
        return queryset.filter(Q(department=self.request.user.department))

    class Meta:
        model = Ticket  # Replace with your actual Ticket model
        fields = ['id', 'department', 'status', 'issuetype', 'created_at', 'me']



class ISSUESTypeFilter(django_filters.FilterSet):
    def __init__(self, *args, **kwargs):
        self.user = kwargs['request'].user
        super(ISSUESTypeFilter, self).__init__(*args, **kwargs)
    # Define filters for each field
    name = django_filters.CharFilter(method='filter_name')
    department = django_filters.CharFilter(method='filter_department')
    created_at = django_filters.CharFilter(method='filter_created_at')
    me = django_filters.BooleanFilter(method='filter_me', widget=django_filters.widgets.BooleanWidget())

    def filter_name(self, queryset, name, value):
        return queryset.filter(reduce(operator.or_, [Q(**{"%s__%s" % (name, "contains"): v}) for v in value.split(',')]))

    def filter_department(self, queryset, name, value):
        return queryset.filter(reduce(operator.or_, [Q(**{"%s__%s" % (name, "id"): v}) for v in value.split(',')]))

    def filter_created_at(self, queryset, name, value):
        return queryset.filter(reduce(operator.or_, [Q(**{"%s__%s" % (name, "range"): rangetime(v)}) for v in value.split(',')]))

    def filter_me(self, queryset, name, value):
        if value:
            return queryset.filter(department=self.user.department)
        else:
            return queryset.exclude(department=self.user.department)

    class Meta:
        model = ISSUESType  # Replace with your actual IssueType model
        fields = ['name', 'department', 'created_at', 'me']