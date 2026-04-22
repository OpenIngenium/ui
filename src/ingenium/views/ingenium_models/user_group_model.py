from ingenium.views.ingenium_models.model_base import ModelBase


class UserGroupModel(ModelBase):
    """
    {
      "id": 1,
      "name": "ingenium-dev",
      "createdAt": "2017-11-15T18:34:58.000Z",
      "updatedAt": "2017-11-15T18:34:58.000Z",
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
      ]
    }
    """

    def __init__(self, json_object=None):
        ModelBase.__init__(self, json_object=json_object)

    def get_name(self):
        if hasattr(self, 'name'):
            return self.name

        return None

    def get_create_date(self):
        if hasattr(self, 'createdAt'):
            return self.get_date_and_time(self.createdAt)

        return None

    def get_updated_date(self):
        if hasattr(self, 'updatedAt'):
            return self.get_date_and_time(self.updatedAt)

        return None

    def get_scopes(self):
        if hasattr(self, 'scopes'):
            return self.scopes

        return None

    def get_roles(self):
        if hasattr(self, 'roles'):
            return self.roles

        return None
