from ingenium.views.ingenium_models.model_base import ModelBase


class ExecutionModel(ModelBase):

    """
        {
            "execution_id": "string",
            "description": "string",
            "url": "string",
            "api_version": "string",
            "test_conductors": [],
            "observers": [],
            "time_started": "2017-05-02T21:51:00Z",
            "time_completed": "2017-05-02T21:51:00Z",
            "venue_name": "string",
            "venue_id": "string"
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

    def get_execution_id(self):
        if hasattr(self, 'execution_id'):
            return self.execution_id

    def get_time_complete_date(self):
        if hasattr(self, 'time_completed'):
            return self.get_date_and_time(self.time_completed, default=None)

    def get_time_started_date(self):
        if hasattr(self, 'time_started'):
            return self.get_date_and_time(self.time_started)

    def get_time_completed_date(self):
        if hasattr(self, 'time_completed'):
            return self.get_date_and_time(self.time_completed)

    def get_run_time(self):
        start = self.get_time_started_date()
        end = self.get_time_completed_date()

        if start and end:
            return end - start

    def get_test_conductors(self):
        if hasattr(self, 'test_conductors') and self.test_conductors:
            return ", ".join(conductor for conductor in self.test_conductors)

    def get_description(self):
        if hasattr(self, 'description'):
            return self.description

    def get_status(self):
        if hasattr(self, 'status'):
            if self.status is None:
                return ''
            return self.status

    def get_status_enum(self):
        if hasattr(self, 'status'):
            if self.status is None:
                return ''
            return self.status

    def is_in_progress(self):
        return True if self.get_status() == "In Progress" else False

    def is_complete(self):
        return True if self.get_status() == "Complete" else False

    def get_mode(self):
        if hasattr(self, 'mode'):
            return self.mode