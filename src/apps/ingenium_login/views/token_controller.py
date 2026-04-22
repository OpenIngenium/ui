"""
This was designed to handle the read/writes to cookies/local storage and the retrieval as well
"""
# import ast
from datetime import datetime, timedelta

import jwt
import cryptography
import requests
from django.http import JsonResponse
from requests.auth import HTTPBasicAuth
from django.shortcuts import redirect
from django.http import HttpResponseRedirect
import settings
from ingenium.views.controllers.request_controller import post_request, get_request
from ingenium.views.ingenium_user import IngeniumUser, IngeniumAnonymousUser


def get_user_from_request(request):
    """
    Pull User from the Request
    :param request: 
    :return: 
    """
    access_token = request.COOKIES.get('access_token', None)

    if access_token:
        user = IngeniumUser()
        user.access = access_token
        user.access_token_timeout = request.COOKIES.get('access_token_timeout', None)

        return user

    return IngeniumAnonymousUser()


def authenticate_ingenium_user(username, password):
    """
    Used when authenticating User
    :param username: 
    :param password: 
    :return: 
    """
    headers = {
        'content-type': 'application/json',
    }

    auth = HTTPBasicAuth(username, password)
    
    headers['X-AUTH-METHOD'] = settings.AUTH_METHOD
    response = get_request(url=settings.AUTH_LOGIN_URL, auth=auth, headers=headers)

    response_json = response.json()
    user = IngeniumUser()
    user.status_code = response.status_code
    user.error_message = response_json.get('message')

    # Special Case:  Error message is wrapped up in a sub object we need to get
    # if user.error_message:
    #     message = ast.literal_eval(response_json.get('message'))
    #     user.error_message = message.get('message')

    if response.status_code == requests.codes.ok:
        user.access = response_json.get('access_token')
        user.access_token_timeout = response_json.get('access_token_timeout')

    return user


def authenticate_vnv_user(username, password, user):
    headers = {
        'X-Authorization': "Bearer %s" % user.get_token(),
    }

    auth = HTTPBasicAuth(username, password)
    return get_request(url=settings.VNV_LOGIN, auth=auth, headers=headers)


def renew_token(request, return_response=None):
    next_redirect = ''
    if request.GET:
        next_redirect = request.GET.get('next')

    response = renew_token_request(request, next_redirect)

    if return_response is None:
        return_response = JsonResponse(status=response.status_code, safe=False, data={})

    if response.status_code == 200:
        json_response = response.json()
        decoded_value = jwt.decode(json_response.get('access_token'),
                                   settings.AUTH_PUBLIC_PEM,              
                                   algorithms=settings.AUTH_SECRET_KEY_ALGORITHMS)

        expires = datetime.now() + timedelta(seconds=1800)
        return_response.set_cookie('access_token', json_response.get('access_token'), expires=expires.utctimetuple())
        return_response.set_cookie('expiration_date', decoded_value.get('exp'), expires=expires.utctimetuple())

    # This will logout user and on next user interaction the user will be logout and redirected to login
    elif response.status_code == 403:
        if next_redirect != '':
            return_response = HttpResponseRedirect('/logout?next='+next_redirect)

        return_response = HttpResponseRedirect('/logout')

    return return_response


def renew_token_request(request, next_redirect=''):
    # Redirect user if they dont exist
    if hasattr(request, 'user'):
        user = request.user

        headers = {
            'Content-Type': 'application/json',
            'Authorization': "Bearer %s" % user.get_token(),
        }

        return post_request(url=settings.AUTH_REFRESH_TOKEN_URL, headers=headers, data=None)
    else:
        if next_redirect != '':
            return redirect('/login?next='+next_redirect)
        return redirect('/login')
 