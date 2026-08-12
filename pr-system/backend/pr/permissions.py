# permissions.py
from rest_framework.permissions import IsAuthenticated

from users.models.choices import AllowedModules, Roles


class PRBasePermission(IsAuthenticated):
    """Shared guard for every PR endpoint.

    Each subclass used to read `request.user.get_role` straight away. For an
    unauthenticated caller `request.user` is an `AnonymousUser`, which has no
    `get_role`, so the request died with an AttributeError and the client got
    a 500 where it should have received a 401 — a missing token looked like a
    broken server. Authentication is now settled first, in one place.
    """

    def has_permission(self, request, view):
        user = request.user
        if not (user and user.is_authenticated):
            return False
        return self.has_pr_permission(request, view, user)

    def has_pr_permission(self, request, view, user):  # pragma: no cover - overridden
        return False

    @staticmethod
    def department_has_pr(user):
        """True when the user's department actually has the PR module enabled."""
        return AllowedModules.PR in (user.department.modules or []) if user.department else False


class PRManagerPermission(PRBasePermission):

    def has_pr_permission(self, request, view, user):
        if user.get_role != Roles.MANAGER:
            return False
        return self.department_has_pr(user)


class PRManagerOrCeoPermission(PRBasePermission):

    def has_pr_permission(self, request, view, user):
        if user.get_role not in (Roles.MANAGER, Roles.ADMIN):
            return False
        # A global admin has no department but oversees every module.
        if user.get_role == Roles.ADMIN:
            return True
        return self.department_has_pr(user)


class PRAgentPermission(PRBasePermission):

    def has_pr_permission(self, request, view, user):
        if user.get_role != Roles.AGENT:
            return False
        return self.department_has_pr(user)


class PRReadPermission(PRBasePermission):
    """Read access to PR reference data for anyone who works with the module.

    The question list and the satisfaction message are configuration, not
    patient data, but they were gated behind "role is exactly agent" — so an
    administrator or a PR manager opening the survey screen got 403s and an
    empty form. Data entry stays restricted to agents; this only covers reads.
    """

    def has_pr_permission(self, request, view, user):
        if user.get_role == Roles.ADMIN:
            return True
        if user.get_role not in (Roles.AGENT, Roles.MANAGER):
            return False
        return self.department_has_pr(user)


class PRSurveyPermission(PRBasePermission):

    def has_pr_permission(self, request, view, user):
        if request.method == "POST":
            if user.get_role != Roles.AGENT:
                return False
            return self.department_has_pr(user)

        # Reads.
        # SECURITY FIX: this branch used to be `if not ... == Roles.ADMIN: return True`,
        # which inverted the intent — every NON-admin was granted access unconditionally
        # (verified: a user whose department has no 'pr' module could read patient
        # survey data), while the global admin was denied. Admins are allowed; everyone
        # else must belong to a department that actually has the PR module enabled.
        if user.get_role == Roles.ADMIN:
            return True

        return self.department_has_pr(user)
