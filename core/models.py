from django.db import models, transaction
from django.core.exceptions import ValidationError
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.conf import settings


# ----------------------
# CUSTOM USER MANAGER
# ----------------------
class UserManager(BaseUserManager):

    def create_user(self, email, password=None, **extra_fields):

        if not email:
            raise ValueError("Email is required")

        email = self.normalize_email(email)

        user = self.model(
            email=email,
            **extra_fields
        )

        user.set_password(password)
        user.save(using=self._db)

        return user

    def create_superuser(self, email, password=None, **extra_fields):

        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)

        return self.create_user(
            email,
            password,
            **extra_fields
        )


# ----------------------
# CUSTOM USER (EMAIL LOGIN)
# ----------------------
class User(AbstractUser):

    username = None
    email = models.EmailField(unique=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    objects = UserManager()

    def __str__(self):
        return self.email


# ----------------------
# SUBJECT
# ----------------------
class Subject(models.Model):

    COURSE_CHOICES = [
        ('Information Technology', 'Information Technology'),
        ('Computer Science', 'Computer Science'),
        ('Technology Communication Management', 'Technology Communication Management'),
        ('GENERAL', 'GENERAL'),
    ]

    YEAR_CHOICES = [
        ('1st Year', '1st Year'),
        ('2nd Year', '2nd Year'),
        ('3rd Year', '3rd Year'),
        ('4th Year', '4th Year'),
    ]

    SEMESTER_CHOICES = [
        ('1st Sem', '1st Sem'),
        ('2nd Sem', '2nd Sem'),
    ]

    subject_code = models.CharField(max_length=20, unique=True)
    subject_name = models.CharField(max_length=100)
    units = models.IntegerField()

    course = models.CharField(
        max_length=100,
        choices=COURSE_CHOICES,
        default="GENERAL"
    )

    year_level = models.CharField(
        max_length=20,
        choices=YEAR_CHOICES,
        default="1st Year"
    )

    semester = models.CharField(
        max_length=20,
        choices=SEMESTER_CHOICES,
        default="1st Sem"
    )

    def __str__(self):
        return f"{self.subject_code} - {self.subject_name}"


# ----------------------
# STUDENT
# ----------------------
class Student(models.Model):

    YEAR_CHOICES = [
        ('1st Year', '1st Year'),
        ('2nd Year', '2nd Year'),
        ('3rd Year', '3rd Year'),
        ('4th Year', '4th Year'),
    ]

    COURSE_CHOICES = [
        ('Information Technology', 'Information Technology'),
        ('Computer Science', 'Computer Science'),
        ('Technology Communication Management', 'Technology Communication Management'),
    ]

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        null=True,
        blank=True
    )

    # BASIC INFO
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)

    parent_name = models.CharField(max_length=255, blank=True)
    contact_number = models.CharField(max_length=20, blank=True)
    home_address = models.TextField(blank=True)
    birthday = models.DateField(null=True, blank=True)

    course = models.CharField(
        max_length=100,
        choices=COURSE_CHOICES,
        blank=True
    )

    year_level = models.CharField(
        max_length=20,
        choices=YEAR_CHOICES,
        blank=True
    )

    # SEMESTER
    semester = models.CharField(
        max_length=20,
        choices=Subject.SEMESTER_CHOICES,
        blank=True,
        null=True
    )

    profile_picture = models.ImageField(
        upload_to='profile_pictures/',
        null=True,
        blank=True
    )

    enrolled_date = models.DateField(auto_now_add=True)

    # UPDATED MAX UNITS
    max_units = models.IntegerField(default=50)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"

    @property
    def calculated_age(self):

        from datetime import date

        if not self.birthday:
            return None

        today = date.today()

        return (
            today.year
            - self.birthday.year
            - (
                (today.month, today.day)
                < (self.birthday.month, self.birthday.day)
            )
        )

    @property
    def total_units(self):

        enrollments = self.enrollments.filter(
            status='ENROLLED'
        )

        return sum(
            e.section.subject.units
            for e in enrollments
            if e.section and e.section.subject
        )


