from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django_better_admin_arrayfield.admin.mixins import DynamicArrayMixin
from users.models.models import *


@admin.register(UserInfo)
class CustomUserAdmin(UserAdmin):
    model = UserInfo
    # Define the fields to display in the UserAdmin list display
    list_display = ('fingerid', 'first_name', 'last_name',
                    'is_superuser', 'department')
    search_fields = ('fingerid', 'department__name', 'first_name', 'last_name')
    list_filter = ('department', 'is_superuser')
    fieldsets = (
        ('Personal info', {'fields': ('image', 'first_name',
         'last_name', 'fingerid', 'department', 'password')}),
        ('Permissions', {'fields': ('is_active',
         'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('fingerid', 'password1', 'password2'),
        }),
    )
    ordering = ('fingerid',)
    filter_horizontal = ()


@admin.register(Department)
class CustomDepartmentAdmin(admin.ModelAdmin, DynamicArrayMixin):
    model = Department
    list_display = ('name', 'reciever')
    list_filter = ('reciever', )
