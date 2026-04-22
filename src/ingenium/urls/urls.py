from django.conf.urls import url, include
from django.conf.urls.static import static

import settings
from ingenium.views.files import serve_file

q = [
        # Service Calls
        url(r'core/', include('ingenium.urls.core_urls')),
        url(r'partial/', include('ingenium.urls.partial_urls')),
        url(r'dictionary_service/', include('ingenium.urls.dict_service_urls')),
        url(r'authentication_service/', include('ingenium.urls.auth_service_urls')),

        # Used to map Uploaded files and serve them to Users
        url(r'^file_server/(?P<path>.*)', serve_file.serve_file, name='serve_uploaded_file'),

        # Plugins / Application
        url(r'^data_tables/', include('django_data_tables.urls')),

        # Pages
        url(r'^', include('ingenium.urls.page_urls')),
        url(r'^', include('apps.ingenium_login.urls')),

    ] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

urlpatterns = q
