from django.http import HttpResponse, JsonResponse
from django.template.loader import render_to_string
from django_up_tools.templatetags.up_tools_tags import clean_response_html
from django_up_tools.views.get_param_from_request import string_from_request

from ingenium.views.requests.proxy.dict_service.dict_service_dictionary_proxy import get_dictionary_cmd_arguments_response


def manual_input_add_row_html(request):
    return __generate_row__(
        request=request,
        template_name="ui/elements/executable/manual_input/manual_input_element.html"
    )


def get_venue_configuration_html(request):
    return __generate_row__(
        request=request,
        template_name="ui/elements/executable/venue_config_get/venue_config_get_element.html"
    )


def check_venue_configuration_html(request):
    return __generate_row__(
        request=request,
        template_name="ui/elements/executable/venue_config_check/venue_config_check_element.html"
    )


def gds_html(request):
    return __generate_row__(
        request=request,
        template_name="ui/elements/executable/gds_manual/gds_element.html"
    )


def update_venue_configuration_html(request):
    return __generate_row__(
        request=request,
        template_name="ui/elements/executable/venue_config_update/venue_config_update_element.html"
    )


def verify_eha_data_row_html(request):
    return __generate_row__(
        request=request,
        template_name="ui/elements/executable/verify_eha/verify_eha_element.html"
    )


def cmd_builder_wizard_arg_row_html(request):
    template_name = "ui/wizards/cmd_bulder_repeat_arg_row.html"
    command_stem = string_from_request(request.POST, 'command_stem')
    dictionary_type = string_from_request(request.POST, 'dictionary_type')
    dictionary_version = string_from_request(request.POST, 'dictionary_version')
    cmd_arguments_response = get_dictionary_cmd_arguments_response(request,
                                                                   dictionary_type,
                                                                   dictionary_version,
                                                                   command_stem,
                                                                   repeat_args="true")
    if cmd_arguments_response.status_code != 200:
        try:
            response_data = cmd_arguments_response.json()
        except ValueError:
            response_data = {"error": cmd_arguments_response.text}

        return JsonResponse(status=cmd_arguments_response.status_code, data=response_data)

    repeat_args = cmd_arguments_response.json()

    html = render_to_string(template_name, {
        "repeat_args": repeat_args,
        "values": []
    })
    return HttpResponse(clean_response_html(html), status=200)


def cmd_data_row_html(request):
    return __generate_row__(
        request=request,
        template_name="ui/elements/executable/cmd/cmd_element.html"
    )


def cmd_file_data_row_html(request):
    return __generate_row__(
        request=request,
        template_name="ui/elements/executable/cmd_file/cmd_file_element.html"
    )


def cmd_scmf_data_row_html(request):
    return __generate_row__(
        request=request,
        template_name="ui/elements/executable/cmd_scmf/cmd_scmf_element.html"
    )


def cmd_sse_data_row_html(request):
    return __generate_row__(
        request=request,
        template_name="ui/elements/executable/cmd_sse/cmd_sse_element.html"
    )


def wait_html(request):
    return __generate_row__(
        request=request,
        template_name="ui/elements/executable/wait/wait_element.html"
    )


def wait_eha_data_row_html(request):
    return __generate_row__(
        request=request,
        template_name="ui/elements/executable/wait_eha/wait_eha_element.html"
    )


def __generate_row__(request, template_name):
    """
    This will give us access to context variables within our Element Template when we render

    :param request:
    :param template_name:
    :return:
    """
    element_type_id = string_from_request(request.GET, 'element_type_id', None)
    execution_id = string_from_request(request.GET, 'execution_id', None)
    # Execution ID can be string 'None'. See manual_input_form.html line 254
    if execution_id == 'None':
        execution_id = None

    element = None
    if element_type_id:
        element = None

    html = render_to_string(template_name, {
        'element': element,
        'execution_id': execution_id,
    })
    return HttpResponse(clean_response_html(html), status=200)
