# This is based on django_login_required.middleware.LoginRequiredMiddleware
# The only change is to include query parameters of the request in the "next" query parameter of the redirected URL.
from django.conf import settings
from django.http import HttpResponseRedirect
from re import compile
import urllib.parse

EXEMPT_URLS = [compile(settings.LOGIN_URL.lstrip('/'))]
if hasattr(settings, 'LOGIN_EXEMPT_URLS'):
    EXEMPT_URLS += [compile(expr) for expr in settings.LOGIN_EXEMPT_URLS]


class LoginRequiredMiddleware:
    """
    Middleware that requires a user to be authenticated to view any page other
    than LOGIN_URL. Exemptions to this requirement can optionally be specified
    in settings via a list of regular expressions in LOGIN_EXEMPT_URLS (which
    you can copy from your urls.py).

    Requires authentication middleware and template context processors to be
    loaded. You'll get an error if they aren't.

    Also if you are using SessionSecurityMiddleware then this should come after teh sessionSecurityMiddleware import
    """

    def __init__(self):
        pass

    @staticmethod
    def process_request(request):
        assert hasattr(request, 'user'), "The Login Required middleware\
         requires authentication middleware to be installed. Edit your\
         MIDDLEWARE_CLASSES setting to insert\
         'django.contrib.auth.middleware.AuthenticationMiddleware'. If that doesn't\
         work, ensure your TEMPLATE_CONTEXT_PROCESSORS setting includes\
         'django.core.context_processors.auth'."

        # User is Not Authenticated
        if not request.user.is_authenticated():
            path = request.path_info.lstrip('/')
            if not any(m.match(path) for m in EXEMPT_URLS):
                if path != "":
                    query_string = request.META['QUERY_STRING']
                    if query_string:
                        next_str = settings.LOGIN_URL + "?next=/" + path + '?' + urllib.parse.quote(query_string)
                        return HttpResponseRedirect(next_str)
                    else:
                        next_str = settings.LOGIN_URL + "?next=/" + path
                        return HttpResponseRedirect(next_str)
                return HttpResponseRedirect(settings.LOGIN_URL)

        return None
