from django.conf.urls import include, url

from ingenium.views.requests.partials.venue_partials import venues_display_html

q = [
    url(r'modal/', include('ingenium.urls.partial_modal_urls')),
    url(r'^dynamic_elements/', include('ingenium.urls.partial_dynamic_elements_urls')),
    url(r'^venues/render/venue_display/(?P<display_view>[\w\-]+)/$', venues_display_html, name="venues_display_html"),
]

urlpatterns = q
