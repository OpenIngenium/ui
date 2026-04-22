import settings
from ingenium.views.controllers.request_controller import get_request


def get_all_permissions_response(request, **kwargs):
    """
    Retrieve the Permissions from the AUTH System
    :param request:
    :param kwargs:
    :return:
    """
    return get_request(url=settings.AUTH_PERMISSIONS_URL, token=request.user.get_token())
