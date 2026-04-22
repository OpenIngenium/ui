from django.http import JsonResponse
from django_up_tools.views.get_param_from_request import string_from_request

from ingenium.views.requests.proxy.core.core_execution_proxy import close_execution_response, \
    end_current_step_execution_response, update_execution_response, resume_execution_response


def close_execution_api(request, execution_id):
    response = close_execution_response(request, execution_id)

    return JsonResponse(status=200, data={})

def resume_execution_api(request, execution_id):
    venue_id = string_from_request(request.POST, 'venue_id', None)
    
    response = resume_execution_response(request, execution_id, venue_id=venue_id)
    
    return JsonResponse(status=response.status_code, safe=False, data=response.json())


def end_current_step_execution_api(request, execution_id):
    response = end_current_step_execution_response(request, execution_id)

    return JsonResponse(status=response.status_code, safe=False, data={})


def update_execution_api(request):
    description = string_from_request(request.POST, 'description', None)
    execution_id = string_from_request(request.POST, 'execution_id', None)

    response = update_execution_response(request, execution_id, description=description)

    data = {
        'description': description,
    }

    status_code = response.status_code
    if status_code == 204:
        status_code = 200

    return JsonResponse(status=status_code, safe=False, data=data)
