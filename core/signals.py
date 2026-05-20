import os

from django.db.models.signals import post_save, post_migrate
from django.dispatch import receiver
from django.contrib.auth import get_user_model

from .models import Student

User = get_user_model()


# ==================================================
# CREATE STUDENT WHEN USER IS CREATED
# ==================================================
@receiver(post_save, sender=User)
def create_student(sender, instance, created, **kwargs):
    if created:
        Student.objects.create(
            user=instance,
            email=instance.email,
            first_name=getattr(instance, "first_name", ""),
            last_name=getattr(instance, "last_name", "")
        )


# ==================================================
# SYNC STUDENT WHEN USER IS UPDATED
# ==================================================
@receiver(post_save, sender=User)
def sync_student(sender, instance, created, **kwargs):
    if not created:
        try:
            student = instance.student
            student.first_name = getattr(instance, "first_name", "")
            student.last_name = getattr(instance, "last_name", "")
            student.email = instance.email
            student.save()
        except Student.DoesNotExist:
            pass


# ==================================================
# AUTO CREATE / FIX ADMIN USER (RENDER SAFE)
# ==================================================
@receiver(post_migrate)
def create_admin_user(sender, **kwargs):
    """
    Creates an initial admin only when deployment env vars are provided.
    """
    if sender.name != "core":
        return

    admin_email = os.getenv("DJANGO_SUPERUSER_EMAIL")
    admin_password = os.getenv("DJANGO_SUPERUSER_PASSWORD")

    if not admin_email or not admin_password:
        return

    user, created = User.objects.get_or_create(
        email=admin_email,
        defaults={
            "is_staff": True,
            "is_superuser": True,
            "is_active": True,
        }
    )

    # Always enforce admin privileges
    user.is_staff = True
    user.is_superuser = True
    user.is_active = True

    user.set_password(admin_password)
    user.save()
