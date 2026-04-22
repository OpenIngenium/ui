from ingenium.views.ingenium_models.model_base import ModelBase


class ExecutionRecordModel(ModelBase):
    """
        "meta_data": {
          "status": "PASS",
          "test_conductor": "TEST",
          "message": "",
          "time_completed": "2017-06-14T15:00:47.748Z",
          "time_started": "2017-06-14T15:00:47.663Z",
          'error': {
              'message': 'data_path was not provided',
              'error_type': 'USER_INPUT_ERROR',
              'details': [],
              'error_source': 'EMBEDDED_CODE',
              'http_code_at_source': 0
            }
        },
        "results": {
          "entries": [
            {
              "name": "var1",
              "actual_value": "abc"
            },
            {
              "name": "var2",
              "actual_value": "defg"
            }
          ]
        }
    """

    def __init__(self, json_object=None):
        ModelBase.__init__(self, json_object=json_object)

    def get_error(self):
        if hasattr(self, 'meta_data'):
            return self.meta_data.get('error')

    def get_error_message(self):
        error = self.get_error()

        if error:
            return error.get('message', "")

        return None

    def get_status(self):
        if hasattr(self, 'meta_data'):
            return self.meta_data.get('status')

    def execution_passed(self):
        status = self.get_status()

        if status and status.upper() == "PASS":
            return True

        return False

    def execution_error(self):
        status = self.get_status()

        if status and status.upper() == "ERROR":
            return True

        return False

    def execution_fail(self):
        status = self.get_status()

        if status and status.upper() == "FAIL":
            return True

        return False

    def execution_running(self):
        status = self.get_status()

        if status and status.upper() == "RUNNING":
            return True

        return False

    def execution_skipped(self):
        status = self.get_status()

        if status and status.upper() == "SKIPPED":
            return True

        return False

    def get_test_conductor(self):
        if hasattr(self, 'meta_data'):
            return self.meta_data.get('test_conductor')

    def get_message(self):
        if hasattr(self, 'meta_data'):
            return self.meta_data.get('message')

    def get_time_completed(self):
        if hasattr(self, 'meta_data'):
            return self.get_date_and_time(self.meta_data.get('time_completed'))

    def get_time_started(self):
        if hasattr(self, 'meta_data'):
            return self.get_date_and_time(self.meta_data.get('time_started'))

    def get_results(self):
        if hasattr(self, 'results'):
            return self.results

        return None