# ----------------------
# SECTION
# ----------------------
class Section(models.Model):

    subject = models.ForeignKey(
        Subject,
        on_delete=models.CASCADE,
        related_name='sections'
    )

    section_name = models.CharField(max_length=50)

    max_capacity = models.IntegerField()
    current_count = models.IntegerField(default=0)

    class Meta:
        unique_together = ('subject', 'section_name')

    def __str__(self):
        return f"{self.subject.subject_code} - {self.section_name}"

    def has_slot(self):
        return self.current_count < self.max_capacity


# ----------------------
# ENROLLMENT
# ----------------------
class Enrollment(models.Model):

    STATUS_CHOICES = [
        ('ENROLLED', 'Enrolled'),
        ('DROPPED', 'Dropped'),
        ('WAITLISTED', 'Waitlisted'),
    ]

    student = models.ForeignKey(
        Student,
        on_delete=models.CASCADE,
        related_name='enrollments'
    )

    subject = models.ForeignKey(
        Subject,
        on_delete=models.CASCADE,
        null=True,
        blank=True
    )

    section = models.ForeignKey(
        Section,
        on_delete=models.CASCADE,
        null=True,
        blank=True
    )

    # NEW SEMESTER FIELD
    semester = models.CharField(
        max_length=20,
        choices=Subject.SEMESTER_CHOICES,
        blank=True,
        null=True
    )

    enrollment_date = models.DateField(auto_now_add=True)

    status = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES,
        default='ENROLLED'
    )

    class Meta:
        unique_together = ('student', 'subject', 'semester')

    def clean(self):

        # AUTO GET SEMESTER FROM SUBJECT
        if self.subject and not self.semester:
            self.semester = self.subject.semester

        existing = Enrollment.objects.filter(
            student=self.student,
            subject=self.subject,
            semester=self.semester
        ).exclude(pk=self.pk)

        if existing.exists() and existing.first().status != "DROPPED":
            raise ValidationError(
                "Student is already enrolled in this subject for this semester."
            )

        # CHECK STUDENT SEMESTER MATCH
        if (
            self.student.semester
            and self.subject
            and self.student.semester != self.subject.semester
        ):
            raise ValidationError(
                "Student semester does not match subject semester."
            )

        # CHECK COURSE MATCH
        if (
            self.student.course
            and self.subject
            and self.subject.course != "GENERAL"
            and self.student.course != self.subject.course
        ):
            raise ValidationError(
                "Student course does not match subject course."
            )

        # CHECK YEAR LEVEL MATCH
        if (
            self.student.year_level
            and self.subject
            and self.student.year_level != self.subject.year_level
        ):
            raise ValidationError(
                "Student year level does not match subject year level."
            )

        # UNIT LIMIT CHECK
        if self.status == 'ENROLLED' and self.subject:

            if (
                self.student.total_units + self.subject.units
                > self.student.max_units
            ):
                raise ValidationError(
                    f"Cannot exceed {self.student.max_units} total units."
                )

    def assign_section(self):

        sections = Section.objects.filter(
            subject=self.subject
        ).order_by('current_count')

        for sec in sections:

            if sec.has_slot():
                return sec

        return None

    def save(self, *args, **kwargs):

        is_new = self.pk is None

        with transaction.atomic():

            # AUTO ASSIGN SEMESTER
            if self.subject and not self.semester:
                self.semester = self.subject.semester

            if (
                is_new
                and self.status == "ENROLLED"
                and self.subject
            ):

                section = self.assign_section()

                if section:

                    section = Section.objects.select_for_update().get(
                        pk=section.pk
                    )

                    if section.has_slot():

                        self.section = section

                        section.current_count += 1
                        section.save()

                    else:

                        self.status = "WAITLISTED"
                        self.section = None

                else:

                    self.status = "WAITLISTED"
                    self.section = None

            self.full_clean()

            super().save(*args, **kwargs)