from django.http import JsonResponse
from django_up_tools.views.get_param_from_request import string_from_request

from ingenium.views.controllers.ldap_controller import user_lookup, group_lookup


def lookup_user(request):
    search_term = string_from_request(request.GET, 'q')

    user_names = user_lookup(request, search_term)

    if user_names is None:
        return JsonResponse(status=400, safe=False, data={'errors': ["Issue connecting to auth service"]})

    user_names = [user['username'] for user in user_names]

    return JsonResponse(status=200, safe=False, data=user_names)


def lookup_group(request):
    search_term = string_from_request(request.GET, 'q')

    group_names = group_lookup(request, search_term)

    if group_names is None:
        return JsonResponse(status=400, safe=False, data={'errors': ["Issue connecting to auth service"]})

    return JsonResponse(status=200, safe=False, data=group_names)
