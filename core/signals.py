from django.db.models.signals import post_save
from django.dispatch import receiver
from django.conf import settings

from .models import Student

User = settings.AUTH_USER_MODEL


# ----------------------
# CREATE STUDENT (on register)
# ----------------------
@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_student(sender, instance, created, **kwargs):
    if created:
        Student.objects.create(
            user=instance,
            email=instance.email,
            first_name=instance.first_name,
            last_name=instance.last_name
        )


# ----------------------
# SYNC STUDENT (on update)
# ----------------------
@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def sync_student(sender, instance, created, **kwargs):
    if not created:
        try:
            student = instance.student
            student.first_name = instance.first_name
            student.last_name = instance.last_name
            student.email = instance.email
            student.save()
        except Student.DoesNotExist:
            pass