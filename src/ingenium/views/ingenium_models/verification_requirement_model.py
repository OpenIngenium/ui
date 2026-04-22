from ingenium.views.ingenium_models.model_base import ModelBase


class VerificationRequirementModel(ModelBase):
    """
    {
      "name": "string",
      "reqId": "string",
      "text": "string"
    }
    """

    def __init__(self, json_object=None):
        ModelBase.__init__(self, json_object=json_object)

    def get_id(self):
        if hasattr(self, 'reqId'):
            return self.reqId

    def get_name(self):
        if hasattr(self, 'name'):
            return self.name

    def get_text(self):
        if hasattr(self, 'text'):
            return self.text
