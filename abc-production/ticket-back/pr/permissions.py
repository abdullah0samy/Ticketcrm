# permissions.py
from rest_framework.permissions import IsAuthenticated
from users.models.choices import AllowedModules, Roles


class PRManagerPermission(IsAuthenticated):

    def has_permission(self, request, view):
        if not request.user.get_role == Roles.MANAGER:
            return False
        return AllowedModules.PR in request.user.department.modules if request.user.department else False


class PRManagerOrCeoPermission(IsAuthenticated):

    def has_permission(self, request, view):
        if not request.user.get_role in [Roles.MANAGER, Roles.ADMIN]:
            return False
        
        if request.user.get_role == Roles.ADMIN:
            return True
        return AllowedModules.PR in request.user.department.modules if request.user.department else False

class PRAgentPermission(IsAuthenticated):
    
    def has_permission(self, request, view):
        if not request.user.get_role == Roles.AGENT:
            return False
        return AllowedModules.PR in request.user.department.modules  if request.user.department else False


class PRSurveyPermission(IsAuthenticated):

    def has_permission(self, request, view):
        if request.method in ["POST"]:
            if not request.user.get_role == Roles.AGENT:
                return False
            return AllowedModules.PR in request.user.department.modules  if request.user.department else False

        # Reads.
        # SECURITY FIX: this branch used to be `if not ... == Roles.ADMIN: return True`,
        # which inverted the intent — every NON-admin was granted access unconditionally
        # (verified: a user whose department has no 'pr' module could read patient
        # survey data), while the global admin was denied. Admins are allowed; everyone
        # else must belong to a department that actually has the PR module enabled.
        if request.user.get_role == Roles.ADMIN:
            return True

        return AllowedModules.PR in request.user.department.modules if request.user.department else False

    