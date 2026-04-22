from ingenium.views.ingenium_models.model_base import ModelBase


class ProcedureSectionInputModel(ModelBase):

    """
    {
      "reference_procedure_id": "string",
      "reference_procedure_title": "string",
      "reference_procedure_version": 0,
      "reference_procedure_version_description": "string",
      "reference_procedure": {
        "procedure_id": "string",
        "version": 0,
        "version_id": "string",
        "children": [
          {
            "element_id": "string",
            "number": "string",
            "title": "string",
            "elem_type": "SECTION",
            "selected": true,
            "children": [
              {}
            ]
          }
        ]
      }
    }
    """

    def __init__(self, json_object=None):
        ModelBase.__init__(self, json_object=json_object)

    def get_children(self):
        """
        Get the children of this execution
        :return:
        """
        if hasattr(self, 'reference_procedure'):
            return self.reference_procedure['children']
