from django.conf.urls import url

from ingenium.views.requests.ajax import element_api

q = [
    url(r'^create/execution_element/(?P<execution_id>[\w\-]+)/(?P<element_type_id>[\w\-]+)/$',
        element_api.create_execution_element, name="create_execution_element"),

    url(r'^create/procedure_element/(?P<procedure_id>[\w\-]+)/(?P<element_type_id>[\w\-]+)/$',
        element_api.create_procedure_element, name="create_procedure_element"),

    url(r'^remove/element/$', element_api.remove_element, name="remove_element_api"),
    url(r'^move/element/$', element_api.move_element, name="move_element_api"),
    url(r'^update/base/element/$', element_api.update_base_element_field, name="update_base_element_api"),
    url(r'^update/content/element/$', element_api.update_element_step_content, name="update_element_step_content_api"),
    url(r'^run/element/$', element_api.execute_element, name="execute_element_api"),
    url(r'^get/options/html/$', element_api.get_element_options, name="element_options_api"),

    url(r'^add/comments/element/$', element_api.add_element_comments, name="add_comments_element_api"),
    url(r'^comments/element/$', element_api.element_comments, name="comments_element_api"),

    # Procedure Section Import
    url(r'^procedure_section/import/$', element_api.import_procedure_section, name="import_procedure_section"),

]

urlpatterns = q
