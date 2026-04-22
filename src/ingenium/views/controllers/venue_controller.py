import logging

import requests

from ingenium.views.ingenium_models.venue_model import VenueModel
from ingenium.views.requests.proxy.core.core_venue_proxy import get_all_venues_response, get_venue_by_id_response


logger = logging.getLogger(__name__)


def get_all_venues(request, **kwargs):
    """
    Will retrieve all the Venues from the core API.  Since we can pass in filters, sort order etc we are taking
    these in as kwargs and passing them to the core

    :param request: Request Object
    :param kwargs: Extra parameters you want to pass in;
    :return:
    """
    response = get_all_venues_response(request=request, **kwargs)

    if response.status_code == requests.codes.ok:
        total = response.headers.get('x-total-count')
        if not total:
            total = 0

        # Convert these to list of Venues
        return total, [VenueModel(json_object=venue_json) for venue_json in response.json() if venue_json]

    logger.warning(response)
    return 0, []


def get_venue_by_id(request, venue_id):
    response = get_venue_by_id_response(request=request, venue_id=venue_id)

    if response.status_code == requests.codes.ok:
        request_json = response.json()
        return VenueModel(json_object=request_json)

    logger.warning(response)
    return None
