from ingenium.views.ingenium_models.model_base import ModelBase


class VerificationActivityModel(ModelBase):
    """
    {
      "name": "string",
      "vaId": "string",
      "vaURI": "string"
    }
    """

    def __init__(self, json_object=None):
        ModelBase.__init__(self, json_object=json_object)

    def get_id(self):
        if hasattr(self, 'vaId'):
            return self.vaId

    def get_name(self):
        if hasattr(self, 'name'):
            return self.name

    def get_va_uri(self):
        if hasattr(self, 'vaURI'):
            return self.vaURI
