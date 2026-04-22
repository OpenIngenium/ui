from ingenium.views.ingenium_models.model_base import ModelBase


class UserModel(ModelBase):
    """
    {
      "id": 5,
      "display_name": null,
      "username": "abouharb",
      "createdAt": "2017-11-15T19:07:07.000Z",
      "updatedAt": "2017-11-16T17:34:14.000Z",
      "loggedin": "Yes",
      "scopes": [
        "admin",
        "monitor",
        "author",
        "developer",
        "execute:wsts",
        "execute:testbed",
        "execute:sit",
        "vnv:reporter",
        "config_mgmt",
        "curator"
      ],
      "roles": [
        "Admin"
      ],
      "groups": [
        "ingenium-dev"
      ]
    }
    """

    def __init__(self, json_object=None):
        ModelBase.__init__(self, json_object=json_object)

    def get_username(self):
        if hasattr(self, 'username'):
            return self.username

        return None

    def get_scopes(self):
        if hasattr(self, 'scopes'):
            return self.scopes

        return []

    def get_roles(self):
        if hasattr(self, 'roles'):
            return self.roles

        return []

    def get_groups(self):
        if hasattr(self, 'groups'):
            return self.groups

        return []

    def get_logged_in(self):
        if hasattr(self, 'loggedin'):
            return self.loggedin

        return None

    def get_create_date(self):
        if hasattr(self, 'createdAt'):
            return self.get_date_and_time(self.createdAt)

        return None

    def get_updated_date(self):
        if hasattr(self, 'updatedAt'):
            return self.get_date_and_time(self.updatedAt)

        return None
