from ingenium.views.ingenium_models.model_base import ModelBase


class DictionaryEvrModel(ModelBase):
    """
      {
        "evr_name": "string",
        "evr_id": "string",
        "operations_category": "string",
        "evr_description": "string",
        "evr_message": "string",
        "evr_level": "string"
      }
    """

    def get_id(self):
        if hasattr(self, 'evr_id'):
            return self.evr_id

    def get_name(self):
        if hasattr(self, 'evr_name'):
            return self.evr_name

    def get_operation(self):
        if hasattr(self, 'operations_category'):
            return self.operations_category

    def get_description(self):
        if hasattr(self, 'evr_description'):
            return self.evr_description

    def get_message(self):
        if hasattr(self, 'evr_message'):
            return self.evr_message

    def get_level(self):
        if hasattr(self, 'evr_level'):
            return self.evr_level
