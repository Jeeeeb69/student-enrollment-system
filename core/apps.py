from django.apps import AppConfig


class CoreConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'core'

    def ready(self):
        import core.signals

        # force admin creation safely on startup
        from django.contrib.auth import get_user_model

        User = get_user_model()

        if not User.objects.filter(email="admin@gmail.com").exists():
            User.objects.create_superuser(
                email="admin@gmail.com",
                password="123",
                is_staff=True,
                is_superuser=True,
                is_active=True
            )