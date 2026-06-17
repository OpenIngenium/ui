# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
import os

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'stream_to_console': {
            'class': 'logging.StreamHandler',
            'formatter': 'simple'
        },
    },
    'loggers': {
        '': {
            'handlers': ['stream_to_console'],
            'level': os.getenv('DJANGO_LOG_LEVEL', 'INFO'),
            'propagate': True
        },
    },
    'formatters': {
        'simple': {
            'format': '[%(levelname)s]: [%(asctime)s.%(msecs)03dZ] - %(message)s'
        },
    }
}

BASE_DIR = os.path.dirname(os.path.dirname(__file__))

STATICFILES_DIRS = [
    os.path.join(BASE_DIR, "client/dist"),
]

PROJECT_ROOT = os.path.abspath(os.path.dirname(__file__))

STATIC_URL = '/static/'

APPLICATION_TITLE = os.environ.get("APPLICATION_TITLE", "Europa Clipper")
APPLICATION_ACRONYM = os.environ.get("APPLICATION_ACRONYM", "Europa Clipper Ingenium")
UI_CUSTOM_FOOTER = os.environ.get("UI_CUSTOM_FOOTER", "")

# This is needed by Django;  Although we don't have a Database we still need to set this
SECRET_KEY = ')g*70jesw6ux^jn)glyq#i^efg$d^(w=qm)*2o(hr13(w7xc8%'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

# ALLOWED_HOSTS = ['127.0.0.1', 'localhost']
ALLOWED_HOSTS = ['*']
# Application definition
INSTALLED_APPS = (
    'django.contrib.staticfiles',
    # 'jpl_theme',
    'ingenium',
    'django_data_tables',
    'django_up_tools',
    'apps.ingenium_login',
    'froala_editor',
    'gunicorn',
    'django_js_reverse'
)

# WYSIWYG Settings
FROALA_INCLUDE_JQUERY = False
FROALA_EDITOR_OPTIONS = {
    'key': 'GG3E2G1A4vB3D2A1B2E5H5H4I1A16B11iYRUFVRb1XPLEe1IFg1==',
}


MIDDLEWARE_CLASSES = (
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'ingenium.middleware.ingenium_user_middleware.IngeniumUserMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'ingenium.middleware.ingenium_session_middleware.IngeniumSessionMiddleware',
    'ingenium.middleware.ingenium_login_middleware.LoginRequiredMiddleware',

)

AUTHENTICATION_BACKENDS = [
    'ingenium.backend.ingenium_user_backend.IngeniumUserBackend',
]

JPL_LOGIN_DISABLE_SESSION = True

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [os.path.join(BASE_DIR, '')],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                "django.contrib.auth.context_processors.auth",
                "django.template.context_processors.debug",
                "django.template.context_processors.i18n",
                # "django.template.context_processors.media",
                # 'jpl_theme.context_processor.theme_settings',
                "django.template.context_processors.static",
                "django.template.context_processors.tz",
                'django.template.context_processors.request',
                'ingenium.context_processors.global_settings',
                'ingenium.context_processors.user_session',
                'ingenium.context_processors.venue_types',
            ],
        },
    },
]

# Session Configuration
SESSION_ENGINE = "django.contrib.sessions.backends.cache"

SESSION_WARNING_EXPIRATION_IN_SECONDS = 70

# If any request come after the IAT has been issued + this variable then the session is auto renewed
SESSION_RENEW_IAT_AFTER_MINS = 3

ROOT_URLCONF = 'ingenium.urls'
WSGI_APPLICATION = 'ingenium.wsgi.application'

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'America/Los_Angeles'
USE_I18N = False
USE_L10N = True
USE_TZ = True

# Login Required Middleware
LOGIN_URL = '/login/'
LOGIN_EXEMPT_URLS = {'static/'}
LOGIN_REDIRECT_AFTER_LOGIN = "/"

# ------------------------------------------------------------------------------------
# INGENIUM API URLS
# ------------------------------------------------------------------------------------
# Debugging Request/Responses from API Endpoints
ENABLE_DEBUG_INFORMATION = False

# Once SSL / Certs are installed we probably want to turn this to True
VERIFY_REQUESTS_SSL = False

# JWT Stuff
AUTH_SECRET_KEY_ALGORITHMS = ['RS256']

