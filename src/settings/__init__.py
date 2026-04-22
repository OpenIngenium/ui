import os

SERVER_ENVIRONMENT = os.environ.get('SERVER_ENVIRONMENT')

if SERVER_ENVIRONMENT in ["prod"]:
    print("Using Production Settings")
    from .production import *
else:
    print("Using Local Settings")
    from .local import *
