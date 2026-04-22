import json

import settings
from ingenium.views.controllers.request_controller import post_request, patch_request, get_request


def get_executions_response(request, **kwargs):
    user = request.user

    limit = kwargs.get('limit', None)
    sort = kwargs.get('sort', 'DESC')
    completed = kwargs.get('completed', None)
    offset = kwargs.get('offset', None)
    venue_id = kwargs.get('venue_id')
    description = kwargs.get('description', None)
    order = kwargs.get('order', None)

    params = {
        'limit': limit,
        'completed': completed,
        'sort': sort.upper(),
        'offset': offset,
        'venue_id': venue_id,
        'description': description,
    }

    if order:
        params['order'] = order

    return get_request(url=settings.EXECUTIONS_URL, params=params, token=user.get_token())


def execute_venue_by_id_response(request, venue_id):
    user = request.user

    return post_request(url=settings.EXECUTIONS_URL,
                        data=json.dumps({'venue_id': venue_id}),
                        token=user.get_token())


def get_execution_by_id_response(request, execution_id):
    user = request.user

    return get_request(url=settings.EXECUTION_CRUD_URL.format(execution_id),
                       token=user.get_token())


def continue_execution_by_id_response(request, execution_id):
    user = request.user

    return post_request(url=settings.EXECUTION_CONTINUE_URL.format(execution_id),
                        data='',
                        token=user.get_token())


def get_execution_steps_response(request, execution_id):
    """
    Return STEPS ONLY
    :param request:
    :param execution_id:
    :return:
    """
    user = request.user

    return get_request(url=settings.EXECUTION_STEPS_URL.format(execution_id),
                       token=user.get_token())


def get_execution_elements_response(request, execution_id):
    user = request.user

    return get_request(url=settings.EXECUTION_ELEMENTS.format(execution_id),
                       token=user.get_token())


def get_execution_as_run_elements_response(request, execution_id):
    user = request.user

    return get_request(url=settings.EXECUTION_AS_RUN.format(execution_id),
                       token=user.get_token())


def close_execution_response(request, execution_id):
    """
    Close an Execution

    :param request: Request Object
    :param execution_id: Execution to close
    :return: The Response from CORE
    """
    user = request.user

    data = {
        'status': 'CLOSED',
    }

    return post_request(url=settings.EXECUTION_STATUS_URL.format(execution_id),
                        data=json.dumps(data),
                        token=user.get_token())


def update_execution_response(request, execution_id, **kwargs):
    """
    Update Execution Description

    :param request: Request Object
    :param execution_id: Execution ID
    :param kwargs:

    :return: Response from Core
    """
    user = request.user

    data = {
        'description': kwargs.get('description', ""),
    }

    return patch_request(url=settings.EXECUTION_CRUD_URL.format(execution_id),
                         data=json.dumps(data),
                         token=user.get_token())


def end_current_step_execution_response(request, execution_id, **kwargs):
    user = request.user

    return post_request(url=settings.EXECUTION_HALT.format(execution_id),
                        data=None,
                        token=user.get_token())

def resume_execution_response(request, execution_id, **kwargs):
    user = request.user

    data = {
        'venue_id': kwargs.get('venue_id', ""),
    }

    return post_request(url=settings.EXECUTION_RESUME.format(execution_id),
                        data=json.dumps(data),
                        token=user.get_token())


                       