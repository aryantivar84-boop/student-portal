from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone


class StudentProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='student_profile')
    full_name = models.CharField(max_length=200)
    mobile_number = models.CharField(max_length=20)
    email = models.EmailField(unique=True)
    college_name = models.CharField(max_length=255)
    university = models.CharField(max_length=255)
    technology = models.CharField(max_length=100) # e.g. Python, React, Full Stack, Flutter
    
    # Verification & Approval Status
    is_approved = models.BooleanField(default=False)
    approved_at = models.DateTimeField(null=True, blank=True)
    
    # Document approval flags
    offer_letter_approved = models.BooleanField(default=False)
    certificate_approved = models.BooleanField(default=False)
    
    # Offer Letter customizable fields (Full edit options for Admin)
    offer_letter_ref_no = models.CharField(max_length=100, blank=True, default='')
    offer_letter_title = models.CharField(max_length=200, blank=True, default='INTERNSHIP OFFER LETTER')
    offer_letter_salutation = models.CharField(max_length=20, blank=True, default='Mr.')
    offer_letter_pronoun = models.CharField(max_length=20, blank=True, default='he') # 'he', 'she', 'they'
    offer_letter_company_name = models.CharField(max_length=150, blank=True, default='Akash Technolabs')
    offer_letter_location = models.CharField(max_length=150, blank=True, default='Ahmedabad, Gujarat')
    offer_letter_work_mode = models.CharField(max_length=50, blank=True, default='On-Site')
    offer_letter_working_hours = models.CharField(max_length=100, blank=True, default='10:00 AM - 06:00 PM')
    offer_letter_stipend = models.CharField(max_length=100, blank=True, default='Unpaid Internship (Academic Project)')
    offer_letter_p1 = models.TextField(blank=True, default='')
    offer_letter_p2 = models.TextField(blank=True, default='')
    offer_letter_p3 = models.TextField(blank=True, default='')
    offer_letter_p4 = models.TextField(blank=True, default='')
    offer_letter_signoff = models.CharField(max_length=50, blank=True, default='Sincerely')
    offer_letter_show_stamp = models.BooleanField(default=True)
    offer_letter_issue_date = models.DateField(null=True, blank=True)
    offer_letter_start_date = models.DateField(null=True, blank=True)
    offer_letter_end_date = models.DateField(null=True, blank=True)
    offer_letter_role = models.CharField(max_length=150, blank=True, default='')
    offer_letter_custom_text = models.TextField(blank=True, default='')
    offer_letter_full_body = models.TextField(blank=True, default='')
    offer_letter_signatory_name = models.CharField(max_length=100, default='Akash Padhiyar')
    offer_letter_signatory_role = models.CharField(max_length=100, default='CEO')
    offer_letter_stamp_alignment = models.CharField(max_length=20, default='right', blank=True)
    offer_letter_stamp_spacing = models.CharField(max_length=20, default='standard', blank=True)
    
    # Offer Letter Graphic Assets & Letterhead Controls (Header, Footer, Background Watermark, Stamp/Signature)
    offer_letter_show_header = models.BooleanField(default=True)
    offer_letter_header_image = models.ImageField(upload_to='offer_letters/headers/', null=True, blank=True)
    offer_letter_show_footer = models.BooleanField(default=True)
    offer_letter_footer_image = models.ImageField(upload_to='offer_letters/footers/', null=True, blank=True)
    offer_letter_footer_text = models.CharField(max_length=255, blank=True, default='')
    offer_letter_show_watermark = models.BooleanField(default=True)
    offer_letter_bg_image = models.ImageField(upload_to='offer_letters/backgrounds/', null=True, blank=True)
    offer_letter_stamp_image = models.ImageField(upload_to='offer_letters/stamps/', null=True, blank=True)

    # Completion Certificate customizable fields (Editable by Admin)
    certificate_issue_date = models.DateField(null=True, blank=True)
    certificate_start_date = models.DateField(null=True, blank=True)
    certificate_end_date = models.DateField(null=True, blank=True)
    certificate_program_title = models.CharField(max_length=255, blank=True, default='')
    certificate_custom_text = models.TextField(blank=True, default='')
    certificate_signatory_name = models.CharField(max_length=100, default='Akash Padhiyar')
    certificate_signatory_role = models.CharField(max_length=100, default='CEO, Akash Technolabs')
    certificate_signatory_two_name = models.CharField(max_length=100, default='Director of Technical Training')
    certificate_signatory_two_role = models.CharField(max_length=100, default='Akash Technolabs')
    
    internship_start_date = models.DateField(default=timezone.now)
    internship_duration_months = models.IntegerField(default=6)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.full_name} ({self.technology}) - {'Approved' if self.is_approved else 'Pending'}"


