from django_up_tools.views.get_param_from_request import string_from_request
from django_up_tools.views.modal_util import up_modal_request_json_response

from ingenium.views.controllers.dictionary_controller import get_dictionary_by_pk, get_active_parser
from ingenium.views.controllers.permission_controller import get_all_permissions
from ingenium.views.controllers.role_controller import get_role_by_id
from ingenium.views.controllers.venue_controller import get_venue_by_id
from ingenium.views.ingenium_models.dictionary_model import DictionaryModel
from ingenium.views.ingenium_models.role_model import RoleModel
from ingenium.views.ingenium_models.venue_model import VenueModel


def update_venue_modal(request):
    venue_id = string_from_request(request.POST, 'venue_id', None)

    if venue_id:
        venue = get_venue_by_id(request, venue_id)
    else:
        venue = VenueModel()

    return up_modal_request_json_response(template_path="ui/data_tables/venues/update_venue_form_modal.html",
                                          context={
                                              'venue': venue,
                                              'types': VenueModel.TYPES,
                                          })


def update_sse_dictionary_modal(request):
    return update_dictionary_modal(request, DictionaryModel.DICTIONARY_SSE_ID)


def update_flight_dictionary_modal(request):
    return update_dictionary_modal(request, DictionaryModel.DICTIONARY_FLIGHT_ID)


def update_dictionary_modal(request, dictionary_type):
    """

    :param dictionary_type:
    :param request:
    :return:
    """
    dictionary_version = string_from_request(request.POST, 'version', None)

    active_parser = get_active_parser(request, dictionary_type)

    if dictionary_version:
        dictionary = get_dictionary_by_pk(request, dictionary_type, dictionary_version)
    else:
        dictionary = DictionaryModel(json_object={'dictionary_type': dictionary_type})
    return up_modal_request_json_response(template_path="ui/data_tables/dictionaries/update_dictionary_form_modal.html",
                                          context={
                                              'dictionary': dictionary,
                                              'active_parser': active_parser,
                                          })


def delete_venue_modal(request):
    venue_id = string_from_request(request.POST, 'venue_id', None)
    venue = get_venue_by_id(request, venue_id)

    return up_modal_request_json_response(template_path="ui/data_tables/venues/delete_venue_form_modal.html",
                                          context={
                                              'venue': venue,
                                          })


def update_status_venue_modal(request):
    venue_id = string_from_request(request.POST, 'venue_id', None)
    venue = get_venue_by_id(request, venue_id)

    return up_modal_request_json_response(template_path="ui/data_tables/venues/update_status_venue_form_modal.html",
                                          context={
                                              'venue': venue,
                                          })


def stop_execution_venue_modal(request):
    venue_id = string_from_request(request.POST, 'venue_id', None)
    venue = get_venue_by_id(request, venue_id)

    return up_modal_request_json_response(template_path="ui/data_tables/venues/stop_execution_venue_form_modal.html",
                                          context={
                                              'venue': venue,
                                          })


def update_role_modal(request):
    role_id = string_from_request(request.POST, 'role_id', None)

    if role_id:
        role = get_role_by_id(request, role_id)
    else:
        role = RoleModel()

    permissions = get_all_permissions(request)

    return up_modal_request_json_response(template_path="ui/data_tables/roles/update_role_form_modal.html",
                                          context={
                                              'role': role,
                                              'permissions': permissions,
                                          })


def delete_role_modal(request):
    role_id = string_from_request(request.POST, 'role_id', None)
    role = get_role_by_id(request, role_id)

    return up_modal_request_json_response(template_path="ui/data_tables/roles/delete_role_form_modal.html",
                                          context={
                                              'role': role,
                                          })


def delete_dictionary_modal(request):
    dictionary_type = string_from_request(request.POST, 'type', None)
    dictionary_version = string_from_request(request.POST, 'version', None)

    return up_modal_request_json_response(template_path="ui/data_tables/dictionaries/delete_dictionary_form_modal.html",
                                          context={
                                              'dictionary_type': dictionary_type,
                                              'dictionary_version': dictionary_version,
                                          })
