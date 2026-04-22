from ingenium.views.ingenium_models.model_base import ModelBase


class StepModel(ModelBase):

    """
    {
        "elem_id": "string",
        "elem_type": "EXECUTION",
        "execution_id": "string",
        "description": "string",
        "files": [
            {
            "file_id": "string",
            "file_name": "string",
            "execution_id": "string",
            "url": "string"
            }
        ],
        "comments": [
            null
        ],
        "number": "string",
        "step_type": "MANUAL_INPUT",
        "variable": {
            "name": "string"
        },
        "code": {
            "name": "string",
            "commit": "Latest",
            "release": "Latest"
        },
        "guard": "string",
        "notices": [
            {
                "category": "TESTBED_WARNING",
                "message": "string"
            }
        ]
    }
    """

    def __init__(self, json_object=None):
        ModelBase.__init__(self, json_object=json_object)

    def get_element_type(self):
        if hasattr(self, 'elem_type'):
            elem_type = self.elem_type

            if elem_type.lower() == "step":
                return self.step_type

            return self.elem_type

    def get_element_id(self):
        if hasattr(self, 'elem_type'):
            return self.elem_type