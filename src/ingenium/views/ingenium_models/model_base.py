import json

from dateutil import parser


class ModelBase:
    def __init__(self, json_object=None):
        if json_object:
            self.__dict__ = json_object

    def get_json(self):
        """
        Will return back a String representing the JSON object;  This will be what is sent to Ingenium
        
        :return: 
        """
        return json.dumps(self.__dict__)

    def response_json(self):
        """
        Send Response to Ingenium API endpoints we can overwrite this here
        :return:
        """
        return json.dumps(self.__dict__)

    def get_date_and_time(self, value, default=None):
        if not value:
            return default

        try:
            return parser.parse(value)

        except ValueError as e:
            return default
