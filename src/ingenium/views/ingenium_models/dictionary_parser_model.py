from ingenium.views.ingenium_models.model_base import ModelBase


class DictionaryParserModel(ModelBase):
    """
      {
        "name": "string",
        "description": "string",
        "status": "ACTIVE"
      }
    """

    ACTIVE_STATUS = "ACTIVE"

    def __init__(self, json_object=None):
        ModelBase.__init__(self, json_object=json_object)

    def get_name(self):
        if hasattr(self, 'name'):
            return self.name

    def get_description(self):
        if hasattr(self, 'description'):
            return self.description

    def get_status(self):
        if hasattr(self, 'status'):
            return self.status

    def is_active(self):
        return True if self.get_status() == self.ACTIVE_STATUS else False
