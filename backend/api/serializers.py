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
    username = serializers.CharField(max_length=150, required=False, allow_blank=True, default='')
    password = serializers.CharField(write_only=True, required=False, allow_blank=True, default='')
    first_name = serializers.CharField(max_length=100, required=False, allow_blank=True)
    surname = serializers.CharField(max_length=100, required=False, allow_blank=True)
    full_name = serializers.CharField(max_length=200, required=False, allow_blank=True)
    gender = serializers.CharField(max_length=20, required=False, allow_blank=True)
    address = serializers.CharField(required=False, allow_blank=True)
    semester = serializers.CharField(max_length=20, required=False, allow_blank=True)
    degree = serializers.CharField(max_length=100, required=False, allow_blank=True)
    mobile_number = serializers.CharField(max_length=20)
    email = serializers.EmailField()
    college_name = serializers.CharField(max_length=255)
    university = serializers.CharField(max_length=255)
    technology = serializers.CharField(max_length=100)
    profile_photo = serializers.ImageField(required=False, allow_null=True)

    def validate_first_name(self, value):
        val = value.strip()
        if val and not re.match(r'^[a-zA-Z\s.\'-]+$', val):
            raise serializers.ValidationError("First Name must contain letters only (no numbers allowed).")
        return val

    def validate_surname(self, value):
        val = value.strip()
        if val and not re.match(r'^[a-zA-Z\s.\'-]+$', val):
            raise serializers.ValidationError("Surname must contain letters only (no numbers allowed).")
        return val

    def validate_full_name(self, value):
        val = value.strip()
        if val and not re.match(r'^[a-zA-Z\s.\'-]+$', val):
            raise serializers.ValidationError("Full Name must contain letters only (no numbers allowed).")
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
        val = (value or '').strip()
        if not val:
            return ''
        orphaned = User.objects.filter(username=val, is_staff=False, student_profile__isnull=True)
        if orphaned.exists():
            orphaned.delete()
        elif User.objects.filter(username=val).exists():
            raise serializers.ValidationError("Username already exists.")
        return val

    def validate_email(self, value):
        orphaned = User.objects.filter(email=value, is_staff=False, student_profile__isnull=True)
        if orphaned.exists():
            orphaned.delete()
        elif User.objects.filter(email=value).exists() or StudentProfile.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already registered.")
        return value

    def validate(self, attrs):
        first = attrs.get('first_name', '').strip()
        sur = attrs.get('surname', '').strip()
        full = attrs.get('full_name', '').strip()

        if first or sur:
            attrs['full_name'] = f"{first} {sur}".strip()
        elif full:
            attrs['full_name'] = full
            parts = full.split(' ', 1)
            attrs['first_name'] = parts[0]
            attrs['surname'] = parts[1] if len(parts) > 1 else ''
        else:
            raise serializers.ValidationError({"first_name": "First Name is required."})

        # Auto-generate username if not provided
        uname = (attrs.get('username') or '').strip()
        if not uname:
            email = attrs.get('email', '').strip().lower()
            base_user = email.split('@')[0] if email else f"{first.lower()}{sur.lower()}"
            base_user = re.sub(r'[^a-zA-Z0-9_]', '', base_user) or 'student'
            candidate_username = base_user
            counter = 1
            while User.objects.filter(username=candidate_username).exists():
                candidate_username = f"{base_user}{counter}"
                counter += 1
            attrs['username'] = candidate_username

        # Auto-generate password if not provided (default to student's 10-digit mobile number)
        pwd = (attrs.get('password') or '').strip()
        if not pwd:
            mobile = attrs.get('mobile_number', '').strip()
            attrs['password'] = mobile if len(mobile) >= 6 else 'Student@123'

        return attrs

    @transaction.atomic
    def create(self, validated_data):
        first_name = validated_data.get('first_name', '').strip()
        surname = validated_data.get('surname', '').strip()
        full_name = validated_data.get('full_name', '').strip() or f"{first_name} {surname}".strip()

        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=first_name or full_name,
            last_name=surname
        )
        profile = StudentProfile.objects.create(
            user=user,
            first_name=first_name,
            surname=surname,
            full_name=full_name,
            gender=validated_data.get('gender', '').strip(),
            address=validated_data.get('address', '').strip(),
            semester=validated_data.get('semester', '').strip(),
            degree=validated_data.get('degree', '').strip(),
            mobile_number=validated_data['mobile_number'],
            email=validated_data['email'],
            college_name=validated_data['college_name'],
            university=validated_data['university'],
            technology=validated_data['technology'],
            profile_photo=validated_data.get('profile_photo'),
            is_approved=False # Requires Admin verification
        )
        return profile


class StudentProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    profile_photo_url = serializers.SerializerMethodField()
    offer_letter_header_image_url = serializers.SerializerMethodField()
    offer_letter_footer_image_url = serializers.SerializerMethodField()
    offer_letter_bg_image_url = serializers.SerializerMethodField()
    offer_letter_stamp_image_url = serializers.SerializerMethodField()

    def get_profile_photo_url(self, obj):
        if not obj.profile_photo:
            return None
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(obj.profile_photo.url)
        return f"http://localhost:8000{obj.profile_photo.url}"

    def get_offer_letter_header_image_url(self, obj):
        if not obj.offer_letter_header_image:
            return None
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(obj.offer_letter_header_image.url)
        return f"http://localhost:8000{obj.offer_letter_header_image.url}"

    def get_offer_letter_footer_image_url(self, obj):
        if not obj.offer_letter_footer_image:
            return None
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(obj.offer_letter_footer_image.url)
        return f"http://localhost:8000{obj.offer_letter_footer_image.url}"

    def get_offer_letter_bg_image_url(self, obj):
        if not obj.offer_letter_bg_image:
            return None
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(obj.offer_letter_bg_image.url)
        return f"http://localhost:8000{obj.offer_letter_bg_image.url}"

    def get_offer_letter_stamp_image_url(self, obj):
        if not obj.offer_letter_stamp_image:
            return None
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(obj.offer_letter_stamp_image.url)
        return f"http://localhost:8000{obj.offer_letter_stamp_image.url}"

    class Meta:
        model = StudentProfile
        fields = [
            'id', 'username', 'first_name', 'surname', 'full_name', 'gender', 'address', 'semester', 'degree',
            'mobile_number', 'email', 'college_name', 'university', 'technology', 'profile_photo', 'profile_photo_url', 'is_approved',
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
    technology = serializers.CharField(source='student.technology', read_only=True)

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
    student_name = serializers.SerializerMethodField()
    subject_category = serializers.CharField(source='subject.category', read_only=True)
    document_url = serializers.SerializerMethodField()
    file_name = serializers.SerializerMethodField()

    class Meta:
        model = StudyNote
        fields = '__all__'

    def get_student_name(self, obj):
        if obj.subject and 'General' not in obj.subject.name:
            return obj.subject.name
        return 'All Users / Students'

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

