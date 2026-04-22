from datetime import datetime, timedelta

from jwt import ExpiredSignatureError

import settings
from apps.ingenium_login.views.login_page import logout_request
from apps.ingenium_login.views.token_controller import get_user_from_request, renew_token


class IngeniumSessionMiddleware(object):
    """
    Handle Session Management with the Tokens

    This Does a few things:

    1) Whenever a request comes through we check to make sure the JWT Hasn't expired.  If it has we log the user out
    2) When the response is sent we check to see if we should renew the token for the user.
        + Essentially we renew the token if an action is taken after the Token was initially provisioned + a few mins
    3) Whenever a request is is made we are setting the 'last_action' cookie

    """

    def process_request(self, request):
        user = get_user_from_request(request)

        # Check to see if the token expired.  If so log user out
        try:
            # If we try to decode an element and it has expired it will throw an error
            user.get_username()
        except ExpiredSignatureError:
            return logout_request(request)

    def process_response(self, request, response):

        return response


