from ingenium.views.ingenium_models.model_base import ModelBase


class DictionaryEhaModel(ModelBase):
    """
      {
        "eha_name": "string",
        "channel_id": "string",
        "operations_category": "string",
        "eha_description": "string",
        "derived": "Yes"
      }
    """

    def get_name(self):
        if hasattr(self, 'eha_name'):
            return self.eha_name

    def get_operation(self):
        if hasattr(self, 'operations_category'):
            return self.operations_category

    def get_description(self):
        if hasattr(self, 'eha_description'):
            return self.eha_description

    def get_derived(self):
        if hasattr(self, 'derived'):
            return self.derived

    def get_channel_id(self):
        if hasattr(self, 'channel_id'):
            return self.channel_id
