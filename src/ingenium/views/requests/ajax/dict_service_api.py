import os
from django.http import JsonResponse
from django_up_tools.views.get_param_from_request import string_from_request

from ingenium.views.ingenium_models.dictionary_model import DictionaryModel
from ingenium.views.requests.proxy.dict_service.dict_service_dictionary_proxy import lookup_cmd_names_response, \
    lookup_evr_names_response, lookup_eha_names_response, delete_dictionary_response, add_dictionary_response, \
    update_dictionary, update_dictionary_parser_response


def lookup_cmd_names(request):
    command_stem = string_from_request(request.GET, 'q', None)
    dictionary_type = string_from_request(request.GET, 'dictionary_type', None)
    flight_dictionary_version = string_from_request(request.GET, 'flight_dictionary_version', None)
    sse_dictionary_version = string_from_request(request.GET, 'sse_dictionary_version', None)

    response = lookup_cmd_names_response(
        request=request,
        command_stem=command_stem,
        dictionary_type=dictionary_type,
        flight_dictionary_version=flight_dictionary_version,
        sse_dictionary_version=sse_dictionary_version
    )

    if response.status_code == 200:
        return JsonResponse(status=200, safe=False, data=response.json())

    return JsonResponse(status=response.status_code, safe=False, data={})


def lookup_evr_names(request):
    evr_name = string_from_request(request.GET, 'q', None)
    dictionary_type = string_from_request(request.GET, 'dictionary_type', None)
    sse_dictionary_version = string_from_request(request.GET, 'sse_dictionary_version', None)
    flight_dictionary_version = string_from_request(request.GET, 'flight_dictionary_version', None)

    response = lookup_evr_names_response(
        request=request,
        evr_name=evr_name,
        dictionary_type=dictionary_type,
        sse_dictionary_version=sse_dictionary_version,
        flight_dictionary_version=flight_dictionary_version,
    )

    if response.status_code == 200:
        return JsonResponse(status=200, safe=False, data=response.json())

    return JsonResponse(status=response.status_code, safe=False, data={})


def lookup_eha_names(request):
    eha_name = string_from_request(request.GET, 'q', None)
    dictionary_type = string_from_request(request.GET, 'dictionary_type', "")
    sse_dictionary_version = string_from_request(request.GET, 'sse_dictionary_version', None)
    flight_dictionary_version = string_from_request(request.GET, 'flight_dictionary_version', None)

    response = lookup_eha_names_response(
        request=request,
        eha_name=eha_name,
        dictionary_type=dictionary_type,
        sse_dictionary_version=sse_dictionary_version,
        flight_dictionary_version=flight_dictionary_version,
    )

    if response.status_code == 200:
        return JsonResponse(status=200, safe=False, data=response.json())

    return JsonResponse(status=response.status_code, safe=False, data={})


def delete_dictionary(request):
    dictionary_type = string_from_request(request.POST, 'type', None)
    dictionary_version = string_from_request(request.POST, 'version', None)

    response = delete_dictionary_response(
        request=request,
        dictionary_type=dictionary_type,
        dictionary_version=dictionary_version
    )

    return JsonResponse(status=response.status_code, safe=False, data={})


def update_sse_dictionary_parser(request):
    parser_name = string_from_request(request.POST, 'active_sse_dictionary_parser')
    return update_dictionary_parser(request, DictionaryModel.DICTIONARY_SSE_ID, parser_name)


def update_flight_dictionary_parser(request):
    parser_name = string_from_request(request.POST, 'active_flight_dictionary_parser')
    return update_dictionary_parser(request, DictionaryModel.DICTIONARY_FLIGHT_ID, parser_name)


def update_dictionary_parser(request, dictionary_type, parser_name):
    if not parser_name:
        return JsonResponse(status=400, safe=False, data={'errors': ["Missing Parser Name"]})

    response = update_dictionary_parser_response(
        request=request,
        dictionary_type=dictionary_type,
        parser_name=parser_name,
    )

    return JsonResponse(status=response.status_code, safe=False, data={})


def add_sse_dictionary(request):
    dictionary_version = string_from_request(request.POST, 'version', None)
    state = string_from_request(request.POST, 'state', None)
    dictionary_description = string_from_request(request.POST, 'description', None)
    files = get_dict_files_from_request(request)

    response = add_dictionary_response(
        request=request,
        dictionary_type=DictionaryModel.DICTIONARY_SSE_ID,
        dictionary_version=dictionary_version,
        state=state,
        dictionary_description=dictionary_description,
        files=files,
    )

    # No Response is returned from this endpoint just a 204
    return JsonResponse(status=response.status_code, safe=False, data={})


def add_flight_dictionary(request):
    dictionary_version = string_from_request(request.POST, 'version', None)
    state = string_from_request(request.POST, 'state', None)
    dictionary_description = string_from_request(request.POST, 'description', None)
    files = get_dict_files_from_request(request)

    response = add_dictionary_response(
        request=request,
        dictionary_type=DictionaryModel.DICTIONARY_FLIGHT_ID,
        dictionary_version=dictionary_version,
        state=state,
        dictionary_description=dictionary_description,
        files=files,
    )

    # No Response is returned from this endpoint just a 204
    return JsonResponse(status=response.status_code, safe=False, data={})


def update_sse_dictionary(request):
    dictionary_version = string_from_request(request.POST, 'version_number', None)
    state = string_from_request(request.POST, 'state', None)
    dictionary_description = string_from_request(request.POST, 'description', None)
    files = get_dict_files_from_request(request)

    response = update_dictionary(
        request=request,
        dictionary_type=DictionaryModel.DICTIONARY_SSE_ID,
        dictionary_version=dictionary_version,
        state=state,
        dictionary_description=dictionary_description,
        files=files,
    )

    # No Response is returned from this endpoint just a 204
    return JsonResponse(status=response.status_code, safe=False, data={})


def update_flight_dictionary(request):
    dictionary_version = string_from_request(request.POST, 'version_number', None)
    state = string_from_request(request.POST, 'state', None)
    dictionary_description = string_from_request(request.POST, 'description', None)
    files = get_dict_files_from_request(request)

    response = update_dictionary(
        request=request,
        dictionary_type=DictionaryModel.DICTIONARY_FLIGHT_ID,
        dictionary_version=dictionary_version,
        state=state,
        dictionary_description=dictionary_description,
        files=files,
    )

    # No Response is returned from this endpoint just a 204
    return JsonResponse(status=response.status_code, safe=False, data={})


def get_dict_files_from_request(request):
    dictionary_file = request.FILES.get('dictionary_file')

    if dictionary_file:
        filename, file_extension = os.path.splitext(dictionary_file.name)

        if file_extension.lower() == ".xml":
            mime_type = 'application/xml'

        elif file_extension.lower() == ".tar":
            mime_type = 'application/x-tar'

        else:
            return None

        return {
            "file_content": (dictionary_file.name, dictionary_file.read(), mime_type),
        }

    return None
