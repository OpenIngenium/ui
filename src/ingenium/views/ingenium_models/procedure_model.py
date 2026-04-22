from ingenium.views.ingenium_models.model_base import ModelBase


class ProcedureModel(ModelBase):

    """
        {
            "title": "string",
            "description": "string",
            "institutional_id": "string",
            "author": "string",
            "locked_by": "string",
            "deprecated": true,
            "procedure_id": "string",
            "time_created": "string",
            "current_version": 0,
            "current_released_version": 0,
            "time_saved": "string",
            "status": "VERSIONED"
        }
    """
    TRUE_FALSE_CHOICES = (True, False)

    def __init__(self, json_object):
        ModelBase.__init__(self, json_object=json_object)

    def get_title(self):
        if hasattr(self, 'title'):
            return self.title

    def get_description(self):
        if hasattr(self, 'description'):
            return self.description

    def get_institutional_id(self):
        if hasattr(self, 'institutional_id'):
            return self.institutional_id

    def get_author(self):
        if hasattr(self, 'author'):
            return self.author

    def get_locked_by(self):
        if hasattr(self, 'locked_by'):
            return self.locked_by

    def get_deprecated(self):
        if hasattr(self, 'deprecated'):
            return self.deprecated

    def get_procedure_id(self):
        if hasattr(self, 'procedure_id'):
            return self.procedure_id

    def get_time_created(self):
        if hasattr(self, 'time_created'):
            return self.get_date_and_time(self.time_created, default=None)

    def get_current_version(self):
        if hasattr(self, 'current_version'):
            return self.current_version

    def get_current_released_version(self):
        if hasattr(self, 'current_released_version'):
            return self.current_released_version

    def get_time_saved(self):
        if hasattr(self, 'time_saved'):
            return self.get_date_and_time(self.time_saved, default=None)

    def get_status(self):
        if hasattr(self, 'status'):
            return self.status

    def get_read_only(self, user):
        return self.get_locked_by() != user.get_username()
