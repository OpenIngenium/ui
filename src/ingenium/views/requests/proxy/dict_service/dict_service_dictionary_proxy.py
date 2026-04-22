import settings
from ingenium.views.controllers.request_controller import get_request, post_request, patch_request, delete_request
from ingenium.views.ingenium_models.dictionary_model import DictionaryModel


def get_dictionary_by_pk_response(request, dictionary_type, dictionary_version):
    return get_request(url=settings.DICTIONARIES_VERSION_URL.format(dictionary_type, dictionary_version),
                       token=request.user.get_token())


def get_dictionaries_response(request, dictionary_type, **kwargs):
    user = request.user

    state = kwargs.get('state', None)
    description = kwargs.get('description', None)

    params = {
        'offset': kwargs.get('offset', 0),
        'limit': kwargs.get('limit', 50),
        'sort': kwargs.get('sort', 'DESC'),
    }

    if state:
        params['state_filter'] = state

    if description:
        params['description_filter'] = description

    return get_request(url=settings.DICTIONARIES_URL.format(dictionary_type),
                       params=params,
                       token=user.get_token()
                       )


def get_dictionary_cmd_arguments_response(request, dictionary_type, dictionary_version, cmd_stem, **kwargs):
    repeat_args_only = kwargs.get('repeat_args', None)
    if dictionary_type == DictionaryModel.DICTIONARY_SSE_ID:
        url = settings.DICTIONARY_SSE_CMD_URL.format(dictionary_version) + "/{0}".format(cmd_stem)
    else:
        url = settings.DICTIONARY_FLIGHT_CMD_URL.format(dictionary_version) + "/{0}".format(cmd_stem)

    params = {}
    if repeat_args_only:
        params['repeat_args'] = repeat_args_only

    return get_request(url=url, params=params, token=request.user.get_token())


def get_dictionary_cmds_response(request, dictionary_type, dictionary_version, **kwargs):
    filter_command_stem = kwargs.get('filter_command_stem', None)
    filter_operation_search = kwargs.get('filter_operation_search', None)
    filter_description_search = kwargs.get('filter_description_search', None)

    if dictionary_type == DictionaryModel.DICTIONARY_SSE_ID:
        url = settings.DICTIONARY_SSE_CMD_URL.format(dictionary_version)
    else:
        url = settings.DICTIONARY_FLIGHT_CMD_URL.format(dictionary_version)

    params = {
        'offset': kwargs.get('offset', 0),
        'limit': kwargs.get('limit', 50),
        'wild': kwargs.get('wild', "false")
    }

    if filter_command_stem:
        params['command_stem'] = filter_command_stem

    if filter_operation_search:
        params['ops_cat'] = filter_operation_search

    if filter_description_search:
        params['command_description'] = filter_description_search

    return get_request(url=url,
                       params=params,
                       token=request.user.get_token())


def get_dictionary_evrs_response(request, dictionary_type, dictionary_version, **kwargs):
    filter_name = kwargs.get('filter_name', None)
    filter_level = kwargs.get('filter_level', None)
    filter_message = kwargs.get('filter_message', None)
    filter_operation_search = kwargs.get('filter_operation_search', None)
    filter_description_search = kwargs.get('filter_description_search', None)

    if dictionary_type == DictionaryModel.DICTIONARY_SSE_ID:
        url = settings.DICTIONARY_SSE_EVR_URL.format(dictionary_version)

    else:
        url = settings.DICTIONARY_FLIGHT_EVR_URL.format(dictionary_version)

    params = {
        'offset': kwargs.get('offset', 0),
        'limit': kwargs.get('limit', 50),
        'wild': kwargs.get('wild', "false")
    }

    if filter_name:
        params['evr_name'] = filter_name

    if filter_level:
        params['evr_level'] = filter_level

    if filter_message:
        params['evr_message'] = filter_message

    if filter_operation_search:
        params['ops_cat'] = filter_operation_search

    if filter_description_search:
        params['evr_description'] = filter_description_search

    return get_request(url=url,
                       params=params,
                       token=request.user.get_token())


def get_dictionary_ehas_response(request, dictionary_type, dictionary_version, **kwargs):
    filter_name = kwargs.get('filter_name', None)
    filter_derived = kwargs.get('filter_derived', None)
    filter_channel_id_search = kwargs.get('filter_channel_id_search', None)
    filter_operation_search = kwargs.get('filter_operation_search', None)
    filter_description_search = kwargs.get('filter_description_search', None)

    if dictionary_type == DictionaryModel.DICTIONARY_SSE_ID:
        url = settings.DICTIONARY_SSE_EHA_URL.format(dictionary_version)

    else:
        url = settings.DICTIONARY_FLIGHT_EHA_URL.format(dictionary_version)

    params = {
        'offset': kwargs.get('offset', 0),
        'limit': kwargs.get('limit', 50),
        'wild': kwargs.get('wild', "false")
    }

    if filter_name:
        params['eha_name'] = filter_name

    if filter_derived:
        params['derived'] = filter_derived

    if filter_channel_id_search:
        params['channel_id'] = filter_channel_id_search

    if filter_operation_search:
        params['ops_cat'] = filter_operation_search

    if filter_description_search:
        params['eha_description'] = filter_description_search

    return get_request(url=url,
                       params=params,
                       token=request.user.get_token())


