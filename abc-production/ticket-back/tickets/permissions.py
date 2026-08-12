# permissions.py
from rest_framework.permissions import IsAuthenticated
from ticket.models.choices import TicketStatus
from users.models.choices import AllowedModules, Roles

class NotePermission(IsAuthenticated):

    def has_permission(self, request, view):
        if not request.user.get_role in [Roles.AGENT, Roles.MANAGER]:
            return False

        return (AllowedModules.TICKET in request.user.department.modules and request.user.department.reciever) if request.user.department else False

    def has_object_permission(self, request, view, obj):
        return obj.poster == request.user


class TicketAdminPermission(IsAuthenticated):

    def has_permission(self, request, view):
        if not request.user.get_role == Roles.MANAGER:
            return False
        return AllowedModules.TICKET in request.user.department.modules and request.user.department.reciever if request.user.department else False

    def has_object_permission(self, request, view, obj):
        return request.user.department == obj.department if request.user.department else False


class TicketAdminOrCeoPermission(IsAuthenticated):

    def has_permission(self, request, view):
        if not request.user.get_role in [Roles.ADMIN, Roles.MANAGER]:
            return False
        
        if request.user.get_role == Roles.ADMIN:
            return True
        return AllowedModules.TICKET in request.user.department.modules and request.user.department.reciever if request.user.department else False


class TicketPermission(IsAuthenticated):

    def has_permission(self, request, view):

        if view.action in ['transfer'] or request.method in ["DELETE", "PATCH", "PUT"]:
            return AllowedModules.TICKET in request.user.department.modules and request.user.department.reciever and request.user.get_role == Roles.MANAGER if request.user.department else False
        return AllowedModules.TICKET in request.user.department.modules if request.user.department else request.user.get_role == Roles.ADMIN

    def has_object_permission(self, request, view, obj):
        if request.method in ["GET"]:
            if request.user.get_role == Roles.ADMIN:
                return True
            return AllowedModules.TICKET in request.user.department.modules if request.user.department else False
        
        main_permission = request.user.department == obj.department if request.user.department else False
        if request.method in ["DELETE"]:
            return main_permission and obj.status == TicketStatus.COMPLETE
        return main_permission
