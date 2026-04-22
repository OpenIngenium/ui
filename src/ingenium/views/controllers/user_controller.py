import logging

import requests

from ingenium.views.ingenium_models.user_model import UserModel
from ingenium.views.requests.proxy.auth_service.auth_service_user_proxy import get_all_users_response, \
    get_user_by_id_response, get_user_details_response, get_user_response

logger = logging.getLogger(__name__)


def get_all_users(request, **kwargs):
    response = get_all_users_response(request=request, **kwargs)

    if response.status_code == requests.codes.ok:
        auth_users_json = response.json()
        total = auth_users_json.get('total')
        return total, [UserModel(json_object=auth_user_json) for auth_user_json in auth_users_json.get('results')]

    logger.warning(response)
    return 0, []


def get_user_by_id(request, user_id, **kwargs):
    response = get_user_by_id_response(request=request, user_id=user_id, **kwargs)

    if response.status_code == requests.codes.ok:
        request_json = response.json()
        return UserModel(json_object=request_json)

    logger.warning(response)
    return None


def get_user_details(user):
    """
    Will retrieve user details from auth service /users?q=username
    """
    response = get_user_details_response(user=user)

    try:
        response_json = response.json()
        return response_json.get('results')[0]
    except (TypeError, KeyError):
        logger.warning('Error parsing user details from auth service')
    return {}


def get_user_roles(user, user_id=None):
    """
    Will retrieve user roles from auth service
    """
    if user_id is None:
        try:
            user_id = get_user_details(user)['id']
        except KeyError:
            logger.warning('Error retrieving user id from user details response')

    response = get_user_response(user=user, user_id=user_id)

    if response.status_code == requests.codes.ok:
        user_model = UserModel(json_object=response.json())
        return user_model.get_roles()

    logger.warning(response)
    return None
