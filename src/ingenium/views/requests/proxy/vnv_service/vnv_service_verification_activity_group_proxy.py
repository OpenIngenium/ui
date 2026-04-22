import settings
from ingenium.views.controllers.request_controller import get_request


def get_vags_response(request):
    return get_request(url=settings.VAGS_URL, token=request.user.get_token())
