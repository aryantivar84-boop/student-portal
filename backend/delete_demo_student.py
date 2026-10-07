import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth.models import User
from api.models import (
    StudentProfile, SubjectAllocation, Attendance, BreakLog,
    DailyWorkReport, ExamResult
)

# Find and delete student_demo or any student profile
students = StudentProfile.objects.all()
for s in students:
    user = s.user
    full_name = s.full_name
    # Delete related records
    SubjectAllocation.objects.filter(student=s).delete()
    DailyWorkReport.objects.filter(student=s).delete()
    ExamResult.objects.filter(student=s).delete()
    for att in Attendance.objects.filter(student=s):
        BreakLog.objects.filter(attendance=att).delete()
        att.delete()
    s.delete()
    if user:
        user.delete()
    print(f"Deleted student: {full_name}")

# Also delete student_demo user if exists
User.objects.filter(username='student_demo').delete()
print("All demo student accounts completely deleted from MySQL.")
