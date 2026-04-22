from ingenium.views.ingenium_models.model_base import ModelBase


class CommentModel(ModelBase):

    """
        {
            "comment_id":"04a52b69-135f-4bfa-965d-48d12f2139c0",
            "execution_id":"",
            "content":"<p>abc test</p>",
            "files":[],
            "user_id":"abouharb",
            "time_updated":"2017-12-07T22:40:55.967Z"
        }
    """

    def __init__(self, json_object=None):
        ModelBase.__init__(self, json_object=json_object)

    def get_comment(self):
        if hasattr(self, 'content'):
            return self.content

        return None

    def get_username(self):
        if hasattr(self, 'user_id'):
            return self.user_id

        return None

    def get_timestamp(self):
        if hasattr(self, 'time_updated'):
            return self.get_date_and_time(self.time_updated)
