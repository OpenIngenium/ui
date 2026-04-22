from django.http import JsonResponse
from django_up_tools.views.get_param_from_request import string_from_request

from ingenium.views.requests.proxy.core.core_execution_proxy import close_execution_response
from ingenium.views.requests.proxy.core.core_venue_proxy import add_venue_response, update_venue_response, \
    update_status_venue_response, delete_venue_request


def add_venue(request):
    name = string_from_request(request.POST, 'name', None)
    description = string_from_request(request.POST, 'description', None)
    ampcs_address = string_from_request(request.POST, 'ampcs_address', None)
    sse_address = string_from_request(request.POST, 'sse_address', None)
    location = string_from_request(request.POST, 'location', None)
    venue_type = string_from_request(request.POST, 'type', None)

    # Validate Required Field is filled out
    if not name:
        return JsonResponse(status=400, data={
            'errors': ["Venue Name is required"]
        })

    response = add_venue_response(
        request=request,
        name=name,
        description=description,
        ampcs_address=ampcs_address,
        sse_address=sse_address,
        location=location,
        type=venue_type,
    )

    return JsonResponse(status=response.status_code, safe=False, data={})


def update_venue(request):
    venue_id = string_from_request(request.POST, 'venue_id', None)
    name = string_from_request(request.POST, 'name', None)
    description = string_from_request(request.POST, 'description', None)
    ampcs_address = string_from_request(request.POST, 'ampcs_address', None)
    sse_address = string_from_request(request.POST, 'sse_address', None)
    location = string_from_request(request.POST, 'location', None)
    venue_type = string_from_request(request.POST, 'type', None)

    # Validate Required Field is filled out
    if not venue_id:
        return JsonResponse(status=400, data={
            'errors': ["Venue ID is required"]
        })

    if not name:
        return JsonResponse(status=400, data={
            'errors': ["Venue Name is required"]
        })

    response = update_venue_response(
        request=request,
        venue_id=venue_id,
        name=name,
        description=description,
        ampcs_address=ampcs_address,
        sse_address=sse_address,
        location=location,
        type=venue_type,
    )

    # No Response is returned from this endpoint just a 204
    return JsonResponse(status=response.status_code, safe=False, data={})


def update_status_venue(request):
    venue_id = string_from_request(request.POST, 'venue_id', None)
    status = string_from_request(request.POST, 'status', None)

    response = update_status_venue_response(request=request, venue_id=venue_id, status=status)

    return JsonResponse(status=response.status_code, safe=False, data={})


def delete_venue(request):
    venue_id = string_from_request(request.POST, 'venue_id', None)
    response = delete_venue_request(request=request, venue_id=venue_id)

    return JsonResponse(status=response.status_code, safe=False, data={})


def stop_execution_venue(request):
    execution_id = string_from_request(request.POST, 'execution_id', None)

    response = close_execution_response(request, execution_id)

    return JsonResponse(status=response.status_code, safe=False, data={})