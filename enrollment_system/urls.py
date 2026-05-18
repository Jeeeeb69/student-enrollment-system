"""
URL configuration for enrollment_system project.
"""

from django.contrib import admin
from django.urls import path, include
from rest_framework import routers

from django.conf import settings
from django.conf.urls.static import static

from core.views import (
    StudentViewSet,
    SubjectViewSet,
    SectionViewSet,
    EnrollmentViewSet,
    profile,
    upload_profile_picture,
    update_student_profile,   # NEW IMPORT
)

# ----------------------
# DRF ROUTER
# ----------------------
router = routers.DefaultRouter()

router.register(r'students', StudentViewSet)

router.register(r'subjects', SubjectViewSet)

router.register(r'sections', SectionViewSet)

# FIXED:
# Added basename because EnrollmentViewSet
# has no queryset
router.register(
    r'enrollments',
    EnrollmentViewSet,
    basename='enrollment'
)

# ----------------------
# URLPATTERNS
# ----------------------
urlpatterns = [

    # ----------------------
    # ADMIN PANEL
    # ----------------------
    path(
        'admin/',
        admin.site.urls
    ),

    # ======================================
    # AUTH (DJOSER)
    # ======================================
    path(
        'api/auth/',
        include('djoser.urls')
    ),

    path(
        'api/auth/',
        include('djoser.urls.jwt')
    ),

    # ======================================
    # PROFILE
    # ======================================
    path(
        'api/profile/',
        profile
    ),

    # NEW:
    # UPDATE STUDENT PROFILE
    path(
        'api/profile/update/',
        update_student_profile
    ),

    # PROFILE PICTURE UPLOAD
    path(
        'api/profile/upload-picture/',
        upload_profile_picture
    ),

    # ======================================
    # MAIN API (VIEWSETS)
    # ======================================
    path(
        'api/',
        include(router.urls)
    ),
]

# ======================================
# MEDIA FILES (DEV ONLY)
# ======================================
urlpatterns += static(
    settings.MEDIA_URL,
    document_root=settings.MEDIA_ROOT
)