import logging

import requests

from ingenium.views.ingenium_models.user_group_model import UserGroupModel
from ingenium.views.requests.proxy.auth_service.auth_service_group_proxy import get_all_user_groups_response

logger = logging.getLogger(__name__)


def get_all_user_groups(request, **kwargs):
    response = get_all_user_groups_response(request=request, **kwargs)

    if response.status_code == requests.codes.ok:
        response_json = response.json()

        total = response_json.get('total')

        # Convert these to Models
        return total, [UserGroupModel(json_object=auth_group_json) for auth_group_json in response_json.get('results')]

    logger.warning(response)
    return 0, []
