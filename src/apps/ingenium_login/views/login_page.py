# - * - Coding: utf -8 - * -
from urllib.parse import urlparse

import settings
import requests
from django.conf import settings as django_settings
from django.contrib.auth import authenticate
from django.http import HttpResponseRedirect
from django.shortcuts import render

from apps.ingenium_login.views.token_controller import renew_token, authenticate_vnv_user
from ingenium.views.controllers.request_controller import post_request, get_request

if settings.AUTH_METHOD == 'rsa':
    SECRET_LABEL = 'RSA (PIN + TOKENCODE)'
else:
    SECRET_LABEL = 'JPL Password'

def renew_token_request(request):
    return renew_token(request)


def logout_request(request):
    response = HttpResponseRedirect('/')
    if request.GET:
        redirect = request.GET.get('next')

        if redirect and not is_absolute(redirect):
            response = HttpResponseRedirect('/login?next='+redirect)

    # Explicitly Log out of Auth
    post_request(url=django_settings.AUTH_LOGOUT_URL, data=None, token=request.user.get_token())

    # Explicitly log out of VnV Server
    # get_request(url=django_settings.VNV_LOGOUT, data=None, token=request.user.get_token())

    response.delete_cookie('access_token')
    response.delete_cookie('access_token_timeout')

    # Flush session
    if request.session:
        request.session.clear()

    return response


def login_request(request):
    redirect = __get_redirect__(request)

    # User is already Authenticated
    if request.user.is_authenticated():
        return HttpResponseRedirect(redirect)

    # If we aren't posting back
    if request.method != 'POST':
        return __render_login_page__(request, redirect, None)

    username = request.POST.get('username', None)
    password = request.POST.get('password', None)

    if not _validate_form(username, password):
        return __render_login_page__(request, redirect, "Missing Username or Password")

    user = authenticate(username=username, password=password, request=request)
    
    # User Couldn't authenticate
    if not user.status_code == requests.codes.ok:
        return __render_login_page__(request, redirect, user.error_message)

    response = HttpResponseRedirect(redirect)

    response.set_cookie('access_token', user.get_token())
    response.set_cookie('access_token_timeout', user.access_token_timeout)
    response.set_cookie('expiration_date', user.get_access_expiration())

    return response


def _validate_form(username, password):
    if username is None or password is None:
        return False

    return True


def __render_login_page__(request, redirect, errors):
    return render(request, 'login.html', {
        'next': redirect,
        'login_errors': errors,
        'secret_label': SECRET_LABEL
    })


def __get_redirect__(request):
    redirect = django_settings.LOGIN_REDIRECT_AFTER_LOGIN
    if request.GET:
        redirect = request.GET.get('next')

        if redirect and not is_absolute(redirect):
            return redirect

    return redirect


def is_absolute(url):
    return bool(urlparse(url).netloc)
