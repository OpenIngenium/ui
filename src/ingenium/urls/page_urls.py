from django.conf.urls import url, include
from django.views.generic import RedirectView

from ingenium.views.requests.pages import spa_page

q = [
    # STILL DJANGO
    url(r'admin/', include('ingenium.urls.pages_admin_urls')),

    # VUE
    url(r'^venues/(?P<venue_id>[\w\-]+)/$', spa_page.venue_detail_spa_page,
        name="venue_detail_page"),
    url(r'^$', spa_page.dashboard_spa_page, name="index"),

    url(r'^authoring/(?P<procedure_id>[\w\-]+)/(?P<version>[\w\-]+)/$', spa_page.authoring_spa_page, name="authoring_page"),
    url(r'^authoring/(?P<procedure_id>[\w\-]+)/(?P<version>[\w\-]+)\?update$', spa_page.authoring_spa_page, name="authoring_page"),
    url(r'^procedures/(?P<procedure_id>[\w\-]+)$', spa_page.authoring_spa_page, name="procedure_versions_page"),
    url(r'^procedures/$', spa_page.authoring_spa_page, name="procedures_page"),

    url(r'^executions/$', spa_page.executions_spa_page, name="executions_page"),
    url(r'^reporting/$', spa_page.reporting_spa_page, name="reporting_page"),
    url(r'^search/$', spa_page.search_spa_page, name="search_page"),

    url(r'^execute/(?P<venue_id>[\w\-]+)/$', spa_page.execution_spa_page, name="execution_page"),
    url(r'^execute_spa/(?P<venue_id>[\w\-]+)/(?P<execution_id>[\w-]+)/$', spa_page.execution_spa_page, name="spa_execution_page"),

    url(r'^execute/as_run/(?P<execution_id>[\w\-]+)/$', spa_page.execution_as_run_spa_page, name="execution_as_run_page"),

    url(r'^project_configuration/.*/$', spa_page.project_configuration_spa_page, name="project_configuration_page"),
]

urlpatterns = q
