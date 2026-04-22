from ingenium.views.ingenium_models.model_base import ModelBase


class VenueModel(ModelBase):
    WSTS_TYPE_ID = 0
    TESTBED_TYPE_ID = 1
    ATLO_TYPE_ID = 2
    OTHER_TYPE_ID = 3

    TYPES = (
        (WSTS_TYPE_ID, "WSTS"),
        (TESTBED_TYPE_ID, "Testbed"),
        (ATLO_TYPE_ID, "ATLO"),
        (OTHER_TYPE_ID, "Other"),
    )

    VENUE_STATUS_AVAILABLE_ID = "AVAILABLE"
    VENUE_STATUS_IN_USE_ID = "IN_USE"
    VENUE_STATUS_UNKNOWN_ID = "UNKNOWN"
    VENUE_STATUS_DOWN_ID = "DOWN"
    VENUE_STATUS_RETIRED_ID = "RETIRED"

    VENUE_STATUS_LABELS = {
        VENUE_STATUS_AVAILABLE_ID: "Available",
        VENUE_STATUS_IN_USE_ID: "In Use",
        VENUE_STATUS_UNKNOWN_ID: "Unknown",
        VENUE_STATUS_DOWN_ID: "Down",
        VENUE_STATUS_RETIRED_ID: "Retired",
    }

    """
        {
            "venue_id": "1",
            "name": "Name 1",
            "description": "string",
            "ampcs_address": "string",
            "sse_address": "string",
            "location": "string",
            "type": "WSTS",
            "venue_status": {
                "test_conductor": "string",
                "execution_id": "string",
                "started_on": "2017-03-22T19:38:11.796Z",
                "status": "AVAILABLE"
            }
        }
    """

    def __init__(self, json_object=None):
        ModelBase.__init__(self, json_object=json_object)

    def get_json(self):
        return ModelBase.get_json(self)

    def response_json(self):
        # We shouldn't be serializing this and sending it to Ingenium
        if hasattr(self, 'venue_status'):
            delattr(self, 'venue_status')

        return ModelBase.get_json(self)

    def get_venue_id(self):
        if hasattr(self, 'venue_id'):
            return self.venue_id

        return ""

    def get_status(self):
        if hasattr(self, 'venue_status'):
            return self.venue_status.get('status')

    def get_friendly_status(self):
        status = self.get_status()

        if status:
            return self.VENUE_STATUS_LABELS.get(status)

    def get_test_conductor(self):
        if hasattr(self, 'venue_status'):
            return self.venue_status.get('test_conductor')

    def get_execution_id(self):
        if hasattr(self, 'venue_status'):
            return self.venue_status.get('execution_id')

    def get_test_started_on(self):
        if hasattr(self, 'venue_status'):
            started_on_str = self.venue_status.get('started_on')

            if started_on_str:
                return self.get_date_and_time(started_on_str)

    def get_type(self):
        if hasattr(self, 'type'):
            return self.type

    def get_name(self):
        if hasattr(self, 'name'):
            return self.name

    def is_available(self):
        return True if self.get_status() == self.VENUE_STATUS_AVAILABLE_ID else False

    def is_offline(self):
        return True if self.get_status() == self.VENUE_STATUS_DOWN_ID else False

    def is_in_use(self):
        return True if self.get_status() == self.VENUE_STATUS_IN_USE_ID else False

    def is_unknown(self):
        return True if self.get_status() == self.VENUE_STATUS_UNKNOWN_ID else False

    def is_retired(self):
        return True if self.get_status() == self.VENUE_STATUS_RETIRED_ID else False
