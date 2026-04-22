from django.apps import AppConfig


class ApplicationConfig(AppConfig):
    name = 'ingenium'
    verbose_name = "Ingenium"

    def ready(self):
        pass
