from django.conf.urls import url

from ingenium.views.requests.pages import admin_pages

q = [
    url(r'^$', admin_pages.admin_page, name="admin_index"),
    url(r'^venue_groups', admin_pages.admin_page, name="venue_groups_index"),
    url(r'^venues', admin_pages.admin_page, name="venues_index"),
    url(r'^parsers', admin_pages.admin_page, name="parsers_index"),
    url(r'^procedurelabels', admin_pages.admin_page, name="procedurelabel_index"),
    url(r'^permissions/groups', admin_pages.admin_page, name="permissions_index"),
    url(r'^permissions/users', admin_pages.admin_page, name="users_index"),
    url(r'^permissions/roles', admin_pages.admin_page, name="roles_index"),
    url(r'^preferences/personal', admin_pages.admin_page, name="personal_index"),
]

urlpatterns = q
