from django.conf.urls import url

from ingenium.views.requests.partials.modals import admin_modals

q = [
    url(r'^manage/venue/update/$', admin_modals.update_venue_modal, name="update_venue_modal"),
    url(r'^manage/venue/delete/$', admin_modals.delete_venue_modal, name="delete_venue_modal"),
    url(r'^manage/venue/status/update/$', admin_modals.update_status_venue_modal, name="update_status_venue_modal"),
    url(r'^manage/venue/stop/$', admin_modals.stop_execution_venue_modal, name="stop_execution_venue_modal"),

    url(r'^manage/sse_dictionary/update/$', admin_modals.update_sse_dictionary_modal,
        name="update_sse_dictionary_modal"),

    url(r'^manage/flight_dictionary/update/$', admin_modals.update_flight_dictionary_modal,
        name="update_flight_dictionary_modal"),

    url(r'^manage/role/update/$', admin_modals.update_role_modal, name="update_role_modal"),
    url(r'^manage/role/delete/$', admin_modals.delete_role_modal, name="delete_role_modal"),

    url(r'^dictionary/delete/$', admin_modals.delete_dictionary_modal, name="delete_dictionary_modal"),
]

urlpatterns = q
