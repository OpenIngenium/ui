from ingenium.views.ingenium_models.procedure_version_model import ProcedureVersionModel


class ProcedureVersionOutline(ProcedureVersionModel):

    """
    {
      "version_description": "string",
      "institutional_release_id": "string",
      "version_author": "string",
      "api_version": "string",
      "flight_dictionary_version": "string",
      "sse_dictionary_version": "string",
      "deprecated": true,
      "files": [
        {
          "file_id": "string",
          "file_name": "string",
          "execution_id": "string",
          "url": "string"
        }
      ],
      "procedure_id": "string",
      "version_id": "string",
      "version": 0,
      "time_versioned": "string",
      "time_released": "string",
      "time_saved": "string",
      "status": "WORKING",
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
    """

    def __init__(self, json_object):
        ProcedureVersionModel.__init__(self, json_object=json_object)

    def get_children(self):
        if hasattr(self, 'children'):
            return self.children
