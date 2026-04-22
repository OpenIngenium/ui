from ingenium.views.ingenium_models.model_base import ModelBase


class ProcedureVersionModel(ModelBase):

    """
{
  "version_description": "string",
  "institutional_release_id": "string",
  "version_author": "string",
  "api_version": "string",
  "deprecated": true,
  "procedure_id": "string",
  "version_id": "string",
  "version": 0,
  "time_versioned": "string",
  "time_released": "string",
  "status": "WORKING"
}
    """

    def __init__(self, json_object):
        ModelBase.__init__(self, json_object=json_object)

    def get_version_description(self):
        if hasattr(self, 'version_description'):
            return self.version_description

    def get_institutional_release_id(self):
        if hasattr(self, 'institutional_release_id'):
            return self.institutional_release_id

    def get_version_author(self):
        if hasattr(self, 'version_author'):
            return self.version_author

    def get_api_version(self):
        if hasattr(self, 'api_version'):
            return self.api_version

    def get_deprecated(self):
        if hasattr(self, 'deprecated'):
            return self.deprecated

    def get_dictionary(self):
        if hasattr(self, 'dictionary'):
            return self.dictionary

    def get_flight_dictionary(self):
        if hasattr(self, 'flight_dictionary_version'):
            return self.flight_dictionary_version
    
    def get_sse_dictionary(self):
        if hasattr(self, 'sse_dictionary_version'):
            return self.sse_dictionary_version

    def get_procedure_id(self):
        if hasattr(self, 'procedure_id'):
            return self.procedure_id

    def get_version_id(self):
        if hasattr(self, 'version_id'):
            return self.version_id

    def get_version(self):
        if hasattr(self, 'version'):
            return self.version

    def get_time_versioned(self):
        if hasattr(self, 'time_versioned'):
            return self.get_date_and_time(self.time_versioned, default=None)

    def get_time_released(self):
        if hasattr(self, 'time_released'):
            return self.get_date_and_time(self.time_released, default=None)

    def get_time_saved(self):
        if hasattr(self, 'time_saved'):
            return self.get_date_and_time(self.time_saved, default=None)

    def get_status(self):
        if hasattr(self, 'status'):
            return self.status
