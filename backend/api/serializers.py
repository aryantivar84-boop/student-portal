import re
from rest_framework import serializers
from django.contrib.auth.models import User
from django.db import transaction
from .models import (
    StudentProfile, Attendance, BreakLog, DailyWorkReport,
    Subject, SubjectAllocation, StudyNote, MCQCategory, MCQQuestion, ExamResult,
    NewsNotice, StudentNoticeRead, Holiday
)


class StudentRegisterSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    password = serializers.CharField(write_only=True, min_length=6)
    full_name = serializers.CharField(max_length=200)
    mobile_number = serializers.CharField(max_length=20)
    email = serializers.EmailField()
    college_name = serializers.CharField(max_length=255)
    university = serializers.CharField(max_length=255)
    technology = serializers.CharField(max_length=100)

    def validate_full_name(self, value):
        val = value.strip()
        if not re.match(r'^[a-zA-Z\s.\'-]+$', val):
            raise serializers.ValidationError("Full Name must contain letters only (no numbers allowed).")
        if len(val) < 2:
            raise serializers.ValidationError("Full Name must be at least 2 characters.")
        return val

    def validate_mobile_number(self, value):
        val = value.strip()
        if not re.match(r'^\d{10}$', val):
            raise serializers.ValidationError("Mobile Number must be exactly 10 digits (numbers only, no letters).")
        return val

    def validate_college_name(self, value):
        val = value.strip()
        if re.search(r'\d', val):
            raise serializers.ValidationError("College Name must contain letters only (no numbers allowed).")
        if not re.search(r'[a-zA-Z]', val):
            raise serializers.ValidationError("College Name must contain letters.")
        return val

    def validate_university(self, value):
        val = value.strip()
        if re.search(r'\d', val):
            raise serializers.ValidationError("University must contain letters only (no numbers allowed).")
        if not re.search(r'[a-zA-Z]', val):
            raise serializers.ValidationError("University must contain letters.")
        return val

    def validate_technology(self, value):
        val = value.strip()
        if re.search(r'^\d+$', val):
            raise serializers.ValidationError("Technology / Domain must contain letters (no pure numbers allowed, e.g. AI/ML, Python).")
        if not re.search(r'[a-zA-Z]', val):
            raise serializers.ValidationError("Technology / Domain must contain letters.")
        return val

    def validate_username(self, value):
        orphaned = User.objects.filter(username=value, is_staff=False, student_profile__isnull=True)
        if orphaned.exists():
            orphaned.delete()
        elif User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already exists.")
        return value

    def validate_email(self, value):
        orphaned = User.objects.filter(email=value, is_staff=False, student_profile__isnull=True)
        if orphaned.exists():
            orphaned.delete()
        elif User.objects.filter(email=value).exists() or StudentProfile.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already registered.")
        return value

    @transaction.atomic
    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data['full_name']
        )
        profile = StudentProfile.objects.create(
            user=user,
            full_name=validated_data['full_name'],
            mobile_number=validated_data['mobile_number'],
            email=validated_data['email'],
            college_name=validated_data['college_name'],
            university=validated_data['university'],
            technology=validated_data['technology'],
            is_approved=False # Requires Admin verification
        )
        return profile


class StudentProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    offer_letter_header_image_url = serializers.SerializerMethodField()
    offer_letter_footer_image_url = serializers.SerializerMethodField()
    offer_letter_bg_image_url = serializers.SerializerMethodField()
    offer_letter_stamp_image_url = serializers.SerializerMethodField()

    def get_offer_letter_header_image_url(self, obj):
        return obj.offer_letter_header_image.url if obj.offer_letter_header_image else None

    def get_offer_letter_footer_image_url(self, obj):
        return obj.offer_letter_footer_image.url if obj.offer_letter_footer_image else None

    def get_offer_letter_bg_image_url(self, obj):
        return obj.offer_letter_bg_image.url if obj.offer_letter_bg_image else None

    def get_offer_letter_stamp_image_url(self, obj):
        return obj.offer_letter_stamp_image.url if obj.offer_letter_stamp_image else None

    class Meta:
        model = StudentProfile
        fields = [
            'id', 'username', 'full_name', 'mobile_number', 'email',
            'college_name', 'university', 'technology', 'is_approved',
            'approved_at', 'offer_letter_approved', 'certificate_approved',
            'offer_letter_issue_date', 'offer_letter_start_date', 'offer_letter_end_date',
            'offer_letter_role', 'offer_letter_custom_text', 'offer_letter_full_body',
            'offer_letter_signatory_name', 'offer_letter_signatory_role', 'offer_letter_stamp_alignment', 'offer_letter_stamp_spacing',
            'offer_letter_ref_no', 'offer_letter_title', 'offer_letter_salutation',
            'offer_letter_pronoun', 'offer_letter_company_name', 'offer_letter_location',
            'offer_letter_work_mode', 'offer_letter_working_hours', 'offer_letter_stipend',
            'offer_letter_p1', 'offer_letter_p2', 'offer_letter_p3', 'offer_letter_p4',
            'offer_letter_signoff', 'offer_letter_show_stamp',
            'offer_letter_show_header', 'offer_letter_header_image', 'offer_letter_header_image_url',
            'offer_letter_show_footer', 'offer_letter_footer_image', 'offer_letter_footer_image_url', 'offer_letter_footer_text',
            'offer_letter_show_watermark', 'offer_letter_bg_image', 'offer_letter_bg_image_url',
            'offer_letter_stamp_image', 'offer_letter_stamp_image_url',
            'certificate_issue_date', 'certificate_start_date', 'certificate_end_date',
            'certificate_program_title', 'certificate_custom_text',
            'certificate_signatory_name', 'certificate_signatory_role',
            'certificate_signatory_two_name', 'certificate_signatory_two_role',
            'internship_start_date', 'internship_duration_months', 'created_at'
        ]


class BreakLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = BreakLog
        fields = '__all__'


class AttendanceSerializer(serializers.ModelSerializer):
    breaks = BreakLogSerializer(many=True, read_only=True)
    student_name = serializers.CharField(source='student.full_name', read_only=True)

    class Meta:
        model = Attendance
        fields = '__all__'


class DailyWorkReportSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.full_name', read_only=True)
    technology = serializers.CharField(source='student.technology', read_only=True)

    class Meta:
        model = DailyWorkReport
        fields = '__all__'


class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = '__all__'


class StudyNoteSerializer(serializers.ModelSerializer):
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    subject_category = serializers.CharField(source='subject.category', read_only=True)
    document_url = serializers.SerializerMethodField()
    file_name = serializers.SerializerMethodField()

    class Meta:
        model = StudyNote
        fields = '__all__'

    def get_document_url(self, obj):
        if obj.document:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.document.url)
            return obj.document.url
        return None

    def get_file_name(self, obj):
        if obj.document:
            import os
            return os.path.basename(obj.document.name)
        return None


class MCQQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = MCQQuestion
        fields = '__all__'


class MCQCategorySerializer(serializers.ModelSerializer):
    questions_count = serializers.IntegerField(source='questions.count', read_only=True)

    class Meta:
        model = MCQCategory
        fields = ['id', 'name', 'description', 'questions_count']


class ExamResultSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.full_name', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = ExamResult
        fields = '__all__'


class NewsNoticeSerializer(serializers.ModelSerializer):
    read_count = serializers.SerializerMethodField()
    is_read = serializers.SerializerMethodField()

    class Meta:
        model = NewsNotice
        fields = [
            'id', 'title', 'content', 'category', 'priority',
            'target_technology', 'posted_by', 'created_at', 'is_active',
            'read_count', 'is_read'
        ]

    def get_read_count(self, obj):
        return obj.reads.count()

    def get_is_read(self, obj):
        student_id = self.context.get('student_id')
        if student_id:
            return obj.reads.filter(student_id=student_id).exists()
        return False


class HolidaySerializer(serializers.ModelSerializer):
    holiday_type_display = serializers.CharField(source='get_holiday_type_display', read_only=True)

    class Meta:
        model = Holiday
        fields = ['id', 'date', 'name', 'holiday_type', 'holiday_type_display', 'is_day_off', 'description', 'created_at']

