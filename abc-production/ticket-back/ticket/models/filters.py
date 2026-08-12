import operator
from ticket.models.models import *
from functools import reduce
from django.db.models import Q
import django_filters
from django.utils import timezone
from ABCHospital.helpers import *


class TicketFilterSet(django_filters.FilterSet):
    # Define filters for each field
    id = django_filters.CharFilter(field_name='id', lookup_expr='exact')
    department = django_filters.CharFilter(field_name='department__name', lookup_expr='icontains')
    status = django_filters.CharFilter(field_name='status', lookup_expr='exact')
    issuetype = django_filters.CharFilter(method='filter_issue_type')
    created_at = django_filters.CharFilter(method='filter_created_at')
    me = django_filters.BooleanFilter(method='filter_me')  # Add BooleanFilter for 'me'
    complaint_department = django_filters.CharFilter(field_name='complaint__department__name', lookup_expr='icontains')

    # --- filters for the fields added alongside priority/SLA/assignment ---
    priority = django_filters.CharFilter(method='filter_priority')
    assigned_to = django_filters.CharFilter(method='filter_assigned_to')
    assigned_to_me = django_filters.BooleanFilter(method='filter_assigned_to_me')
    unassigned = django_filters.BooleanFilter(method='filter_unassigned')
    overdue = django_filters.BooleanFilter(method='filter_overdue')
    is_archived = django_filters.BooleanFilter(field_name='is_archived')
    search = django_filters.CharFilter(method='filter_search')
    ordering = django_filters.CharFilter(method='filter_ordering')

    # Only these may be sorted on, so a caller cannot order by arbitrary columns.
    ALLOWED_ORDERING = {
        'created_at', 'updated_at', 'status', 'priority',
        'sla_deadline', 'closed_at', 'id', 'ticket_number',
    }

    def filter_priority(self, queryset, name, value):
        """Accepts one value or a comma-separated list."""
        values = [v.strip() for v in value.split(',') if v.strip()]
        return queryset.filter(priority__in=values) if values else queryset

    def filter_assigned_to(self, queryset, name, value):
        values = [v.strip() for v in value.split(',') if v.strip().isdigit()]
        return queryset.filter(assigned_to__id__in=values) if values else queryset

    def filter_assigned_to_me(self, queryset, name, value):
        if not value:
            return queryset
        return queryset.filter(assigned_to=self.request.user)

    def filter_unassigned(self, queryset, name, value):
        return queryset.filter(assigned_to__isnull=True) if value else queryset

    def filter_overdue(self, queryset, name, value):
        """Open tickets already past their deadline."""
        if value is None:
            return queryset
        open_and_late = Q(
            sla_deadline__lt=timezone.now(),
        ) & ~Q(status__in=[TicketStatus.COMPLETE, TicketStatus.CLOSED])
        return queryset.filter(open_and_late) if value else queryset.exclude(open_and_late)

    def filter_search(self, queryset, name, value):
        """Free-text across the fields a user would actually type."""
        value = value.strip()
        if not value:
            return queryset
        return queryset.filter(
            Q(ticket_number__icontains=value)
            | Q(subject__icontains=value)
            | Q(description__icontains=value)
            | Q(note__icontains=value)
            | Q(complaint__first_name__icontains=value)
            | Q(complaint__last_name__icontains=value)
        )

    def filter_ordering(self, queryset, name, value):
        fields = []
        for raw in value.split(','):
            raw = raw.strip()
            bare = raw.lstrip('-')
            if bare in self.ALLOWED_ORDERING:
                fields.append(raw)
        return queryset.order_by(*fields) if fields else queryset

    def filter_issue_type(self, queryset, name, value):
        if value == "unknown":
            return queryset.filter(issuetype__isnull=True)
        return queryset.filter(issuetype__name__icontains=value)
    def filter_created_at(self, queryset, name, value):
        return queryset.filter(reduce(operator.or_, [Q(created_at__range=rangetime(v)) for v in value.split(',')]))

    def filter_me(self, queryset, name, value):
        if value:
            return queryset.filter(Q(complaint__department=self.request.user.department))
        return queryset.filter(Q(department=self.request.user.department))

    class Meta:
        model = Ticket  # Replace with your actual Ticket model
        fields = ['id', 'department', 'status', 'issuetype', 'created_at', 'me', "is_external",
                  'priority', 'assigned_to', 'assigned_to_me', 'unassigned', 'overdue',
                  'is_archived', 'search', 'ordering']



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