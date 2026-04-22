from ingenium.views.ingenium_models.model_base import ModelBase


class DictionaryModel(ModelBase):
    """
      {
        "creation_date": "string",
        "dictionary_version": "string",
        "dictionary_type": "SSE",
        "dictionary_description": "string",
        "state": "NOT_PUBLISHED"
      }
    """

    DICTIONARY_SSE_ID = "sse"
    DICTIONARY_FLIGHT_ID = "flight"

    # Key, Label
    DICTIONARY_TYPES = [
        (DICTIONARY_SSE_ID, "SSE"),
        (DICTIONARY_FLIGHT_ID, "FLIGHT"),
    ]

    PUBLISHED_RELEASED_STATE_IDS = ['PUBLISHED', 'RELEASED']
    # Key, label
    STATES = [
        ("PUBLISHED", "Published"),
        ("NOT_PUBLISHED", "Not Published"),
        ("RETIRED", "Retired"),
        ("RELEASED", "Released"),
    ]

    def __init__(self, json_object=None):
        ModelBase.__init__(self, json_object=json_object)

    def get_create_date(self):
        if hasattr(self, 'creation_date'):
            return self.get_date_and_time(self.creation_date, default=None)

    def get_version(self):
        if hasattr(self, 'dictionary_version'):
            return self.dictionary_version

    def get_type(self):
        if hasattr(self, 'dictionary_type'):
            return self.dictionary_type

    def get_description(self):
        if hasattr(self, 'dictionary_description'):
            return self.dictionary_description

    def get_state(self):
        if hasattr(self, 'state'):
            return self.state

    def is_flight_dictionary(self):
        dictionary_type = self.get_type()

        if type:
            return True if dictionary_type == self.DICTIONARY_FLIGHT_ID else False

        return False

    def is_sse_dictionary(self):
        dictionary_type = self.get_type()

        if type:
            return True if dictionary_type == self.DICTIONARY_SSE_ID else False

        return False
