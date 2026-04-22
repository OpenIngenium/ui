from django.conf.urls import url

import ingenium.views.requests.ajax.role_api
from ingenium.views.requests.ajax import ldap_api

q = [
    url(r'^roles/add/role/$', ingenium.views.requests.ajax.role_api.add_role, name="add_role"),
    url(r'^roles/update/role/$', ingenium.views.requests.ajax.role_api.update_role, name="update_role"),
    url(r'^roles/delete/role/$', ingenium.views.requests.ajax.role_api.delete_role, name="delete_role"),

    url(r'^lookup/user/$', ldap_api.lookup_user, name="lookup_user"),
    url(r'^lookup/group/$', ldap_api.lookup_group, name="lookup_group"),
]

urlpatterns = q
