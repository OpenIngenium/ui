import json

import settings
from ingenium.views.controllers.request_controller import get_request, post_request


def get_element_comments_response(request, element_id, **kwargs):
    user = request.user

    params = {
        'offset': kwargs.get('offset', 0),
        'limit': kwargs.get('limit', 50),
        'sort': kwargs.get('sort', 'DESC'),
    }

    return get_request(url=settings.COMMENTS_URL.format(element_id), params=params, token=user.get_token())


def add_element_comments_response(request, element_id, comment):
    user = request.user

    data = {
        'content': comment,
    }

    return post_request(url=settings.COMMENTS_URL.format(element_id), data=json.dumps(data), token=user.get_token())