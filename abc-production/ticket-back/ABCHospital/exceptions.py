from rest_framework.views import exception_handler
from django.utils.translation import gettext_lazy as _

def custom_exception_handler(exc, context):

    # Call REST framework's default exception handler first,
    # to get the standard error response.
    response = exception_handler(exc, context)

    # Now add the HTTP status code to the response.
    if response is not None:

        error = response.data
        key = None
        while True:
            if isinstance(error, dict):
                key = list(error.keys())[0]
                error = error.pop(key)
                continue
            elif isinstance(error, list):
                error = f"{error[0]}"
                continue
            break
        if 'ErrorDetail' in error:
            error = error[error.index("=") + 2: error.index(",") - 1]
        response.data['status'] = response.status_code
        response.data['message'] = f"{key} {error}"

    
    
    return response