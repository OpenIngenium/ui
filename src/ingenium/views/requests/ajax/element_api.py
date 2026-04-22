import json
import logging
from django.http import JsonResponse
from django.template.loader import render_to_string
from django_up_tools.templatetags.up_tools_tags import clean_response_html
from django_up_tools.views.get_param_from_request import string_from_request

from ingenium.views.ingenium_settings import IngeniumSettings

logger = logging.getLogger(__name__)


def create_execution_element(request, execution_id, element_type_id):
    """
    This method is designed to return back an instance of the element; 
    
    This includes any HTML and JS.
    
    :param request: 
    :param execution_id:
    :param element_type_id: 
    :return: 
    """
    element = None

    insert_after_id = string_from_request(request.POST, 'insert_after_id')
    level = string_from_request(request.POST, 'level')

    params = {
        'insert_after_id': insert_after_id,
        'level': level,
    }

    # Call to create the element and also wrap the element.instance up
    response = element.create_element(request,
                                      execution_id=execution_id,
                                      params=params)

    if response.status_code == 200:
        args = {
            'request': request,
            'element_id': element.get_element_id(),
            'execution_id': execution_id,
            'element': element,
        }

        html = element.render_html_template(**args)
        javascript = element.render_javascript_template(**args)

        data = {
            'html': clean_response_html(html),
            'javascript': javascript,
            'element': response.json(),
        }

        return JsonResponse(status=200, safe=False, data=data)

    if response.text and IngeniumSettings.debug_information_enabled():
        return JsonResponse(status=400, data={
            "errors": response.text,
        })

    # Yikes something bad has occurred...
    return JsonResponse(status=400, data={})


def create_procedure_element(request, procedure_id, element_type_id):
    """
    This method is designed to return back an instance of the element;

    This includes any HTML and JS.

    :param request:
    :param procedure_id:
    :param element_type_id:
    :return:
    """
    element = None

    insert_after_id = string_from_request(request.POST, 'insert_after_id')
    level = string_from_request(request.POST, 'level')

    params = {
        'insert_after_id': insert_after_id,
        'level': level,
    }

    # Call to create the element and also wrap the element.instance up
    response = element.create_element(request,
                                      procedure_id=procedure_id,
                                      params=params)

    if response.status_code == 200:
        args = {
            'request': request,
            'element_id': element.get_element_id(),
            'procedure_id': procedure_id,
            'element': element,
        }

        html = element.render_html_template(**args)
        javascript = element.render_javascript_template(**args)

        data = {
            'html': clean_response_html(html),
            'javascript': javascript,
            'element': response.json(),
        }

        return JsonResponse(status=200, safe=False, data=data)

    if response.text and IngeniumSettings.debug_information_enabled():
        return JsonResponse(status=400, data={
            "errors": response.text,
        })

    # Yikes something bad has occurred...
    return JsonResponse(status=400, data={})


def remove_element(request):
    execution_id = string_from_request(request.POST, 'execution_id')
    procedure_id = string_from_request(request.POST, 'procedure_id')
    element_type_id = string_from_request(request.POST, 'element_type_id')
    element_id = string_from_request(request.POST, 'element_id')

    element = None

    response = element.delete_element(request,
                                      execution_id=execution_id,
                                      procedure_id=procedure_id,
                                      element_id=element_id)

    return JsonResponse(status=response.status_code, safe=False, data={
        'element': response.json(),
    })


def move_element(request):
    """
    :param request:
    :return:
    """

    execution_id = string_from_request(request.POST, 'execution_id')
    procedure_id = string_from_request(request.POST, 'procedure_id')
    element_type_id = string_from_request(request.POST, 'element_type_id')
    element_id = string_from_request(request.POST, 'element_id')

    element = None

    insert_after_id = string_from_request(request.POST, 'insert_after_id')
    level = string_from_request(request.POST, 'level')

    params = {
        'insert_after_id': insert_after_id,
        'level': level,
    }

    data = [
        element_id,
    ]

    response = element.move_element(request,
                                    execution_id=execution_id,
                                    procedure_id=procedure_id,
                                    params=params,
                                    data=json.dumps(data),
                                    element_id=element_id)

    return JsonResponse(status=response.status_code, safe=False, data={
        'element': response.json(),
    })


