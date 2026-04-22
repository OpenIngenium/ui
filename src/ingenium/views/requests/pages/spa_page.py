from django.shortcuts import render

from django.conf import settings


def authoring_spa_page(request, procedure_id=None, version=None):
    return render(request, 'ui/pages/author/spa_authoring.html', {
        'authoring_js_bundle': settings.AUTHORING_JS_BUNDLE,
    })

def dashboard_spa_page(request):
    return render(request, 'ui/pages/dashboard/dashboard.html', {
        'dashboard_js_bundle': settings.DASHBOARD_JS_BUNDLE,
    })

def executions_spa_page(request):
    return render(request, 'ui/pages/executions/executions.html', {
        'executions_js_bundle':  settings.EXECUTIONS_JS_BUNDLE,
    })

def execution_spa_page(request, venue_id, execution_id):
    return render(request, 'ui/pages/execute/spa_execution.html', {
        'execution_js_bundle': settings.EXECUTION_JS_BUNDLE,
    })

def execution_as_run_spa_page(request, execution_id):
    return render(request, 'ui/pages/execute/execution_as_run.html', {
        'execute_as_run_js_bundle': settings.EXECUTE_AS_RUN_JS_BUNDLE,
    })

def reporting_spa_page(request):
    return render(request, 'ui/pages/reporting/reporting.html', {
        'reporting_js_bundle': settings.REPORTING_JS_BUNDLE,
    })

def search_spa_page(request):
    return render(request, 'ui/pages/search/search.html', {
        'search_js_bundle': settings.SEARCH_JS_BUNDLE,
    })

def project_configuration_spa_page(request):
    return render(request, 'ui/pages/project_configuration/project_config.html', {
        'project_config_js_bundle': settings.PROJECT_CONFIG_JS_BUNDLE,
    })

def project_configuration_version_spa_page(request, version):
    return render(request, 'ui/pages/project_configuration/project_config.html', {
        'project_config_js_bundle': settings.PROJECT_CONFIG_JS_BUNDLE,
    })

def venue_detail_spa_page(request, venue_id):
    return render(request, 'ui/pages/venue/venue_detail.html', {
        'venue_id': venue_id,
        'venue_detail_js_bundle': settings.VENUE_DETAIL_JS_BUNDLE,
})