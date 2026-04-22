import json

import settings
from ingenium.views.controllers.request_controller import get_request, post_request, patch_request, delete_request


def get_all_venues_response(request, **kwargs):
    """
    Will retrieve all the Venues from the core API.  Since we can pass in filters, sort order etc we are taking
    these in as kwargs and passing them to the core

    :param request: Request Object
    :param kwargs: Extra parameters you want to pass in;
    :return:
    """
    user = request.user

    params = {
        'limit': kwargs.get('limit', None),
        'offset': kwargs.get('offset', 0),
        'venue_type': kwargs.get('venue_type', None),
        'sort': kwargs.get('sort', "ASC")
    }

    return get_request(url=settings.VENUES_URL, params=params, token=user.get_token())


def get_venue_by_id_response(request, venue_id):
    return get_request(url=settings.VENUES_CRUD_URL.format(venue_id), token=request.user.get_token())


def add_venue_response(request, **kwargs):
    user = request.user

    data = {
        'name': kwargs.get('name'),
        'description': kwargs.get('description'),
        'ampcs_address': kwargs.get('ampcs_address'),
        'sse_address': kwargs.get('sse_address'),
        'location': kwargs.get('location'),
        'type': kwargs.get('type'),
    }

    return post_request(url=settings.VENUES_URL, data=json.dumps(data), token=user.get_token())


def update_venue_response(request, venue_id, **kwargs):
    user = request.user

    data = {
        'name': kwargs.get('name'),
        'description': kwargs.get('description'),
        'ampcs_address': kwargs.get('ampcs_address'),
        'sse_address': kwargs.get('sse_address'),
        'location': kwargs.get('location'),
        'type': kwargs.get('type'),
    }

    return patch_request(url=settings.VENUES_CRUD_URL.format(venue_id),
                         data=json.dumps(data),
                         token=user.get_token())


def update_status_venue_response(request, venue_id, status):
    user = request.user

    data = {
        'status': status.upper(),
    }

    return patch_request(url=settings.VENUE_STATUS.format(venue_id),
                         data=json.dumps(data),
                         token=user.get_token())


def delete_venue_request(request, venue_id):
    user = request.user

    return delete_request(url=settings.VENUES_CRUD_URL.format(venue_id),
                          data=None,
                          token=user.get_token())
