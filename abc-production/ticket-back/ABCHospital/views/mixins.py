from django.utils.translation import gettext_lazy as _


class SelectModeSerializerMixin:
    """
    A mixin that dynamically sets the serializer class based on a condition.
    """
    def get_serializer_class(self, *args, **kwargs):

        if self.request.method == "GET" and 'select' in self.request.path:
            return self.selectserializer_class
        return super().get_serializer_class()