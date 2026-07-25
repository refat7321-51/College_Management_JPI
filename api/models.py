from django.db import models
from django.utils import timezone

class UserAccount(models.Model):
    role = models.CharField(max_length=20) # 'teacher' or 'student'
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    mobile = models.CharField(max_length=20)
    email = models.EmailField(unique=True)
    gender = models.CharField(max_length=10)
    password = models.CharField(max_length=255) # Warning: stored in plaintext for demo
    profile_picture = models.ImageField(upload_to='profiles/', blank=True, null=True)
    
    # Optional fields for student
    roll = models.CharField(max_length=20, blank=True, null=True)
    batch = models.CharField(max_length=50, blank=True, null=True) # e.g. CSE-23 A
    session = models.CharField(max_length=20, blank=True, null=True)
    semester = models.CharField(max_length=50, blank=True, null=True)
    group = models.CharField(max_length=10, blank=True, null=True)  # A or B (for 1st/2nd/3rd sem)
    
    # Optional fields common/teacher
    department = models.CharField(max_length=100, blank=True, null=True)
    room_number = models.CharField(max_length=50, blank=True, null=True)
    qualification = models.TextField(blank=True, null=True)
    specialized_subjects = models.TextField(blank=True, null=True) # e.g. Physics, Math
    assigned_classes = models.TextField(blank=True, null=True)      # e.g. CSE-23 A, CSE-23 B
    designation = models.CharField(max_length=100, blank=True, null=True) # e.g. Junior Instructor

    # Fields for OTP verification
    otp = models.CharField(max_length=6, blank=True, null=True)
    otp_expiry = models.DateTimeField(blank=True, null=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.role})"

class RegistrationOTP(models.Model):
    email = models.EmailField(unique=True)
    otp = models.CharField(max_length=6)
    otp_expiry = models.DateTimeField()

    def __str__(self):
        return f"OTP for {self.email}"

class Attendance(models.Model):
    student = models.ForeignKey(UserAccount, on_delete=models.CASCADE, limit_choices_to={'role': 'student'})
    date = models.DateField()
    status = models.CharField(max_length=1, choices=[('P', 'Present'), ('A', 'Absent'), ('L', 'Late')])
    subject = models.CharField(max_length=100)
    batch = models.CharField(max_length=50) # e.g. CSE-23 A
    session = models.CharField(max_length=20)
    
    class Meta:
        unique_together = ('student', 'date', 'subject')

    def __str__(self):
        return f"{self.student.first_name} - {self.date} - {self.status}"

class Notice(models.Model):
    title = models.CharField(max_length=200)
    content = models.TextField()
    attachment = models.FileField(upload_to='notices/', blank=True, null=True)
    target_department = models.CharField(max_length=100, default='All')
    target_semester = models.CharField(max_length=50, default='All')
    date_posted = models.DateTimeField(auto_now_add=True)
    posted_by = models.ForeignKey(UserAccount, on_delete=models.SET_NULL, null=True, limit_choices_to={'role': 'teacher'})

    def __str__(self):
        return self.title

class Routine(models.Model):
    department = models.CharField(max_length=100, default='Computer Science & Technology')
    semester = models.CharField(max_length=50, default='1st Semester')
    shift = models.CharField(max_length=50, default='1st Shift') # e.g. 1st Shift / 2nd Shift
    section = models.CharField(max_length=50, blank=True, null=True, default='A')
    subject_code = models.CharField(max_length=50, blank=True, null=True) # e.g. 28572
    subject = models.CharField(max_length=100) # e.g. Network, Multimedia, Cyber
    teacher_initials = models.CharField(max_length=50, blank=True, null=True) # e.g. RH, ShK, YA, AL, RD, FH, SR
    teacher_name = models.CharField(max_length=100, blank=True, null=True)
    teacher = models.ForeignKey(UserAccount, on_delete=models.SET_NULL, null=True, blank=True, limit_choices_to={'role': 'teacher'})
    day = models.CharField(max_length=20) # Sunday, Monday, Tuesday, Wednesday, Thursday
    start_time = models.CharField(max_length=20, default='08:00') # 08:00
    end_time = models.CharField(max_length=20, default='08:45')   # 08:45
    time_slot = models.CharField(max_length=50, blank=True, null=True) # e.g. 08:00-08:45
    room = models.CharField(max_length=50) # e.g. Com-304, Network-Lab, IOT-Lab
    batch = models.CharField(max_length=50, blank=True, null=True)
    session = models.CharField(max_length=20, default='2023-24')
    academic_year = models.CharField(max_length=20, default='2025-2026')
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.day} {self.time_slot} | {self.subject} ({self.room})"