class Attendance(models.Model):
    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name='attendances')
    date = models.DateField(default=timezone.now)
    clock_in = models.DateTimeField(null=True, blank=True)
    clock_out = models.DateTimeField(null=True, blank=True)
    is_clocked_in = models.BooleanField(default=False)
    is_paused = models.BooleanField(default=False)
    last_pause_time = models.DateTimeField(null=True, blank=True)
    total_seconds_worked = models.IntegerField(default=0)

    class Meta:
        ordering = ['-date', '-id']

    def __str__(self):
        return f"{self.student.full_name} - {self.date} ({'Working' if self.is_clocked_in else 'Ended'})"


class BreakLog(models.Model):
    attendance = models.ForeignKey(Attendance, on_delete=models.CASCADE, related_name='breaks')
    pause_time = models.DateTimeField(default=timezone.now)
    resume_time = models.DateTimeField(null=True, blank=True)
    reason = models.CharField(max_length=100, default="Break/Lunch")

    def __str__(self):
        return f"Break for {self.attendance.student.full_name} at {self.pause_time}"


class DailyWorkReport(models.Model):
    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name='reports')
    date = models.DateField(default=timezone.now)
    tasks = models.JSONField(default=list)  # List of items: [{'time_slot': '02:00 PM - 03:00 PM', 'task': '...'}]
    summary = models.TextField(blank=True, default="")
    submitted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date', '-submitted_at']

    def __str__(self):
        return f"Report: {self.student.full_name} on {self.date}"


class Subject(models.Model):
    name = models.CharField(max_length=150)
    category = models.CharField(max_length=100) # e.g. Frontend, Backend, Database
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.category})"


class SubjectAllocation(models.Model):
    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name='allocated_subjects')
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='allocations')
    allocated_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('student', 'subject')

    def __str__(self):
        return f"{self.student.full_name} -> {self.subject.name}"


class StudyNote(models.Model):
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='notes')
    title = models.CharField(max_length=200)
    content = models.TextField()
    document = models.FileField(upload_to='study_notes/', null=True, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-uploaded_at']

    def __str__(self):
        return f"{self.title} - {self.subject.name}"


class MCQCategory(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name


class MCQQuestion(models.Model):
    category = models.ForeignKey(MCQCategory, on_delete=models.CASCADE, related_name='questions')
    question_text = models.TextField()
    option_a = models.CharField(max_length=255)
    option_b = models.CharField(max_length=255)
    option_c = models.CharField(max_length=255)
    option_d = models.CharField(max_length=255)
    correct_option = models.CharField(max_length=1, choices=[('A', 'A'), ('B', 'B'), ('C', 'C'), ('D', 'D')])

    def __str__(self):
        return f"{self.category.name}: {self.question_text[:50]}"


class ExamResult(models.Model):
    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name='exam_results')
    category = models.ForeignKey(MCQCategory, on_delete=models.CASCADE)
    total_questions = models.IntegerField()
    score = models.IntegerField()
    percentage = models.FloatField()
    answers_data = models.JSONField(default=list)
    submitted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-submitted_at']

    def __str__(self):
        return f"{self.student.full_name} - {self.category.name}: {self.score}/{self.total_questions} ({self.percentage}%)"


class NewsNotice(models.Model):
    PRIORITY_CHOICES = [
        ('normal', 'Normal'),
        ('important', 'Important'),
        ('urgent', 'Urgent / Alert'),
    ]
    CATEGORY_CHOICES = [
        ('general', 'General Announcement'),
        ('internship', 'Internship Update'),
        ('exam', 'Exam / Evaluation'),
        ('event', 'Holiday / Event'),
        ('training', 'Training / Task Notice'),
    ]

    title = models.CharField(max_length=255)
    content = models.TextField()
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='general')
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='normal')
    target_technology = models.CharField(max_length=100, default='ALL', help_text="Target specific domain or 'ALL'")
    posted_by = models.CharField(max_length=100, default='Admin')
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"[{self.priority.upper()}] {self.title} ({self.created_at.strftime('%Y-%m-%d')})"


class StudentNoticeRead(models.Model):
    notice = models.ForeignKey(NewsNotice, on_delete=models.CASCADE, related_name='reads')
    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name='read_notices')
    read_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('notice', 'student')

    def __str__(self):
        return f"{self.student.full_name} read notice {self.notice.id}"


class Holiday(models.Model):
    HOLIDAY_TYPE_CHOICES = [
        ('FESTIVAL', 'Festival'),
        ('NATIONAL', 'National Holiday'),
        ('OFFICE_OFF', 'Office Day Off'),
    ]

    date = models.DateField(unique=True)
    name = models.CharField(max_length=200)
    holiday_type = models.CharField(max_length=30, choices=HOLIDAY_TYPE_CHOICES, default='FESTIVAL')
    is_day_off = models.BooleanField(default=True, help_text="Office is closed / Day off")
    description = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['date']

    def __str__(self):
        return f"{self.date} - {self.name} ({self.get_holiday_type_display()})"

