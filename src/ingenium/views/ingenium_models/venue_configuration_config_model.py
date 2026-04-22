from ingenium.views.ingenium_models.model_base import ModelBase


class VenueConfigurationConfigModel(ModelBase):
    """
      {
        "venue_id": "string",
        "venue_name": "string",
        "elem_name": "string",
        "description": "string",
        "type": "SIMULATOR",
        "notes": "string",
        "status": "INSTALLED",
        "serial_number": "string",
        "elem_id": "string",
        "last_updated": "string",
        "config_time": "string"
      }
    """

    def __init__(self, json_object=None):
        ModelBase.__init__(self, json_object=json_object)

    def get_venue_id(self):
        if hasattr(self, 'venue_id'):
            return self.venue_id

    def get_venue_name(self):
        if hasattr(self, 'venue_name'):
            return self.venue_name

    def get_elem_name(self):
        if hasattr(self, 'elem_name'):
            return self.elem_name

    def get_elem_id(self):
        if hasattr(self, 'elem_id'):
            return self.elem_id

    def get_description(self):
        if hasattr(self, 'description'):
            return self.description

    def get_type(self):
        if hasattr(self, 'type'):
            return self.type

    def get_notes(self):
        if hasattr(self, 'notes'):
            return self.notes

    def get_status(self):
        if hasattr(self, 'status'):
            return self.status

    def get_serial_number(self):
        if hasattr(self, 'serial_number'):
            return self.serial_number

    def get_last_updated(self):
        if hasattr(self, 'last_updated'):
            return self.last_updated

    def get_config_time(self):
        if hasattr(self, 'config_time'):
            return self.config_time
