from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes

from django.db import transaction
from django.core.exceptions import ValidationError

from .models import Student, Subject, Section, Enrollment

from .serializers import (
    StudentSerializer,
    SubjectSerializer,
    SectionSerializer,
    EnrollmentSerializer
)

from .permissions import IsAdminOrReadOnly


# ======================================
# STUDENTS
# ======================================
class StudentViewSet(viewsets.ModelViewSet):

    queryset = Student.objects.all()
    serializer_class = StudentSerializer

    permission_classes = [
        IsAuthenticated,
        IsAdminOrReadOnly
    ]


# ======================================
# SUBJECTS
# ======================================
class SubjectViewSet(viewsets.ModelViewSet):

    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer

    permission_classes = [
        IsAuthenticated,
        IsAdminOrReadOnly
    ]


# ======================================
# SECTIONS
# ======================================
class SectionViewSet(viewsets.ModelViewSet):

    queryset = Section.objects.all()
    serializer_class = SectionSerializer

    permission_classes = [
        IsAuthenticated,
        IsAdminOrReadOnly
    ]


# ======================================
# ENROLLMENTS
# ======================================
class EnrollmentViewSet(viewsets.ModelViewSet):

    serializer_class = EnrollmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):

        user = self.request.user

        if user.is_staff:
            return Enrollment.objects.all()

        return Enrollment.objects.filter(student__user=user)

    def create(self, request, *args, **kwargs):

        subject_id = request.data.get("subject")

        if not subject_id:
            return Response(
                {"error": "Subject is required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            student = Student.objects.get(user=request.user)

        except Student.DoesNotExist:
            return Response(
                {"error": "Student profile not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        # GET SUBJECT
        try:
            subject = Subject.objects.get(id=subject_id)

        except Subject.DoesNotExist:
            return Response(
                {"error": "Subject not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        # CHECK EXISTING ENROLLMENT
        existing = Enrollment.objects.filter(
            student=student,
            subject=subject,
            semester=subject.semester
        ).first()

        if existing:

            if existing.status == "DROPPED":

                try:
                    with transaction.atomic():

                        assigned_section = existing.assign_section()

                        if assigned_section:

                            assigned_section = Section.objects.select_for_update().get(
                                pk=assigned_section.pk
                            )

                            if assigned_section.current_count < assigned_section.max_capacity:

                                existing.section = assigned_section
                                existing.status = "ENROLLED"
                                existing.semester = subject.semester

                                assigned_section.current_count += 1
                                assigned_section.save()

                            else:
                                existing.section = None
                                existing.status = "WAITLISTED"

                        else:
                            existing.section = None
                            existing.status = "WAITLISTED"

                        try:
                            existing.full_clean()

                        except ValidationError as e:
                            return Response(
                                {
                                    "error": e.messages[0],
                                    "total_units": existing.student.total_units,
                                    "max_units": existing.student.max_units
                                },
                                status=status.HTTP_400_BAD_REQUEST
                            )

                        existing.save()

                    return Response(
                        self.get_serializer(existing).data,
                        status=status.HTTP_200_OK
                    )

                except Exception as e:
                    return Response(
                        {"error": str(e)},
                        status=status.HTTP_400_BAD_REQUEST
                    )

            else:
                return Response(
                    {
                        "error": "Student is already enrolled in this subject for this semester.",
                        "total_units": existing.student.total_units,
                        "max_units": existing.student.max_units
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            enrollment = serializer.save(
                student=student,
                semester=subject.semester
            )

        except ValidationError as e:
            return Response(
                {
                    "error": e.messages[0],
                    "total_units": student.total_units,
                    "max_units": student.max_units
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        return Response(
            self.get_serializer(enrollment).data,
            status=status.HTTP_201_CREATED
        )


# ======================================
# USER PROFILE
# ======================================
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def profile(request):

    try:
        student = Student.objects.get(user=request.user)

        return Response({

            "first_name": student.first_name,
            "last_name": student.last_name,
            "email": student.email,
            "parent_name": student.parent_name,
            "contact_number": student.contact_number,
            "home_address": student.home_address,
            "birthday": student.birthday,

            # UPDATED LINE
            "age": student.calculated_age,

            "course": student.course,
            "year_level": student.year_level,
            "semester": student.semester,

            # ADDED LINE
            "semester": student.semester,

            "max_units": student.max_units,
            "total_units": student.total_units,

            "is_staff": request.user.is_staff,

            "profile_picture": (
                request.build_absolute_uri(student.profile_picture.url)
                if student.profile_picture
                else None
            ),
        })

    except Student.DoesNotExist:

        return Response(
            {"error": "Student not found"},
            status=status.HTTP_404_NOT_FOUND
        )


# ======================================
# UPDATE STUDENT PROFILE
# ======================================
@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def update_student_profile(request):

    try:
        student = Student.objects.get(user=request.user)

        serializer = StudentSerializer(
            student,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():

            serializer.save()

            # ======================================
            # AUTO ENROLL SUBJECTS
            # ======================================

            if (
                student.course
                and student.year_level
                and student.semester
            ):

                # UPDATED FILTER WITH SEMESTER
                subjects = Subject.objects.filter(
                    course=student.course,
                    year_level=student.year_level,
                    semester=student.semester
                )

                for subject in subjects:

                    already_exists = Enrollment.objects.filter(
                        student=student,
                        subject=subject,
                        semester=student.semester
                    ).exists()

                    if not already_exists:

                        try:
                            Enrollment.objects.create(
                                student=student,
                                subject=subject,
                                semester=student.semester,
                                status="ENROLLED"
                            )

                        except ValidationError:
                            pass

            return Response(serializer.data)

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

    except Student.DoesNotExist:

        return Response(
            {"error": "Student not found"},
            status=status.HTTP_404_NOT_FOUND
        )


# ======================================
# UPLOAD PROFILE PICTURE
# ======================================
@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def upload_profile_picture(request):

    try:
        student = Student.objects.get(user=request.user)

        image = request.FILES.get("profile_picture")

        if not image:
            return Response(
                {"error": "No image uploaded"},
                status=status.HTTP_400_BAD_REQUEST
            )

        student.profile_picture = image
        student.save()

        return Response({
            "message": "Profile picture updated successfully",
            "profile_picture": request.build_absolute_uri(
                student.profile_picture.url
            )
        })

    except Student.DoesNotExist:

        return Response(
            {"error": "Student not found"},
            status=status.HTTP_404_NOT_FOUND
        )