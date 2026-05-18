"""
URL configuration for enrollment_system project.
"""

from django.contrib import admin
from django.urls import path, include
from rest_framework import routers
from django.shortcuts import redirect   # ✅ ADDED

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

router.register(
    r'enrollments',
    EnrollmentViewSet,
    basename='enrollment'
)

# ----------------------
# ADDED: HOME REDIRECT
# ----------------------
def home_redirect(request):
    return redirect('/admin/')

# ----------------------
# URLPATTERNS
# ----------------------
urlpatterns = [

    # ✅ ADDED ROOT REDIRECT
    path(
        '',
        home_redirect
    ),

    # ADMIN PANEL
    path(
        'admin/',
        admin.site.urls
    ),

    # AUTH (DJOSER)
    path(
        'api/auth/',
        include('djoser.urls')
    ),

    path(
        'api/auth/',
        include('djoser.urls.jwt')
    ),

    # PROFILE
    path(
        'api/profile/',
        profile
    ),

    path(
        'api/profile/update/',
        update_student_profile
    ),

    path(
        'api/profile/upload-picture/',
        upload_profile_picture
    ),

    # MAIN API (VIEWSETS)
    path(
        'api/',
        include(router.urls)
    ),
]

# MEDIA FILES (DEV ONLY)
urlpatterns += static(
    settings.MEDIA_URL,
    document_root=settings.MEDIA_ROOT
)