def lookup_cmd_names_response(request, **kwargs):
    command_stem = kwargs.get('command_stem')
    dictionary_type = kwargs.get('dictionary_type')
    flight_dictionary_version = kwargs.get('flight_dictionary_version')
    sse_dictionary_version = kwargs.get('sse_dictionary_version')

    if dictionary_type.lower() == DictionaryModel.DICTIONARY_SSE_ID:
        url = settings.DICTIONARY_SSE_CMD_URL.format(sse_dictionary_version)
    else:
        url = settings.DICTIONARY_FLIGHT_CMD_URL.format(flight_dictionary_version)

    params = {
        'command_stem': command_stem,
    }
    return get_request(url, data=None, params=params, token=request.user.get_token())


def lookup_evr_names_response(request, **kwargs):
    evr_name = kwargs.get('evr_name')
    dictionary_type = kwargs.get('dictionary_type')
    flight_dictionary_version = kwargs.get('flight_dictionary_version')
    sse_dictionary_version = kwargs.get('sse_dictionary_version')

    if dictionary_type.lower() == DictionaryModel.DICTIONARY_SSE_ID:
        url = settings.DICTIONARY_SSE_EVR_URL.format(sse_dictionary_version)
    else:
        url = settings.DICTIONARY_FLIGHT_EVR_URL.format(flight_dictionary_version)

    params = {
        'evr_name': evr_name,
    }
    return get_request(url, data=None, params=params, token=request.user.get_token())


def lookup_eha_names_response(request, **kwargs):
    eha_name = kwargs.get('eha_name')
    dictionary_type = kwargs.get('dictionary_type')
    flight_dictionary_version = kwargs.get('flight_dictionary_version')
    sse_dictionary_version = kwargs.get('sse_dictionary_version')

    if dictionary_type.lower() == DictionaryModel.DICTIONARY_SSE_ID:
        url = settings.DICTIONARY_SSE_EHA_URL.format(sse_dictionary_version)
    else:
        url = settings.DICTIONARY_FLIGHT_EHA_URL.format(flight_dictionary_version)

    params = {
        'eha_name': eha_name,
    }
    return get_request(url, data=None, params=params, token=request.user.get_token())


def add_dictionary_response(request, dictionary_type, **kwargs):
    """
    When user submits a new dictionary or Adds a Dictionary

    :param dictionary_type:
    :param request:
    :return:
    """
    user = request.user

    dictionary_version = kwargs.get('dictionary_version')
    state = kwargs.get('state')
    dictionary_description = kwargs.get('dictionary_description')
    files = kwargs.get('files', None)

    data = {
        'dictionary_type': dictionary_type,
        'dictionary_version': dictionary_version,
        'dictionary_description': dictionary_description,
        'state': state
    }

    headers = {
        'Authorization': "Bearer %s" % user.get_token(),
    }

    # Posting New Dictionary
    return post_request(url=settings.DICTIONARIES_URL.format(dictionary_type),
                        data=data,
                        token=user.get_token(),
                        files=files,
                        headers=headers,
                        )


def update_dictionary(request, dictionary_type, **kwargs):
    """
    When user submits a new dictionary or Adds a Dictionary

    :param dictionary_type:
    :param request:
    :return:
    """
    user = request.user

    dictionary_version = kwargs.get('dictionary_version')
    state = kwargs.get('state')
    dictionary_description = kwargs.get('dictionary_description')
    files = kwargs.get('files', None)

    data = {
        'dictionary_type': dictionary_type,
        'dictionary_version': dictionary_version,
        'dictionary_description': dictionary_description,
        'state': state
    }

    headers = {
        'Authorization': "Bearer %s" % user.get_token(),
    }

    return patch_request(url=settings.DICTIONARIES_VERSION_URL.format(dictionary_type, dictionary_version),
                         data=data,
                         token=user.get_token(),
                         headers=headers,
                         files=files
                         )


def delete_dictionary_response(request, dictionary_type, dictionary_version):
    user = request.user
    return delete_request(url=settings.DICTIONARIES_VERSION_URL.format(dictionary_type, dictionary_version),
                          token=user.get_token())


def update_dictionary_parser_response(request, dictionary_type, parser_name):
    user = request.user

    data = {
        'parser_name': parser_name,
    }

    headers = {
        'Authorization': "Bearer %s" % user.get_token(),
    }

    return patch_request(url=settings.DICTIONARY_PARSER.format(dictionary_type),
                         data=data,
                         token=user.get_token(),
                         headers=headers,
                         )


def get_parsers_response(request, dictionary_type):
    user = request.user

    params = {
        'dictionary_type': dictionary_type,
    }

    return get_request(url=settings.DICTIONARY_PARSER.format(dictionary_type),
                       params=params,
                       token=user.get_token(),
                       )
