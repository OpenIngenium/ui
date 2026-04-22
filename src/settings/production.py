from .base import *
import os

# Database
DATABASES = {
}

ALLOWED_HOSTS += ['*']

MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# Where Files are Uploaded (Relative or Absolute)
MEDIA_URL = '/media/'

# Absolute Path to the Static folder on the system
STATIC_ROOT = os.path.join(BASE_DIR, 'static')
STATIC_URL = '/static/'

AUTH_PUBLIC_PEM = os.environ.get('PUBLIC_PEM')

# Debugging Request/Responses from API Endpoints
ENABLE_DEBUG_INFORMATION = (os.environ.get('ENABLE_DEBUG_INFORMATION') == "True") or False

# Once SSL / Certs are installed we probably want to turn this to True
VERIFY_REQUESTS_SSL = False

DEBUG = False
TEMPLATE_DEBUG = False

# Sesson cache
REDIS_HOST = os.environ.get('REDIS_HOST', 'redis://auth_service_redis:6379/1')
CACHES = {
    "default": {
        "BACKEND": "django_redis.cache.RedisCache",
        # Note "/1" is appended because database "1" is used by default. For more detail, see 
        # https://django-redis-cache.readthedocs.io/en/latest/intro_quick_start.html#quick-start
        "LOCATION": REDIS_HOST,     
        "OPTIONS": {
            "CLIENT_CLASS": "django_redis.client.DefaultClient"
        },
        "KEY_PREFIX": "ui"
    } 
}
