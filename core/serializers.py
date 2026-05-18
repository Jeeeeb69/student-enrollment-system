from rest_framework import serializers
from .models import Student, Subject, Section, Enrollment


# ------------------------------
# STUDENT
# ------------------------------
class StudentSerializer(serializers.ModelSerializer):

    full_name = serializers.SerializerMethodField()

    total_units = serializers.IntegerField(
        read_only=True
    )

    profile_picture = serializers.ImageField(
        read_only=True
    )

    class Meta:
        model = Student

        fields = '__all__'

    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}"


# ------------------------------
# SUBJECT
# ------------------------------
class SubjectSerializer(serializers.ModelSerializer):

    class Meta:
        model = Subject

        fields = '__all__'


# ------------------------------
# SECTION
# ------------------------------
class SectionSerializer(serializers.ModelSerializer):

    subject_code = serializers.CharField(
        source="subject.subject_code",
        read_only=True
    )

    subject_name = serializers.CharField(
        source="subject.subject_name",
        read_only=True
    )

    class Meta:
        model = Section

        fields = '__all__'

    def validate(self, data):

        subject = data.get('subject')

        section_name = data.get('section_name')

        queryset = Section.objects.filter(
            subject=subject,
            section_name__iexact=section_name
        )

        if self.instance:
            queryset = queryset.exclude(
                pk=self.instance.pk
            )

        if queryset.exists():

            raise serializers.ValidationError({
                "section_name":
                "Section already exists for this subject."
            })

        return data


# ------------------------------
# ENROLLMENT
# ------------------------------
class EnrollmentSerializer(serializers.ModelSerializer):

    # student is READ-ONLY
    student = serializers.PrimaryKeyRelatedField(
        read_only=True
    )

    student_name = serializers.CharField(
        source="student.full_name",
        read_only=True
    )

    total_units = serializers.IntegerField(
        source="student.total_units",
        read_only=True
    )

    max_units = serializers.IntegerField(
        source="student.max_units",
        read_only=True
    )

    subject_name = serializers.CharField(
        source="subject.subject_name",
        read_only=True
    )

    section_name = serializers.CharField(
        source="section.section_name",
        read_only=True
    )

    class Meta:
        model = Enrollment

        fields = '__all__'