from django.db import models
from django.conf import settings
from model_utils import FieldTracker
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
from django.core.validators import MinValueValidator
from django.utils.translation import gettext_lazy as _
from django_better_admin_arrayfield.models.fields import ArrayField
# =============== main app =======================
from users.models.validators import *
from users.models.managers import *
from users.models.choices import *

# Create your models here.
class Department(models.Model):
    name = models.CharField(max_length=50, unique=True)
    reciever = models.BooleanField(default=False)
    logo = models.ImageField(
        upload_to='Departments/logos', null=True, blank=True)
    discribtion = models.TextField(null=True, blank=True)
    modules = ArrayField(models.CharField(max_length=50, choices=AllowedModules.choices), null=True, blank=True)
    # Base resolution target for tickets routed here. Ticket.compute_sla_deadline()
    # scales this by the ticket's priority.
    # Capability defaults for everyone in this department (null = fall back
    # to the role-based defaults, so existing departments keep working).
    default_permissions = models.ForeignKey(
        'users.DeptPermissions', null=True, blank=True, on_delete=models.SET_NULL,
        related_name='departments')
    sla_hours = models.PositiveIntegerField(
        _('SLA hours'), default=24,
        help_text=_("Base hours allowed to resolve a ticket in this department."))
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self) -> str:
        return self.name


class UserInfo(AbstractUser):
    # relation
    department = models.ForeignKey(
        Department, null=True, blank=True, on_delete=models.SET_NULL, related_name='user_department')
    # attributes
    username = None
    fingerid = models.IntegerField(
        _('fingerid'), unique=True, validators=[MinValueValidator(1)])
    image = models.ImageField(
        _('image'), upload_to='Users/ProfileLogo', default='Users/ProfileLogo/logo-1.png',)
    status = models.IntegerField(choices=((0, 0), (1, 1), (2, 2)), default=0)
    created_at = models.DateTimeField(_('created_at'), default=timezone.now)
    tracker = FieldTracker()
    # custom configurations
    USERNAME_FIELD = 'fingerid'
    REQUIRED_FIELDS: list = ['password']
    objects = UserManager()

    @property
    def get_role(self):
        if self.department is None:
            return Roles.ADMIN
        elif self.department:
            if self.is_superuser:
                return Roles.MANAGER
            else:
                return Roles.AGENT
 
    
    def __str__(self):
        return f"{self.get_full_name()}"


class Notification(models.Model):
    TYPES = (
        (1, 1),
        (2, 2),
        (3, 3)
    )
    # relation
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
                             related_name='notification_user', null=True, blank=True)
    # attrs
    message = models.CharField(_("message"), max_length=255)
    types = models.IntegerField(choices=TYPES)
    read = models.BooleanField(_("read"), default=False)
    created_at = models.DateTimeField('date created', default=timezone.now)

    def __str__(self) -> str:
        return f"{self.message}"
