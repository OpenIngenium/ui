import logging

import requests

from ingenium.views.ingenium_models.dictionary_cmd_model import DictionaryCmdModel
from ingenium.views.ingenium_models.dictionary_eha_model import DictionaryEhaModel
from ingenium.views.ingenium_models.dictionary_evr_model import DictionaryEvrModel
from ingenium.views.ingenium_models.dictionary_model import DictionaryModel
from ingenium.views.ingenium_models.dictionary_parser_model import DictionaryParserModel
from ingenium.views.requests.proxy.dict_service.dict_service_dictionary_proxy import get_dictionary_by_pk_response, \
    get_dictionaries_response, get_parsers_response, get_dictionary_cmds_response, \
    get_dictionary_evrs_response, get_dictionary_ehas_response

logger = logging.getLogger(__name__)


def get_dictionary_by_pk(request, dictionary_type, dictionary_version):
    """
    This will retrieve a specific Dictionary from the Dictionary Service

    :param request: Request Object
    :param dictionary_type:  Flight vs SSE
    :param dictionary_version: Dictionary Version to retrieve

    :return: DictionaryModel that wraps up the response
    """
    response = get_dictionary_by_pk_response(request=request,
                                             dictionary_type=dictionary_type,
                                             dictionary_version=dictionary_version)

    if response.status_code == requests.codes.ok:
        return DictionaryModel(json_object=response.json())

    logger.warning(response)
    return None


def get_dictionaries(request, dictionary_type, **kwargs):
    """
    Get all the Dictionaries for a given Dictionary Type

    :param request: Request Object
    :param dictionary_type: SSE or Flight
    :param kwargs: Additional Parameters that can be passed into the request

    :return: Total, List<DictionaryModel> - Total number of dictionaries found and list of dictionary models
    """
    response = get_dictionaries_response(request=request,
                                         dictionary_type=dictionary_type,
                                         **kwargs)

    if response.status_code == requests.codes.ok:
        total = response.headers.get('x-total-count')

        # Convert these to Models
        dictionaries = [DictionaryModel(json_object=dictionary) for dictionary in response.json()]

        if not total:
            total = 0

        return total, dictionaries

    logger.warning(response)
    return 0, []


def get_published_and_released_flight_dictionaries(request):
    """
    This will either return back an array of dictionaries or empty list.

    If there is an error connecting it will return a None

    :param request: Request Object

    :return: List of DictionaryModels or None if service failed
    """
    try:
        total, dictionaries = get_dictionaries(request,
                                               dictionary_type=DictionaryModel.DICTIONARY_FLIGHT_ID,
                                               state=DictionaryModel.PUBLISHED_RELEASED_STATE_IDS)

    except TypeError:
        return None

    return dictionaries


def get_published_and_released_sse_dictionaries(request):
    """
    Retrieve all the Published SSE Dictionaries

    :param request: Request Object

    :return: List of Dictionary Models or None if there is an issue retrieving dictionaries
    """
    try:
        total, dictionaries = get_dictionaries(request, dictionary_type=DictionaryModel.DICTIONARY_SSE_ID, state=DictionaryModel.PUBLISHED_RELEASED_STATE_IDS)
    except TypeError:
        return None

    return dictionaries


def get_sse_parsers(request):
    return get_parsers(request, DictionaryModel.DICTIONARY_SSE_ID)


def get_flight_parsers(request):
    return get_parsers(request, DictionaryModel.DICTIONARY_FLIGHT_ID)


def get_parsers(request, dictionary_type):
    response = get_parsers_response(request=request,
                                    dictionary_type=dictionary_type)

    if response.status_code == requests.codes.ok:
        return [DictionaryParserModel(json_object) for json_object in response.json()]

    return []


def get_active_parser(request, dictionary_type):
    """
    This will get the Active Parser for a given Dictionary Type.  Since there is no endpoint we can hit to get this
    information this is the workaround.

    :param request:
    :param dictionary_type:
    :return:
    """
    parsers = get_parsers(request, dictionary_type)

    for parser in parsers:
        if parser.is_active():
            return parser

    return None


def get_dictionary_cmds(request, dictionary_type, dictionary_version, **kwargs):
    response = get_dictionary_cmds_response(request=request,
                                            dictionary_type=dictionary_type,
                                            dictionary_version=dictionary_version,
                                            **kwargs)

    if response.status_code == requests.codes.ok:
        total = response.headers.get('x-total-count')
        commands = [DictionaryCmdModel(cmd) for cmd in response.json()]

        return total, commands

    logger.warning(response)
    return 0, []


def get_dictionary_evrs(request, dictionary_type, dictionary_version, **kwargs):
    response = get_dictionary_evrs_response(request=request,
                                            dictionary_type=dictionary_type,
                                            dictionary_version=dictionary_version,
                                            **kwargs)

    if response.status_code == requests.codes.ok:
        total = response.headers.get('x-total-count')
        commands = [DictionaryEvrModel(evr) for evr in response.json()]

        return total, commands

    logger.warning(response)
    return 0, []


def get_dictionary_ehas(request, dictionary_type, dictionary_version, **kwargs):
    response = get_dictionary_ehas_response(request=request,
                                            dictionary_type=dictionary_type,
                                            dictionary_version=dictionary_version,
                                            **kwargs)

    if response.status_code == requests.codes.ok:
        total = response.headers.get('x-total-count')
        commands = [DictionaryEhaModel(eha) for eha in response.json()]

        return total, commands

    logger.warning(response)
    return 0, []
