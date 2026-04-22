from ingenium.views.ingenium_models.model_base import ModelBase


class VerificationActivityGroupModel(ModelBase):
    """
        {
          "name": "string",
          "parent": "string",
          "vagURI": "string"
          "vagId": "string"
        }
    """

    def __init__(self, json_object=None):
        ModelBase.__init__(self, json_object=json_object)

    def get_id(self):
        if hasattr(self, 'vagId'):
            return self.vagId

    def get_name(self):
        if hasattr(self, 'name'):
            return self.name

    def get_vag_uri(self):
        if hasattr(self, 'vagURI'):
            return self.vagURI

    def get_parent(self):
        if hasattr(self, 'parent'):
            return self.parent
