from ingenium.backend.ingenium_user_backend import IngeniumUserBackend


class IngeniumUserMiddleware(object):
    """
    Since we aren't using a database we do this to wrap up our custom User inside the request.user.  This way it behaves
    the way you expect any Django App to work
    """
    def process_request(self, request):
        request.user = IngeniumUserBackend().get_user(request)
