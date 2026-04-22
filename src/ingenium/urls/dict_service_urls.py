from django.conf.urls import url

from ingenium.views.requests.ajax import dict_service_api

q = [
    url(r'^delete/dictionary/$', dict_service_api.delete_dictionary, name="delete_dictionary"),
    url(r'^update/sse/parser/$', dict_service_api.update_sse_dictionary_parser, name="update_sse_parser"),
    url(r'^update/flight/parser/$', dict_service_api.update_flight_dictionary_parser, name="update_flight_parser"),
    url(r'^lookup/cmd/names/$', dict_service_api.lookup_cmd_names, name="lookup_cmd_names"),
    url(r'^lookup/evr/names/$', dict_service_api.lookup_evr_names, name="lookup_evr_names"),
    url(r'^lookup/eha/names/$', dict_service_api.lookup_eha_names, name="lookup_eha_names"),

    url(r'^add/sse/dictionary/$', dict_service_api.add_sse_dictionary, name="add_sse_dictionary"),
    url(r'^add/flight/dictionary/$', dict_service_api.add_flight_dictionary, name="add_flight_dictionary"),

    url(r'^update/sse/dictionary/$', dict_service_api.update_sse_dictionary, name="update_sse_dictionary"),
    url(r'^update/flight/dictionary/$', dict_service_api.update_flight_dictionary, name="update_flight_dictionary"),
]

urlpatterns = q
