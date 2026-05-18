from django.contrib import admin
from django.urls import path, include
from rest_framework import routers
from django.http import JsonResponse

from django.conf import settings
from django.conf.urls.static import static

from core.views import (
    StudentViewSet,
    SubjectViewSet,
    SectionViewSet,
    EnrollmentViewSet,
    profile,
    upload_profile_picture,
    update_student_profile,
)

# ----------------------
# ROUTER
# ----------------------
router = routers.DefaultRouter()

router.register(r'students', StudentViewSet)
router.register(r'subjects', SubjectViewSet)
router.register(r'sections', SectionViewSet)
router.register(r'enrollments', EnrollmentViewSet, basename='enrollment')


# ----------------------
# HEALTH CHECK (FIX FOR 403 ROOT)
# ----------------------
def home(request):
    return JsonResponse({
        "status": "running",
        "message": "Enrollment System API is live"
    })


# ----------------------
# URLS
# ----------------------
urlpatterns = [
    path('', home),

    path('admin/', admin.site.urls),

    # AUTH
    path('api/auth/', include('djoser.urls')),
    path('api/auth/', include('djoser.urls.jwt')),

    # PROFILE
    path('api/profile/', profile),
    path('api/profile/update/', update_student_profile),
    path('api/profile/upload-picture/', upload_profile_picture),

    # API ROUTER
    path('api/', include(router.urls)),
]

# MEDIA (DEV ONLY)
urlpatterns += static(
    settings.MEDIA_URL,
    document_root=settings.MEDIA_ROOT
)