from ingenium.views.ingenium_models.model_base import ModelBase


class DictionaryCmdModel(ModelBase):
    """
      {
        "command_stem": "string",
        "operations_category": "string",
        "cmd_description": "string"
      }
    """

    def get_stem(self):
        if hasattr(self, 'command_stem'):
            return self.command_stem

    def get_operation(self):
        if hasattr(self, 'operations_category'):
            return self.operations_category

    def get_description(self):
        if hasattr(self, 'cmd_description'):
            return self.cmd_description
