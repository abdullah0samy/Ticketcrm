from django.contrib import admin
from ticket.models.models import *


@admin.register(ISSUESType)
class CustomISSUESTypeAdmin(admin.ModelAdmin):
    model = ISSUESType
    list_display = ('name', 'department')
    list_filter = ('department', )

    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == "department":
            kwargs["queryset"] = Department.objects.filter(reciever=True)
        return super().formfield_for_foreignkey(db_field, request, **kwargs)


admin.site.register([Ticket, Note, ImportExportFile])