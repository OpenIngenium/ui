import settings
from ingenium.views.controllers.request_controller import get_request


def get_vis_response(request, va_uri):
    params = {
        'vaURI': va_uri,
    }

    return get_request(url=settings.VI_URL, params=params, token=request.user.get_token())
