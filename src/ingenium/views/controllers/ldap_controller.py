import logging

import requests

from ingenium.views.ingenium_models.user_model import UserModel
from ingenium.views.requests.proxy.auth_service.auth_service_ldap_proxy import user_lookup_response, \
    group_lookup_response

logger = logging.getLogger(__name__)


def user_lookup(request, search_term, **kwargs):
    """
    Used to run an autocomplete on Users.  Given a partial User it will return back any that match in  AUTH
    :param request:
    :param search_term:
    :param kwargs:
    :return:
    """
    response = user_lookup_response(request=request, search_term=search_term, **kwargs)

    if response.status_code == requests.codes.ok:
        return response.json()

    logger.warning(response)
    return []


def group_lookup(request, search_term, **kwargs):
    """
    Used to run an autocomplete on LDAP Groups.  Given a partial User it will return back any that match in  AUTH
    :param request: 
    :param search_term: 
    :param kwargs: 
    :return: 
    """
    response = group_lookup_response(request=request, search_term=search_term, **kwargs)

    if response.status_code == requests.codes.ok:
        return response.json()

    logger.warning(response)
    return None
