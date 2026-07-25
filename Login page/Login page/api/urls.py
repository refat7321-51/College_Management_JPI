from django.urls import path
from . import views

urlpatterns = [
    # Auth
    path('register/', views.register, name='register'),
    path('register-student-by-teacher/', views.register_student_by_teacher, name='register_student_by_teacher'),
    path('send-registration-otp/', views.send_registration_otp, name='send_registration_otp'),
    path('login/', views.login, name='login'),
    path('verify-login-otp/', views.verify_login_otp, name='verify_login_otp'),
    path('send-otp/', views.send_otp, name='send_otp'),
    path('verify-otp/', views.verify_otp, name='verify_otp'),
    path('reset-password/', views.reset_password, name='reset_password'),

    # Attendance
    path('get-students-for-attendance/', views.get_students_for_attendance, name='get_students_for_attendance'),
    path('save-attendance/', views.save_attendance, name='save_attendance'),

    # Dashboard & Profile
    path('teacher-dashboard-data/', views.get_teacher_dashboard_data, name='get_teacher_dashboard_data'),
    path('get-profile/', views.get_profile, name='get_profile'),
    path('update-profile/', views.update_profile, name='update_profile'),
    path('change-password/', views.change_password, name='change_password'),

    # Users
    path('get-teachers/', views.get_teachers, name='get_teachers'),
    path('get-students/', views.get_students, name='get_students'),
    path('search-users/', views.search_users, name='search_users'),
    path('get-student-stats/', views.get_student_stats, name='get_student_stats'),
    path('delete-student/<int:student_id>/', views.delete_student, name='delete_student'),
    path('get-monthly-report/', views.get_monthly_report, name='get_monthly_report'),

    # Notices
    path('get-notices/', views.get_all_notices, name='get_notices'),
    path('create-notice/', views.create_notice, name='create_notice'),
    path('delete-notice/<int:notice_id>/', views.delete_notice, name='delete_notice'),
    path('edit-notice/<int:notice_id>/', views.edit_notice, name='edit_notice'),

    # Routine
    path('get-routine/', views.get_routine, name='get_routine'),
    path('save-routine-slot/', views.save_routine_slot, name='save_routine_slot'),
    path('delete-routine-slot/<int:slot_id>/', views.delete_routine_slot, name='delete_routine_slot'),
    path('upload-routine-file/', views.upload_routine_file, name='upload_routine_file'),
    path('get-routine-files/', views.get_routine_files, name='get_routine_files'),
    path('seed-demo-routine/', views.seed_demo_routine, name='seed_demo_routine'),

    # Assignments
    path('create-assignment/', views.create_assignment, name='create_assignment'),
    path('get-assignments/', views.get_assignments, name='get_assignments'),
    path('delete-assignment/<int:assignment_id>/', views.delete_assignment, name='delete_assignment'),
    path('submit-assignment/', views.submit_assignment, name='submit_assignment'),
    path('get-assignment-submissions/<int:assignment_id>/', views.get_assignment_submissions, name='get_assignment_submissions'),
    path('grade-submission/', views.grade_submission, name='grade_submission'),

    # ============================================================
    # PUBLIC APIs (No login required)
    # ============================================================
    path('public/college-info/', views.get_public_college_info, name='public_college_info'),
    path('public/teachers/', views.get_public_teachers, name='public_teachers'),

    # ============================================================
    # CR (Class Representative) System
    # ============================================================
    path('cr/list/', views.get_crs, name='cr_list'),
    path('cr/get/', views.get_crs, name='get_crs'),
    path('cr/assign/', views.assign_cr, name='assign_cr'),
    path('cr/nominate/', views.nominate_cr, name='nominate_cr'),
    path('cr/approve/<int:cr_id>/', views.approve_cr, name='approve_cr'),
    path('cr/remove/<int:cr_id>/', views.remove_cr, name='remove_cr'),

    # ============================================================
    # Leaderboard
    # ============================================================
    path('leaderboard/', views.get_leaderboard, name='get_leaderboard'),

    # ============================================================
    # Semester Books
    # ============================================================
    path('books/', views.get_semester_books, name='get_semester_books'),
    path('books/add/', views.add_semester_book, name='add_semester_book'),
    path('books/delete/<int:book_id>/', views.delete_semester_book, name='delete_semester_book'),

    # ============================================================
    # Message System
    # ============================================================
    path('messages/', views.get_messages, name='get_messages'),
    path('messages/send/', views.send_message, name='send_message'),
    path('messages/reply/', views.reply_message, name='reply_message'),
    path('messages/unread/', views.get_unread_count, name='get_unread_count'),

    # ============================================================
    # Complaint Box
    # ============================================================
    path('complaints/', views.get_complaints, name='get_complaints'),
    path('complaints/submit/', views.submit_complaint, name='submit_complaint'),
    path('complaints/respond/<int:complaint_id>/', views.respond_complaint, name='respond_complaint'),

    # ============================================================
    # Quiz System
    # ============================================================
    path('quiz/create/', views.create_quiz, name='create_quiz'),
    path('quiz/list/', views.get_quizzes, name='get_quizzes'),
    path('quiz/start/', views.start_quiz, name='start_quiz'),
    path('quiz/<int:quiz_id>/questions/', views.get_quiz_questions, name='get_quiz_questions'),
    path('quiz/submit/', views.submit_quiz, name='submit_quiz'),
    path('quiz/save-progress/', views.save_quiz_progress, name='save_quiz_progress'),
    path('quiz/<int:quiz_id>/results/', views.get_quiz_results, name='get_quiz_results'),
    path('quiz/<int:quiz_id>/delete/', views.delete_quiz, name='delete_quiz'),
]
