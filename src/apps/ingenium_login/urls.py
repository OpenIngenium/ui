from django.conf.urls import url

from apps.ingenium_login.views.login_page import login_request, logout_request, renew_token_request

urlpatterns = (
    url(r'^login/', login_request, name="public_login"),
    url(r'^logout/', logout_request, name="public_logout"),
    url(r'^renew/', renew_token_request, name="renew_token"),
)
