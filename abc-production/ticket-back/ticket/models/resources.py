from import_export import resources
from import_export import fields
from import_export.widgets import ManyToManyWidget, ForeignKeyWidget
from django.contrib.auth import get_user_model

from ticket.models.models import *
from ticket.models.choices import TicketStatus

User = get_user_model()


class TicketResource(resources.ModelResource):
    full_name = fields.Field()
    department = fields.Field(
        column_name='department', attribute='department', widget=ForeignKeyWidget(Department, 'name'))
    issuetype = fields.Field(
        column_name='issuetype', attribute='issuetype', widget=ForeignKeyWidget(ISSUESType, 'name'))

    # project = fields.Field(
    #     column_name = 'project',
    #     attribute='bussiness',
    #     widget=ManyToManyWidget(AqarProject, field='name', separator=',')
    # )

    class Meta:
        model = Ticket
        fields = ['full_name', 'department', 'building', 'floor', 'description',
                  'issuetype', 'phone', 'extension', 'status', 'created_at', 'closed_at']
        export_order = ['full_name', 'department', 'building', 'floor', 'description',
                        'issuetype', 'phone', 'extension', 'status', 'created_at', 'closed_at']
        use_bulk = True

    def dehydrate_full_name(self, ticket):
        first_name = getattr(ticket.complaint, "first_name", "")
        last_name = getattr(ticket.complaint, "last_name", "")
        return '%s %s' % (first_name, last_name)