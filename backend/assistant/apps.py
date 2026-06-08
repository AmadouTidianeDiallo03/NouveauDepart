from django.apps import AppConfig


class AssistantConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "assistant"

    def ready(self):
        from .config import print_startup_diagnostics

        print_startup_diagnostics()
