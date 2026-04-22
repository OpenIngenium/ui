from django.conf.urls import url, include

from ingenium.views.requests.ajax import execution_api

q = [

    url(r'elements/', include('ingenium.urls.core_element_urls')),

    url(r'^execution/update/$', execution_api.update_execution_api, name="update_execution_api"),
    url(r'^execution/(?P<execution_id>[\w\-]+)/close/$', execution_api.close_execution_api, name="close_execution_api"),
    url(r'^execution/(?P<execution_id>[\w\-]+)/resume/$', execution_api.resume_execution_api, name="resume_execution_api"),
    url(r'^execution/(?P<execution_id>[\w\-]+)/halt/step/$', execution_api.end_current_step_execution_api,
        name="end_execution_step"),

]

urlpatterns = q