# Core API
CORE_API_URL = os.environ.get('CORE_API_URL')

CORE_HEALTH_CHECK = CORE_API_URL + "health/"

# Execution API
EXECUTION_API_URL = CORE_API_URL
EXECUTIONS_URL = EXECUTION_API_URL + "executions/"

EXECUTION_CRUD_URL = EXECUTIONS_URL + "{0}"
EXECUTION_STATUS_URL = EXECUTIONS_URL + "{0}/status"
EXECUTION_STEPS_URL = EXECUTIONS_URL + "{0}/steps"
EXECUTION_AS_RUN = EXECUTIONS_URL + "{0}/as_run"
EXECUTION_CONTINUE_URL = EXECUTIONS_URL + "{0}/continue"
EXECUTION_HALT = EXECUTIONS_URL + "{0}/halt"
EXECUTION_RUN = EXECUTION_CRUD_URL + "/run"
EXECUTION_RESUME = EXECUTIONS_URL + "{0}/resume"

EXECUTION_SERVER_HEALTH_CHECK_URL = os.environ.get('EXECUTION_SERVER_URL') + 'health'

EXECUTION_ELEMENTS = EXECUTIONS_URL + "{0}/elements"

# Procedure API
PROCEDURE_API_URL = CORE_API_URL
PROCEDURES_URL = PROCEDURE_API_URL + "procedures/"

PROCEDURE_STRUCTURE = PROCEDURES_URL + "{0}/structure"
PROCEDURE_CRUD_URL = PROCEDURES_URL + "{0}/"
PROCEDURE_ELEMENTS = PROCEDURES_URL + "{0}/elements"
PROCEDURE_STEPS_URL = PROCEDURES_URL + "{0}/steps"
PROCEDURE_OPS_URL = PROCEDURE_CRUD_URL + "{1}/"

# Procedure Versions
PROCEDURE_VERSIONS_URL = PROCEDURES_URL + "{0}/versions/"
PROCEDURE_VERSIONS_CRUD_URL = PROCEDURES_URL + "{0}/versions/{1}"
PROCEDURE_VERSIONS_STRUCTURE_URL = PROCEDURE_VERSIONS_CRUD_URL + "/structure"
PROCEDURE_VERSIONS_OUTLINE_URL = PROCEDURE_VERSIONS_CRUD_URL + "/outline"

# Procedure_Section
PROCEDURE_SECTION_CRUD_URL = EXECUTION_CRUD_URL + '/procedure_sections/{1}'
PROCEDURE_SECTION_INPUT_URL = PROCEDURE_SECTION_CRUD_URL + '/input'
PROCEDURE_SECTION_STRUCTURE_URL = PROCEDURE_SECTION_CRUD_URL + '/structure'
PROCEDURE_SECTION_IMPORT_URL = PROCEDURE_SECTION_CRUD_URL + '/import'

# Procedure Procedure_Section
PROCEDURE_PROCEDURE_SECTION_URL = PROCEDURE_CRUD_URL + 'procedure_sections'
PROCEDURE_PROCEDURE_SECTION_CRUD_URL = PROCEDURE_PROCEDURE_SECTION_URL + "/{1}"
PROCEDURE_PROCEDURE_SECTION_STRUCTURE_URL = PROCEDURE_PROCEDURE_SECTION_CRUD_URL + "/structure"
PROCEDURE_PROCEDURE_SECTION_INPUT_URL = PROCEDURE_PROCEDURE_SECTION_CRUD_URL + "/input"

# File Uploading
FILE_UPLOAD_URL = CORE_API_URL
FILE_UPLOAD_ELEMENT_URL = FILE_UPLOAD_URL + "elements/{0}/files"
PROCEDURE_FILE_UPLOAD_ELEMENT_URL = CORE_API_URL + "procedures/{0}/" + "elements/{1}/files"

# Common API Calls
DELETE_ELEMENT = CORE_API_URL + "steps/{0}"
MOVE_EXECUTION_ELEMENT = EXECUTIONS_URL + "{0}/elements/move"
MOVE_PROCEDURE_ELEMENT = PROCEDURES_URL + "{0}/elements/move"

# Comments
COMMENTS_API_URL = CORE_API_URL
COMMENTS_URL = COMMENTS_API_URL + "elements/{0}/comments"

