from django.conf.urls import url

from ingenium.views.requests.ajax import dynamic_element_api

q = [
    # Manual Input Dynamic Element
    url(r'^manual_input/row/$', dynamic_element_api.manual_input_add_row_html,
        name="manual_input_add_row_html"),

    url(r'^get_venue_configuration/row/$', dynamic_element_api.get_venue_configuration_html,
        name="get_venue_configuration_html"),

    url(r'^check_venue_configuration/row/$', dynamic_element_api.check_venue_configuration_html,
        name="check_venue_configuration_html"),

    url(r'^gds_manual/row/$', dynamic_element_api.gds_html, name="gds_html"),
    url(r'^wait/row/$', dynamic_element_api.wait_html, name="wait_html"),

    url(r'^update_venue_configuration/row/$', dynamic_element_api.update_venue_configuration_html,
        name="update_venue_configuration_html"),

    url(r'^verify_eha/row/$', dynamic_element_api.verify_eha_data_row_html, name="verify_eha_data_row_html"),
    url(r'^cmd/row/$', dynamic_element_api.cmd_data_row_html, name="cmd_data_row_html"),
    url(r'^cmd_file/row/$', dynamic_element_api.cmd_file_data_row_html, name="cmd_file_data_row_html"),
    url(r'^cmd_sse/row/$', dynamic_element_api.cmd_sse_data_row_html, name="cmd_sse_data_row_html"),
    url(r'^cmd_scmf/row/$', dynamic_element_api.cmd_scmf_data_row_html, name="cmd_scmf_data_row_html"),
    url(r'^wait_eha/row/$', dynamic_element_api.wait_eha_data_row_html, name="wait_eha_data_row_html"),

    # Command Builder Wizard - Repeat Arg Row
    url(r'^cmd/builder/arg/row/$', dynamic_element_api.cmd_builder_wizard_arg_row_html,
        name="cmd_builder_repeat_arg_row_html"),

]

urlpatterns = q
