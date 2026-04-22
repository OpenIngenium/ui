import json
import settings
from ingenium.views.controllers.request_controller import post_request, patch_request, get_request, delete_request


def get_procedures_response(request, **kwargs):
    user = request.user

    # sorting and paging
    limit = kwargs.get('limit', None)
    sort = kwargs.get('sort', 'DESC')
    sort_by = kwargs.get('sort_by', 'TIME_SAVED')
    offset = kwargs.get('offset', None)

    # filtering
    title = kwargs.get('title')
    author = kwargs.get('author', None)
    versioned = kwargs.get('versioned', None)
    released = kwargs.get('released', None)
    deprecated = kwargs.get('deprecated', None)
    institutional_id = kwargs.get('institutional_id', None)

    params = {
        'limit': limit,
        'sort': sort.upper(),
        'offset': offset,
        'sort_by': sort_by,
        'title': title,
        'author': author,
        'versioned': versioned,
        'released': released,
        'deprecated': deprecated,
        'institutional_id': institutional_id,
    }

    return get_request(url=settings.PROCEDURES_URL, params=params, token=user.get_token())


def get_procedure_by_id_response(request, procedure_id):
    user = request.user

    return get_request(url=settings.PROCEDURE_CRUD_URL.format(procedure_id),
                       token=user.get_token())


def create_procedure_response(request, **kwargs):
    user = request.user

    data = {
        'title': kwargs.get('title'),
        'description': kwargs.get('description'),
        'institutional_id': kwargs.get('institutional_id'),
        'author': kwargs.get('author'),
    }

    return post_request(url=settings.PROCEDURES_URL, data=json.dumps(data), token=user.get_token())


def update_procedure_response(request, procedure_id, data):
    user = request.user
    return patch_request(url=settings.PROCEDURE_CRUD_URL.format(procedure_id),
                         data=json.dumps(data),
                         token=user.get_token())


def delete_procedure_response(request, **kwargs):
    user = request.user
    procedure_id = kwargs.get('procedure_id', None)

    return delete_request(url=settings.PROCEDURE_CRUD_URL.format(procedure_id), token=user.get_token())


def update_procedure_version_response(request, **kwargs):
    user = request.user
    procedure_id = kwargs.get('procedure_id', None)
    version = kwargs.get('version', None)
    data = kwargs['data']
    return patch_request(url=settings.PROCEDURE_VERSIONS_CRUD_URL.format(procedure_id, version), data=json.dumps(data), token=user.get_token())


def create_procedure_version_response(request, **kwargs):
    user = request.user
    procedure_id = kwargs.get('procedure_id', None)
    version = kwargs.get('version', None)
    data = kwargs['data']

    return post_request(url=settings.PROCEDURE_VERSIONS_URL.format(procedure_id), data=json.dumps(data), token=user.get_token())


def delete_procedure_version_response(request, **kwargs):
    user = request.user
    procedure_id = kwargs.get('procedure_id', None)
    version = kwargs.get('version', None)
    return delete_request(url=settings.PROCEDURE_VERSIONS_CRUD_URL.format(procedure_id, version), token=user.get_token())


# RETURNS A SINGLE, SPECIFIC VERSION
def get_procedure_version_by_id_response(request, **kwargs):
    user = request.user
    procedure_id = kwargs.get('procedure_id', None)
    version = kwargs.get('version', None)
    return get_request(url=settings.PROCEDURE_VERSIONS_CRUD_URL.format(procedure_id, version), token=user.get_token())


# RETURNS A LIST OF NESTED PROCEDURE ELEMENTS
def get_procedure_version_structure_response(request, **kwargs):
    user = request.user
    procedure_id = kwargs.get('procedure_id', None)
    version = kwargs.get('version', None)
    return get_request(url=settings.PROCEDURE_VERSIONS_STRUCTURE_URL.format(procedure_id, version), token=user.get_token())


def get_procedure_version_outline_response(request, **kwargs):
    user = request.user
    procedure_id = kwargs.get('procedure_id', None)
    version = kwargs.get('version', None)
    return get_request(url=settings.PROCEDURE_VERSIONS_OUTLINE_URL.format(procedure_id, version), token=user.get_token())


def get_procedure_section_input_response(request, **kwargs):
    user = request.user
    element_id = kwargs.get('element_id')
    return get_request(url=settings.PROCEDURE_SECTION_INPUT_URL.format(element_id), token=user.get_token())


def get_procedure_section_structure_response(request, **kwargs):
    user = request.user
    element_id = kwargs.get('element_id')
    procedure_id = kwargs.get('procedure_id')
    execution_id = kwargs.get('execution_id')

    if execution_id:
        url = settings.PROCEDURE_SECTION_STRUCTURE_URL.format(element_id)
    else:
        url = settings.PROCEDURE_PROCEDURE_SECTION_STRUCTURE_URL.format(procedure_id, element_id)
    return get_request(url, token=user.get_token())


def revert_procedure_version_response(request, **kwargs):
    user = request.user
    return post_request(url=settings.PROCEDURE_OPS_URL.format(kwargs['procedure_id'], 'load'), data=json.dumps(kwargs['procedure_info']), token=user.get_token())


# RETURNS A LIST OF ALL VERSIONS FOR A GIVEN PROCEDURE
def get_procedure_versions_by_id_response(request, **kwargs):
    user = request.user
    procedure_id = kwargs.get('procedure_id', None)

    # sorting and paging
    limit = kwargs.get('limit', None)
    sort = kwargs.get('sort', 'DESC')
    offset = kwargs.get('offset', None)

    # filtering
    version_description = kwargs.get('version_description', None)
    version_author = kwargs.get('version_author', None)
    versioned = kwargs.get('versioned', None)
    released = kwargs.get('released', None)
    deprecated = kwargs.get('deprecated', None)

    params = {
        'limit': limit,
        'sort': sort.upper(),
        'offset': offset,
        'versioned': versioned,
        'released': released,
        'deprecated': deprecated,
        'version_description': version_description,
    }

    return get_request(url=settings.PROCEDURE_VERSIONS_URL.format(procedure_id), params=params, token=user.get_token())
