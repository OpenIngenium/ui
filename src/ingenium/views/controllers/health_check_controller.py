import settings
from ingenium.views.controllers.request_controller import get_request
from ingenium.views.ingenium_models.health_check_model import HealthCheckModel

TIMEOUT_SECONDS = 5


def get_all_health_check(request, **kwargs):
    archive = get_archive_health_check(request)
    auth = get_auth_health_check(request)
    core = get_core_health_check(request)
    dictionary = get_dictionary_health_check(request)
    execution = get_execution_health_check(request)
    venue_config = get_venue_config_health_check(request)

    return [auth, archive, core, dictionary, execution, venue_config]


def get_archive_health_check(request):
    try:
        response = get_request(url=settings.ARCHIVE_HEALTH_CHECK,
                               token=request.user.get_token(),
                               timeout=TIMEOUT_SECONDS)
        status_code = response.status_code
    except Exception:
        status_code = 500

    return HealthCheckModel({
        'name': "Archive API",
        'address': settings.ARCHIVE_HEALTH_CHECK,
        'status': status_code,
    })


def get_auth_health_check(request):
    try:
        response = get_request(url=settings.AUTH_HEALTH_CHECK_URL,
                               token=request.user.get_token(),
                               timeout=TIMEOUT_SECONDS)
        status_code = response.status_code
    except Exception:
        status_code = 500

    return HealthCheckModel({
        'name': "Authentication API",
        'address': settings.AUTH_HEALTH_CHECK_URL,
        'status': status_code,
    })


def get_core_health_check(request):
    try:
        response = get_request(url=settings.CORE_HEALTH_CHECK,
                               token=request.user.get_token(),
                               timeout=TIMEOUT_SECONDS)
        status_code = response.status_code
    except Exception:
        status_code = 500

    return HealthCheckModel({
        'name': "Core API",
        'address': settings.CORE_HEALTH_CHECK,
        'status': status_code,
    })


def get_dictionary_health_check(request):
    try:
        response = get_request(url=settings.DICTIONARY_HEALTH_CHECK_URL,
                               token=request.user.get_token(),
                               timeout=TIMEOUT_SECONDS)
        status_code = response.status_code
    except Exception:
        status_code = 500

    return HealthCheckModel({
        'name': "Dictionary API",
        'address': settings.DICTIONARY_HEALTH_CHECK_URL,
        'status': status_code,
    })


def get_execution_health_check(request):
    try:
        response = get_request(url=settings.EXECUTION_SERVER_HEALTH_CHECK_URL,
                               token=request.user.get_token(),
                               timeout=TIMEOUT_SECONDS)
        status_code = response.status_code
    except Exception:
        status_code = 500

    return HealthCheckModel({
        'name': "Execution Server",
        'address': settings.EXECUTION_SERVER_HEALTH_CHECK_URL,
        'status': status_code,
    })


def get_venue_config_health_check(request):
    try:
        response = get_request(url=settings.VENUE_CONFIG_SERVER_HEALTH_CHECK_URL,
                               token=request.user.get_token(),
                               timeout=TIMEOUT_SECONDS)
        status_code = response.status_code
    except Exception:
        status_code = 500

    return HealthCheckModel({
        'name': "Venue Config API",
        'address': settings.VENUE_CONFIG_SERVER_HEALTH_CHECK_URL,
        'status': status_code,
    })


