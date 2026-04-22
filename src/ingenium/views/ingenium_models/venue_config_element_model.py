from ingenium.views.ingenium_models.model_base import ModelBase


class VenueConfigElementModel(ModelBase):
    """
        {
          "elem_template_id": "uuid",
          "name": "string",
          "type": "string",
          "description": "string"
        }
    """

    # see venue-config swagger for source of truth
    TYPES = ("SIMULATOR", "BREADBOARD", "EM", "FLIGHT", "OTHER")
    STATUSES = ("INSTALLED", "NOT_INSTALLED")

    def __init__(self, json_object=None):
        ModelBase.__init__(self, json_object=json_object)

    def get_id(self):
        if hasattr(self, 'elem_template_id'):
            return self.elem_template_id

    def get_name(self):
        if hasattr(self, 'name'):
            return self.name

    def get_type(self):
        if hasattr(self, 'type'):
            return self.type

    def get_description(self):
        if hasattr(self, 'description'):
            return self.description
