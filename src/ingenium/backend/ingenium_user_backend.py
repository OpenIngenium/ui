from apps.ingenium_login.views.token_controller import get_user_from_request, authenticate_ingenium_user


class IngeniumUserBackend():
    # Create a User object if not already in the database?
    create_unknown_user = False

    def get_user(self, request):
        return get_user_from_request(request)

    def authenticate(self, username, password, **credentials):
        return authenticate_ingenium_user(username, password)
