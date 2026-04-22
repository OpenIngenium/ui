import json

import settings
from ingenium.views.controllers.request_controller import get_request, delete_request, post_request, put_request


def get_all_roles_response(request, **kwargs):
    """
    Will retrieve all the Roles from the AUTH API.
    """

    filter_name_search = kwargs.get('filter_name_search', None)

    params = {
    }

    if filter_name_search:
        params['q'] = filter_name_search

    return get_request(url=settings.AUTH_ROLES_URL,
                       params=params,
                       token=request.user.get_token())


def get_role_by_id_response(request, role_id, **kwargs):
    return get_request(url=settings.AUTH_ROLES_CRUD.format(role_id),
                       token=request.user.get_token())


def delete_role_response(request, role_id):
    user = request.user
    return delete_request(url=settings.AUTH_ROLES_CRUD.format(role_id),
                          data=None,
                          token=user.get_token())


def add_role_response(request, **kwargs):
    user = request.user
    data = {
        'name': kwargs.get('name'),
        'description': kwargs.get('description', ''),
        'permissions': kwargs.get('permissions', ''),
        'users': kwargs.get('users', []),
        'groups': kwargs.get('groups', []),
    }

    return post_request(url=settings.AUTH_ROLES_URL, data=json.dumps(data), token=user.get_token())


def update_role_response(request, role_id, **kwargs):
    user = request.user
    data = {
        'name': kwargs.get('name'),
        'description': kwargs.get('description', ''),
        'permissions': kwargs.get('permissions', ''),
        'users': kwargs.get('users', []),
        'groups': kwargs.get('groups', []),
    }

    return put_request(url=settings.AUTH_ROLES_CRUD.format(role_id), data=json.dumps(data), token=user.get_token())
