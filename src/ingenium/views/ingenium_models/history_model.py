from django_up_tools.templatetags.up_tools_tags import clean_response_html

from ingenium.views.ingenium_models.model_base import ModelBase


class HistoryModel(ModelBase):
    def __init__(self, request, json_object=None):
        ModelBase.__init__(self, json_object=json_object)
        self.request = request

    def get_execution_status(self):
        if hasattr(self, 'status'):
            return self.status

    def get_children(self):
        """
        Get the children of this execution

        :return:
        """
        elements = []
        if hasattr(self, 'children'):

            for instance_info in self.children:
                element_instance = None

                element = None
                element_instance.element = element

                elements.append(element)

        return elements

    def get_all_execution_javascript(self):
        elements = self.get_children()
        result = ''
        elements_types_processed = set()

        if elements:
            for element in elements:
                result += self.get_individual_step_javascript(element, elements_types_processed)

            return clean_response_html(result)

    def get_individual_step_javascript(self, element, elements_types_processed):
        if element.get_element_type_id() in elements_types_processed:
            result = ''
        else:
            result = element.render_javascript_template()
            elements_types_processed.add(element.get_element_type_id())

        if not element.has_children():
            return result

        for child in element.get_children():
            result += self.get_individual_step_javascript(child, elements_types_processed)

        return result
