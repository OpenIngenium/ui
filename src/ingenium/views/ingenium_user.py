import datetime

import jwt
import cryptography
import settings


class IngeniumUser(object):
    """
    Very special since we don't want to have a database we need a way of passing a user object around so Django and our
    plugins play nice.
    """

    def save(self):
        """saving to DB disabled"""
        pass

    objects = None

    def __init__(self):
        self.access = None
        self.decoded_access = None

    def is_authenticated(self):
        return True if self.access else False

    def get_full_name(self):
        return self.get_username()

    def get_username(self):

        if self.access:
            decoded = self.decode_access_jwt()
            return decoded.get('username')
        return ""

    def is_admin(self):
        if self.access:
            decoded = self.decode_access_jwt()
            permissions = decoded.get('scopes')

            if "admin" in permissions:
                return True

        return False

    def get_access_expiration(self):
        if self.access:
            decoded = self.decode_access_jwt()
            return decoded.get('exp')

        return None

    def get_access_iat(self):
        if self.access:
            decoded = self.decode_access_jwt()
            return decoded.get('iat')

        return None

    def get_access_iat_datetime(self):

        iat = self.get_access_iat()

        if iat:
            return datetime.datetime.utcfromtimestamp(iat)

    def decode_access_jwt(self):
        if not self.decoded_access:
            self.decoded_access = jwt.decode(self.access,
                                             settings.AUTH_PUBLIC_PEM,
                                             algorithms=settings.AUTH_SECRET_KEY_ALGORITHMS)

        return self.decoded_access

    def get_permissions(self):
        if self.access:
            decoded = self.decode_access_jwt()
            return decoded.get('scopes')
        return None

    def get_roles(self):
        if self.access:
            decoded = self.decode_access_jwt()
            return decoded.get('roles')
        return None

    def get_token(self):
        return self.access

    def get_image_url(self):
        username = self.get_username()

        if username:
            return "/static/images/default-profile-photo.jpeg"

        return ""


class IngeniumAnonymousUser(IngeniumUser):
    def is_authenticated(self):
        return False
