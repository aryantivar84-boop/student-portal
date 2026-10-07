from django.urls import path
from . import views

urlpatterns = [
    # Auth
    path('auth/register/', views.register_student, name='register_student'),
    path('auth/login/', views.login_user, name='login_user'),
    path('auth/logout/', views.logout_user, name='logout_user'),

    # Admin Management
    path('admin/students/', views.admin_get_students, name='admin_get_students'),
    path('admin/students/<int:student_id>/verify/', views.admin_verify_student, name='admin_verify_student'),
    path('admin/students/<int:student_id>/documents/', views.admin_toggle_documents, name='admin_toggle_documents'),
    path('admin/students/<int:student_id>/offer-letter/', views.admin_update_offer_letter, name='admin_update_offer_letter'),
    path('admin/students/<int:student_id>/certificate/', views.admin_update_certificate, name='admin_update_certificate'),
    path('admin/attendance/', views.get_admin_attendance_records, name='admin_attendance_records'),
    path('admin/attendance/daily-report/', views.get_attendance_daily_report, name='admin_attendance_daily_report'),
    path('admin/reports/', views.get_daily_reports, name='admin_daily_reports'),

    # Student Profile, Attendance & Timer
    path('student/profile/<int:student_id>/', views.get_student_profile, name='get_student_profile'),
    path('student/profile/<int:student_id>/update/', views.update_student_profile, name='update_student_profile'),
    path('student/attendance/today/', views.get_today_attendance, name='get_today_attendance'),
    path('student/attendance/clock-in/', views.clock_in, name='clock_in'),
    path('student/attendance/pause/', views.pause_work, name='pause_work'),
    path('student/attendance/resume/', views.resume_work, name='resume_work'),
    path('student/attendance/clock-out/', views.clock_out_final, name='clock_out_final'),

    # Daily Report
    path('student/report/submit/', views.submit_daily_report, name='submit_daily_report'),
    path('student/reports/', views.get_daily_reports, name='student_daily_reports'),

    # Subjects & Study Notes
    path('subjects/', views.manage_subjects, name='manage_subjects'),
    path('subjects/allocate/', views.allocate_subject_to_student, name='allocate_subject'),
    path('students/<int:student_id>/subjects/', views.get_student_allocated_subjects, name='get_student_allocated_subjects'),
    path('notes/', views.manage_notes, name='manage_notes'),
    path('notes/<int:note_id>/', views.delete_note, name='delete_note'),

    # MCQ Exam
    path('mcq/categories/', views.manage_mcq_categories, name='manage_mcq_categories'),
    path('mcq/questions/', views.manage_mcq_questions, name='manage_mcq_questions'),
    path('mcq/submit/', views.submit_mcq_exam, name='submit_mcq_exam'),
    path('mcq/results/', views.get_exam_results, name='get_exam_results'),

    # News & Announcements / Notifications
    path('news/', views.manage_news, name='manage_news'),
    path('news/<int:notice_id>/', views.delete_news, name='delete_news'),
    path('news/<int:notice_id>/mark-read/', views.mark_notice_read, name='mark_notice_read'),
    path('news/mark-all-read/', views.mark_all_notices_read, name='mark_all_notices_read'),

    # Holidays & Festivals Calendar Management
    path('holidays/', views.manage_holidays, name='manage_holidays'),
    path('holidays/<int:holiday_id>/', views.delete_holiday, name='delete_holiday'),

    # Word (.docx) & PDF Downloads & Letterhead Assets
    path('documents/assets/<str:asset_name>/', views.serve_offer_asset, name='serve_offer_asset'),
    path('documents/offer-letter/<int:student_id>/', views.download_offer_letter_pdf, name='download_offer_letter'),
    path('documents/offer-letter/<int:student_id>/word/', views.download_offer_letter_docx, name='download_offer_letter_docx'),
    path('documents/offer-letter/<int:student_id>/docx/', views.download_offer_letter_docx, name='download_offer_letter_docx_alias'),
    path('admin/students/<int:student_id>/import-offer-letter-docx/', views.import_offer_letter_docx, name='import_offer_letter_docx'),
    path('documents/certificate/<int:student_id>/', views.download_certificate_pdf, name='download_certificate'),
]
