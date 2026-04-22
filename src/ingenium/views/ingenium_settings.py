import settings


class IngeniumSettings:
    """
    This will wrap direct setting calls to prevent accidental errors if a setting is not defined.  Any settings being
    passed into the context of a page should be defined here.
    """

    def __init__(self):
        pass

    @staticmethod
    def debug_information_enabled():
        if hasattr(settings, 'ENABLE_DEBUG_INFORMATION'):
            return settings.ENABLE_DEBUG_INFORMATION

        return False
