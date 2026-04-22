from django.conf import settings

from ingenium.views.ingenium_models.venue_model import VenueModel


def global_settings(request):
    return {
        'APPLICATION_TITLE': settings.APPLICATION_TITLE,
        'APPLICATION_ACRONYM': settings.APPLICATION_ACRONYM,
        'HEADER_JS_BUNDLE': settings.HEADER_JS_BUNDLE
    }


def user_session(request):
    user = request.user

    expiration = user.get_access_expiration()
    iat = user.get_access_iat()

    if expiration:
        return {
            # "session_expiration": expiration,
            # "session_iat": iat,
            "SESSION_WARNING_EXPIRATION_IN_SECONDS": settings.SESSION_WARNING_EXPIRATION_IN_SECONDS,
        }

    return {}


def venue_types(request):

    return {
        "VENUE_TYPES": VenueModel.TYPES,
    }
