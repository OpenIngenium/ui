import logging

import requests

from ingenium.views.ingenium_models.role_model import RoleModel
from ingenium.views.requests.proxy.auth_service.auth_service_role_proxy import get_all_roles_response, \
    get_role_by_id_response

logger = logging.getLogger(__name__)


def get_all_roles(request, **kwargs):
    response = get_all_roles_response(request=request, **kwargs)

    if response.status_code == requests.codes.ok:
        return [RoleModel(json_object=role) for role in response.json()]

    logger.warning(response)
    return []


def get_role_by_id(request, role_id, **kwargs):
    response = get_role_by_id_response(request=request, role_id=role_id, **kwargs)

    if response.status_code == requests.codes.ok:
        return RoleModel(json_object=response.json())

    logger.warning(response)
    return None
