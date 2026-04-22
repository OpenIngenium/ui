from ingenium.views.ingenium_models.model_base import ModelBase
import dateutil.parser


class VenueConfigurationHistoryModel(ModelBase):
    """
    {
        "time": "string",
        "venue_id": "string",
        "elem_name": "string",
        "field_name": "string",
        "old_value": "string",
        "new_value": "string"
    }
    """

    def __init__(self, json_object=None):
        ModelBase.__init__(self, json_object=json_object)

    def get_time(self):
        if hasattr(self, 'time'):
            return self.time

    def get_parsed_time(self):
        d = dateutil.parser.parse(self.time)
        return d.strftime("%b. %d, %Y, %I:%M %p")

    def get_venue_id(self):
        if hasattr(self, 'venue_id'):
            return self.venue_id

    def get_elem_name(self):
        if hasattr(self, 'elem_name'):
            return self.elem_name

    def get_changes(self):
        if hasattr(self, 'changes'):
            return self.changes
