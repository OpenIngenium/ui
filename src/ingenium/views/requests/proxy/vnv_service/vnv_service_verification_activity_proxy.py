import settings
from ingenium.views.controllers.request_controller import get_request


def get_vas_response(request, vag_uri):
    params = {
        'vagURI': vag_uri,
    }

    return get_request(url=settings.VA_URL, params=params, token=request.user.get_token())
