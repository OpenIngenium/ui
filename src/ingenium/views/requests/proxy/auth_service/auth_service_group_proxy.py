import settings
from ingenium.views.controllers.request_controller import get_request


def get_all_user_groups_response(request, **kwargs):
    """
    Will retrieve all the Venues from the core API.  Since we can pass in filters, sort order etc we are taking
    these in as kwargs and passing them to the core

    :param request: Request Object
    :param kwargs:
    :return:
    """

    user = request.user

    limit = kwargs.get('limit', None)
    offset = kwargs.get('offset', None)
    order = kwargs.get('order', "ASC")
    role_filter = kwargs.get('role_search_filter', None)
    scope_filter = kwargs.get('scope_search_filter', None)
    user_filter = kwargs.get('filter_user_search', None)
    filter_group_search = kwargs.get('filter_group_search', None)

    params = {
        'limit': limit,
        'offset': offset,
        'order': order.upper(),
    }

    if role_filter:
        params['rolefilter'] = role_filter

    if scope_filter:
        params['scopefilter'] = scope_filter

    if user_filter:
        params['userfilter'] = user_filter

    if filter_group_search:
        params['q'] = filter_group_search

    return get_request(url=settings.AUTH_GROUPS_URL, params=params, token=user.get_token())
