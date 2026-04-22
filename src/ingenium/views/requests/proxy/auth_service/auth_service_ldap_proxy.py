import settings
from ingenium.views.controllers.request_controller import get_request


def user_lookup_response(request, search_term, **kwargs):
    """
    Used to run an autocomplete on Users.  Given a partial User it will return back any that match in  AUTH
    :param request:
    :param search_term:
    :param kwargs:
    :return:
    """

    params = {
        'q': search_term,
    }

    return get_request(url=settings.AUTH_LDAP_USER_LOOKUP, params=params, token=request.user.get_token())


def group_lookup_response(request, search_term, **kwargs):
    """
    Used to run an autocomplete on LDAP Groups.  Given a partial User it will return back any that match in  AUTH
    :param request:
    :param search_term:
    :param kwargs:
    :return:
    """

    params = {
        'q': search_term,
    }

    return get_request(url=settings.AUTH_LDAP_GROUP_LOOKUP, params=params, token=request.user.get_token())
