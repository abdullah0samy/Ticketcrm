from django.contrib import admin
from pr.models.models import *
from solo.admin import SingletonModelAdmin
from adminsortable2.admin import SortableAdminBase
from adminsortable2.admin import SortableStackedInline

@admin.register(PRSiteConfig)
class PRSiteConfigAdmin(SingletonModelAdmin):
    pass
    
class SurveyLinkInline(SortableStackedInline, admin.StackedInline):
    model = Link
    extra = 0
    fields = ["link"]


@admin.register(SurveyConfig)
class SurveyConfigAdmin(SortableAdminBase, SingletonModelAdmin):
    inlines = [SurveyLinkInline]


class SurveyConfigInline(SortableStackedInline, admin.StackedInline):
    model = SurveyQuestion
    extra = 0
    fields = ["question", "group", "category", "periority"]


@admin.register(SurveyTemplate)
class TemplateAdmin(SortableAdminBase, admin.ModelAdmin):
    list_display = ("title", "flag")
    exclude = ("order",)
    inlines = [SurveyConfigInline]


@admin.register(Survey)
class SurveyAdmin(admin.ModelAdmin):
    pass