# ARCHIVE API
ARCHIVE_API_URL = os.environ.get('ARCHIVE_API_URL')
ARCHIVE_HEALTH_CHECK = ARCHIVE_API_URL + "health"

# VENUES API
VENUES_API_URL = CORE_API_URL
VENUES_URL = VENUES_API_URL + "venues/"
VENUES_CRUD_URL = VENUES_URL + "{0}"
VENUE_STATUS = VENUES_CRUD_URL + "/status"

# AUTH API
AUTH_API_URL = os.environ.get('AUTH_API_URL')
AUTH_LOGIN_URL = AUTH_API_URL + "login/"
AUTH_LOGOUT_URL = AUTH_API_URL + "logout/"
AUTH_REFRESH_TOKEN_URL = AUTH_API_URL + "refresh_token/"
AUTH_METHOD = os.environ.get('AUTH_METHOD', 'password').lower()

AUTH_HEALTH_CHECK_URL = AUTH_API_URL + "health/"

AUTH_LDAP_URL = AUTH_API_URL + "ldap/"
AUTH_LDAP_USER_LOOKUP = AUTH_API_URL + "ldap/users/"
AUTH_LDAP_GROUP_LOOKUP = AUTH_API_URL + "ldap/groups/"

AUTH_GROUPS_URL = AUTH_API_URL + "groups/"
AUTH_GROUPS_CRUD = AUTH_GROUPS_URL + "{0}"

AUTH_USERS_URL = AUTH_API_URL + "users/"
AUTH_USERS_CRUD = AUTH_USERS_URL + "{0}"

AUTH_ROLES_URL = AUTH_API_URL + "roles/"
AUTH_ROLES_CRUD = AUTH_ROLES_URL + "{0}"

AUTH_PERMISSIONS_URL = AUTH_API_URL + "permissions/"


# DICT API
DICT_API_URL = os.environ.get('DICT_API_URL')

DICTIONARIES_URL = DICT_API_URL + "dictionaries/{0}/versions"
DICTIONARIES_VERSION_URL = DICT_API_URL + "dictionaries/{0}/versions/{1}"
DICTIONARY_SSE_CMD_URL = DICT_API_URL + "dictionaries/sse/versions/{0}/cmds"
DICTIONARY_SSE_EVR_URL = DICT_API_URL + "dictionaries/sse/versions/{0}/evrs"
DICTIONARY_SSE_EHA_URL = DICT_API_URL + "dictionaries/sse/versions/{0}/ehas"
DICTIONARY_FLIGHT_CMD_URL = DICT_API_URL + "dictionaries/flight/versions/{0}/cmds"
DICTIONARY_FLIGHT_EVR_URL = DICT_API_URL + "dictionaries/flight/versions/{0}/evrs"
DICTIONARY_FLIGHT_EHA_URL = DICT_API_URL + "dictionaries/flight/versions/{0}/ehas"

DICTIONARY_PARSER = DICT_API_URL + "dictionaries/{0}/parsers"
DICTIONARY_HEALTH_CHECK_URL = DICT_API_URL + "health"


# JS BUNDLE FILE
AUTHORING_JS_BUNDLE = os.environ.get('AUTHORING_JS_BUNDLE')
DASHBOARD_JS_BUNDLE = os.environ.get('DASHBOARD_JS_BUNDLE')
EXECUTE_AS_RUN_JS_BUNDLE = os.environ.get('EXECUTE_AS_RUN_JS_BUNDLE')
EXECUTION_JS_BUNDLE = os.environ.get('EXECUTION_JS_BUNDLE')
EXECUTIONS_JS_BUNDLE = os.environ.get('EXECUTIONS_JS_BUNDLE')
PROJECT_CONFIG_JS_BUNDLE = os.environ.get('PROJECT_CONFIG_JS_BUNDLE')
VENUE_DETAIL_JS_BUNDLE = os.environ.get('VENUE_DETAIL_JS_BUNDLE')
REPORTING_JS_BUNDLE = os.environ.get('REPORTING_JS_BUNDLE')
HEADER_JS_BUNDLE = os.environ.get('HEADER_JS_BUNDLE')
ADMIN_JS_BUNDLE = os.environ.get('ADMIN_JS_BUNDLE')
SEARCH_JS_BUNDLE = os.environ.get('SEARCH_JS_BUNDLE')