def update_base_element_field(request):
    """
    :param request:
    :param execution_id:
    :param element_type_id:
    :return:
    """

    # Maps to the Ingenium Key
    field_name = string_from_request(request.POST, 'field_name', None)
    field_value = string_from_request(request.POST, 'value', None)

    if field_value is None and field_name:
        field_value = string_from_request(request.POST, field_name, None)

    execution_id = string_from_request(request.POST, 'execution_id', None)
    procedure_id = string_from_request(request.POST, 'procedure_id', None)
    element_type_id = string_from_request(request.POST, 'element_type_id')
    element_id = string_from_request(request.POST, 'element_id', None)

    if not element_id:
        element_id = string_from_request(request.POST, 'pk')

    if not element_id:
        return JsonResponse(status=400, safe=False, data={})

    element = None

    data = {
        field_name: field_value,
        'elem_id': element_id,
    }

    response = element.patch_element(request=request,
                                     execution_id=execution_id,
                                     procedure_id=procedure_id,
                                     element_id=element_id,
                                     data=json.dumps(data),
                                     )

    # This is done because if you return back a status code of 204 then no DATA is sent back in the response.
    status_code = response.status_code
    if status_code == 204:
        status_code = 200

    return JsonResponse(status=status_code, safe=False, data=data)


def execute_element(request):
    execution_id = string_from_request(request.POST, 'execution_id')
    element_type_id = string_from_request(request.POST, 'element_type_id')
    element_id = string_from_request(request.POST, 'element_id')

    element = None
    response = element.execute_element(request=request, execution_id=execution_id, element_id=element_id)

    data = response.json()

    args = {
        'request': request,
        'element_id': element.get_element_id(),
        'execution_id': execution_id,
        'element': element,
    }

    data['html'] = clean_response_html(render_to_string(element.get_execution_result_template_path(), args))

    return JsonResponse(status=response.status_code, safe=False, data=data)


def update_element_step_content(request):
    element_type_id = string_from_request(request.POST, 'element_type_id')
    element_id = string_from_request(request.POST, 'element_id', None)

    if not element_id:
        element_id = string_from_request(request.POST, 'pk')

    if not element_id:
        return JsonResponse(status=400, safe=False, data={})

    element = None
    # Depending on the step different fields will be updated/etc
    return element.update_element_content(request)


def get_element_options(request):
    element_type_id = string_from_request(request.POST, 'element_type_id')
    element_id = string_from_request(request.POST, 'element_id', None)

    element = None
    # Populate Element
    element.get_element(request, element_id=element_id)

    # Depending on the step different fields will be updated/etc
    html = clean_response_html(element.render_option_template(request))

    return JsonResponse(status=200, safe=False, data={'html': html})


def element_comments(request):
    html, count = get_element_comment_html(request)

    return JsonResponse(status=200, safe=False, data={'html': html, 'count': count, })


def get_element_comment_html(request):
    element_id = string_from_request(request.POST, 'element_id')
    execution_id = string_from_request(request.POST, 'execution_id')

    offset = string_from_request(request.POST, 'offset', 0)
    limit = string_from_request(request.POST, 'limit', 50)
    sort = string_from_request(request.POST, 'limit', "DESC")

    # Returns back a wrapped version of the Comments
    comments = []

    html = render_to_string('ui/elements/comments/comments.html', {
        'comments': comments,
        'element_id': element_id,
        'execution_id': execution_id,
        'wysiwyg_form': None,
    })

    return clean_response_html(html), len(comments)


def add_element_comments(request):
    element_id = string_from_request(request.POST, 'element_id')
    # execution_id = string_from_request(request.POST, 'execution_id')
    comment = string_from_request(request.POST, 'comment')

    html, count = get_element_comment_html(request)

    return JsonResponse(status=200, safe=False, data={'html': html, 'count': count, })


def import_procedure_section(request):
    element_id = string_from_request(request.POST, 'element_id')
    execution_id = string_from_request(request.POST, 'execution_id')
    element_type_id = string_from_request(request.POST, 'element_type_id')
    element = None
    response = element.import_procedure(request=request, element_id=element_id, execution_id=execution_id)
    # not using the response at this time. just refreshing the page
    data = response.json()
    args = {
        'element': element,
        'response_json': response.json()
    }
    data['html'] = clean_response_html(render_to_string(element.get_execution_result_template_path(), args))
    return JsonResponse(status=response.status_code, safe=False, data=data)
