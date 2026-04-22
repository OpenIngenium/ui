import settings
from ingenium.views.controllers.request_controller import get_request


def get_all_users_response(request, **kwargs):
    """
    Will retrieve all the Users from the core API.

    :param kwargs:
    :return: (Total  Users, List of Users
    """

    user = request.user

    limit = kwargs.get('limit', None)
    offset = kwargs.get('offset', None)
    order = kwargs.get('order', "ASC")
    logged_in = kwargs.get('logged_in_filter', None)
    role_filter = kwargs.get('role_search_filter', None)
    scope_filter = kwargs.get('scope_search_filter', None)
    group_filter = kwargs.get('filter_group_search', None)

    params = {
        'limit': limit,
        'offset': offset,
        'order': order.upper(),
    }

    # End point doesn't handle passing empty parameters well so we are doing this
    if logged_in:
        params['loggedin'] = logged_in

    if role_filter:
        params['rolefilter'] = role_filter

    if scope_filter:
        params['scopefilter'] = scope_filter

    if group_filter:
        params['groupfilter'] = group_filter

    return get_request(url=settings.AUTH_USERS_URL, params=params, token=user.get_token())


def get_user_by_id_response(request, user_id, **kwargs):
    return get_request(url=settings.AUTH_USERS_CRUD.format(user_id), token=request.user.get_token())


def get_user_details_response(user):
    """
    Will retrieve user details from auth service /users?q=username
    """
    params = {
        'q': user.get_username(),
    }
    return get_request(url=settings.AUTH_USERS_URL, params=params, token=user.get_token())


def get_user_response(user, user_id):
    return get_request(url='{}{}'.format(settings.AUTH_USERS_URL, user_id), token=user.get_token())

