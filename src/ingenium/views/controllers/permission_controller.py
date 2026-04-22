import logging

import requests

from ingenium.views.ingenium_models.permission_model import PermissionModel
from ingenium.views.requests.proxy.auth_service.auth_service_permission_proxy import get_all_permissions_response

logger = logging.getLogger(__name__)


def get_all_permissions(request, **kwargs):
    """
    Retrieve the Permissions from the AUTH System
    :param request: 
    :param kwargs: 
    :return: 
    """
    response = get_all_permissions_response(request=request, **kwargs)

    if response.status_code == requests.codes.ok:
        response_json = response.json()
        return [PermissionModel(json_object=permission) for permission in response_json]

    logger.warning(response)
    return []
