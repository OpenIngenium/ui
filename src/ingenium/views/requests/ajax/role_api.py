from django.http import JsonResponse
from django_up_tools.views.get_param_from_request import string_from_request, ints_from_request

from ingenium.views.requests.proxy.auth_service.auth_service_role_proxy import add_role_response, update_role_response, \
    delete_role_response


def add_role(request):
    name = string_from_request(request.POST, 'name', None)
    description = string_from_request(request.POST, 'description', None)
    permissions = ints_from_request(request.POST, 'permissions', [])

    users = string_from_request(request.POST, 'users_id', None)
    groups = string_from_request(request.POST, 'groups_id', None)

    # take the CSV and make them into a list
    if users:
        users = [x.strip() for x in users.split(',')]
    else:
        users = []

    if groups:
        groups = [x.strip() for x in groups.split(',')]
    else:
        groups = []

    # Validate Required Field is filled out
    if not name:
        return JsonResponse(status=400, data={
            'errors': ["Name is required"]
        })

    response = add_role_response(
        request=request,
        name=name,
        description=description,
        permissions=permissions,
        users=users,
        groups=groups,

    )

    return JsonResponse(status=response.status_code, safe=False, data={})


def update_role(request):
    role_id = string_from_request(request.POST, 'role_id', None)
    name = string_from_request(request.POST, 'name', None)
    description = string_from_request(request.POST, 'description', None)
    permissions = ints_from_request(request.POST, 'permissions', [])

    users = string_from_request(request.POST, 'users_id', None)
    groups = string_from_request(request.POST, 'groups_id', None)

    # take the CSV and make them into a list
    if users:
        users = [x.strip() for x in users.split(',')]
    else:
        users = []

    if groups:
        groups = [x.strip() for x in groups.split(',')]
    else:
        groups = []

    # Validate Required Field is filled out
    if not name:
        return JsonResponse(status=400, data={
            'errors': ["Name is required"]
        })

    if not role_id:
        return JsonResponse(status=400, data={
            'errors': ["Role ID no defined"]
        })

    response = update_role_response(
        request=request,
        role_id=role_id,
        name=name,
        description=description,
        permissions=permissions,
        users=users,
        groups=groups,
    )

    # No Response is returned from this endpoint just a 204
    return JsonResponse(status=response.status_code, safe=False, data={})


def delete_role(request):
    role_id = string_from_request(request.POST, 'role_id', None)

    if not role_id:
        return JsonResponse(status=400, safe=False, data={'errors': ['Missing Role Id']})

    response = delete_role_response(request=request, role_id=role_id)

    return JsonResponse(status=response.status_code, safe=False, data={})