class RoutineFile(models.Model):
    title = models.CharField(max_length=200)
    file_type = models.CharField(max_length=20) # pdf, image, excel
    file = models.FileField(upload_to='routine_files/')
    department = models.CharField(max_length=100, blank=True, null=True)
    semester = models.CharField(max_length=50, blank=True, null=True)
    shift = models.CharField(max_length=50, blank=True, null=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    uploaded_by = models.ForeignKey(UserAccount, on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return f"{self.title} ({self.file_type})"

class Assignment(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    subject = models.CharField(max_length=100)
    subject_code = models.CharField(max_length=50, blank=True, null=True)
    department = models.CharField(max_length=100, default='Computer Science & Technology')
    semester = models.CharField(max_length=50, default='5th Semester')
    shift = models.CharField(max_length=50, default='1st Shift')
    total_marks = models.IntegerField(default=100)
    due_date = models.CharField(max_length=50) # e.g. "2026-07-30" or "30 July 2026, 11:59 PM"
    file = models.FileField(upload_to='assignments/', blank=True, null=True)
    drive_link = models.URLField(max_length=500, blank=True, null=True)
    posted_by = models.ForeignKey(UserAccount, on_delete=models.CASCADE, limit_choices_to={'role': 'teacher'})
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.title} ({self.department} - {self.semester})"

class AssignmentSubmission(models.Model):
    assignment = models.ForeignKey(Assignment, on_delete=models.CASCADE, related_name='submissions')
    student = models.ForeignKey(UserAccount, on_delete=models.CASCADE, limit_choices_to={'role': 'student'})
    submission_file = models.FileField(upload_to='assignment_submissions/', blank=True, null=True)
    drive_link = models.URLField(max_length=500, blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    submitted_at = models.DateTimeField(default=timezone.now)
    marks_obtained = models.CharField(max_length=20, blank=True, null=True)
    feedback = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, default='Submitted')

    class Meta:
        unique_together = ('assignment', 'student')

    def __str__(self):
        return f"{self.student.first_name} - {self.assignment.title}"


# ============================================================
# NEW MODELS
# ============================================================

class ClassRepresentative(models.Model):
    """CR (Class Representative) — প্রতি সেমিতে ২ জন (ছেলে+মেয়ে)"""
    student = models.ForeignKey(UserAccount, on_delete=models.CASCADE, limit_choices_to={'role': 'student'})
    semester = models.CharField(max_length=50)        # 1st Semester, 2nd Semester...
    group = models.CharField(max_length=10, blank=True, null=True)  # A or B (1st/2nd/3rd sem only)
    gender = models.CharField(max_length=10)           # Boys / Girls
    department = models.CharField(max_length=100, default='Computer Science & Technology')
    batch = models.CharField(max_length=50, blank=True, null=True)   # CSE-23 A
    academic_year = models.CharField(max_length=20, default='2025-2026')
    is_active = models.BooleanField(default=True)
    is_approved = models.BooleanField(default=True)
    assigned_by = models.ForeignKey(UserAccount, on_delete=models.SET_NULL, null=True, blank=True,
                                     related_name='cr_assigned', limit_choices_to={'role': 'teacher'})
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ['semester', 'group', 'gender']

    def __str__(self):
        return f"CR: {self.student.first_name} — {self.semester} ({self.gender})"


class SemesterBook(models.Model):
    """বই তালিকা — সেমিস্টার অনুযায়ী"""
    semester = models.CharField(max_length=50)        # 1st Semester...7th Semester
    subject_name = models.CharField(max_length=200)
    subject_code = models.CharField(max_length=50, blank=True, null=True)
    author = models.CharField(max_length=200, blank=True, null=True)
    publisher = models.CharField(max_length=200, blank=True, null=True)
    department = models.CharField(max_length=100, default='Computer Science & Technology')
    shift = models.CharField(max_length=50, blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    added_by = models.ForeignKey(UserAccount, on_delete=models.SET_NULL, null=True, blank=True,
                                  limit_choices_to={'role': 'teacher'})
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ['semester', 'subject_name']

    def __str__(self):
        return f"{self.subject_name} ({self.semester})"


class Message(models.Model):
    """মেসেজ সিস্টেম — Student ↔ Teacher"""
    sender = models.ForeignKey(UserAccount, on_delete=models.CASCADE, related_name='sent_messages')
    receiver = models.ForeignKey(UserAccount, on_delete=models.CASCADE, related_name='received_messages')
    subject = models.CharField(max_length=255, blank=True, null=True)
    content = models.TextField()
    sent_at = models.DateTimeField(default=timezone.now)
    is_read = models.BooleanField(default=False)
    parent_message = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True,
                                        related_name='replies')

    class Meta:
        ordering = ['-sent_at']

    def __str__(self):
        return f"From {self.sender.first_name} to {self.receiver.first_name}: {self.subject or 'No subject'}"


class Complaint(models.Model):
    """অভিযোগ বক্স — নাম/রোল হাইড, শুধু টিচার/CI দেখতে পারবে"""
    content = models.TextField()
    student = models.ForeignKey(UserAccount, on_delete=models.CASCADE, limit_choices_to={'role': 'student'})
    submitted_at = models.DateTimeField(default=timezone.now)
    is_resolved = models.BooleanField(default=False)
    response = models.TextField(blank=True, null=True)
    responded_by = models.ForeignKey(UserAccount, on_delete=models.SET_NULL, null=True, blank=True,
                                      related_name='complaint_responses', limit_choices_to={'role': 'teacher'})
    responded_at = models.DateTimeField(blank=True, null=True)
    category = models.CharField(max_length=100, blank=True, null=True)  # Academic, Facilities, etc.

    class Meta:
        ordering = ['-submitted_at']

    def __str__(self):
        return f"Complaint #{self.id} — {'Resolved' if self.is_resolved else 'Pending'}"


class Quiz(models.Model):
    """কুইজ — টিচার তৈরি করবে, স্টুডেন্ট সময়ের মধ্যে দেবে"""
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    subject = models.CharField(max_length=100)
    department = models.CharField(max_length=100, default='Computer Science & Technology')
    semester = models.CharField(max_length=50)
    language = models.CharField(max_length=20, default='English')   # English / Bangla / Both
    duration_minutes = models.IntegerField(default=30)              # সময়সীমা মিনিটে
    total_marks = models.IntegerField(default=100)
    start_time = models.DateTimeField()                             # কুইজ শুরুর সময়
    end_time = models.DateTimeField()                               # কুইজ শেষের সময়
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(UserAccount, on_delete=models.CASCADE, limit_choices_to={'role': 'teacher'})
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} ({self.semester})"


class QuizQuestion(models.Model):
    """কুইজের প্রশ্ন"""
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='questions')
    question_text = models.TextField()
    option_a = models.CharField(max_length=500)
    option_b = models.CharField(max_length=500)
    option_c = models.CharField(max_length=500)
    option_d = models.CharField(max_length=500)
    correct_answer = models.CharField(max_length=1)   # A, B, C, D
    marks = models.IntegerField(default=5)
    order = models.IntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"Q{self.order}: {self.question_text[:60]}"


class QuizSubmission(models.Model):
    """কুইজ সাবমিশন"""
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='submissions')
    student = models.ForeignKey(UserAccount, on_delete=models.CASCADE, limit_choices_to={'role': 'student'})
    answers = models.JSONField(default=dict)              # {question_id: chosen_answer}
    score = models.IntegerField(default=0)
    total_questions = models.IntegerField(default=0)
    correct_count = models.IntegerField(default=0)
    started_at = models.DateTimeField(default=timezone.now)
    submitted_at = models.DateTimeField(blank=True, null=True)
    time_taken_minutes = models.FloatField(default=0)
    is_completed = models.BooleanField(default=False)

    class Meta:
        unique_together = ('quiz', 'student')

    def __str__(self):
        return f"{self.student.first_name} — {self.quiz.title} ({self.score} marks)"
