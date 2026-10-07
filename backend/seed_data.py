import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth.models import User
from api.models import (
    StudentProfile, Subject, StudyNote, MCQCategory, MCQQuestion, SubjectAllocation
)

# 1. Admin Superuser
if not User.objects.filter(username='admin').exists():
    admin_user = User.objects.create_superuser('admin', 'admin@ati.com', 'admin123')
    print("Created Admin user: admin / admin123")
else:
    print("Admin user already exists")

# 2. Sample Subjects
subj1, _ = Subject.objects.get_or_create(
    name="Full Stack Web Development",
    category="Web Tech",
    description="React, Django REST Framework, State Management and APIs"
)
subj2, _ = Subject.objects.get_or_create(
    name="Python Backend & Architecture",
    category="Backend",
    description="Python 3, Django ORM, Models, Views, Authentication, and Database management"
)
subj3, _ = Subject.objects.get_or_create(
    name="Frontend UI & React",
    category="Frontend",
    description="React Hooks, Components, Tailwind CSS, Responsive Design"
)

# 3. Sample Notes
StudyNote.objects.get_or_create(
    subject=subj1,
    title="Getting Started with Full Stack Architecture",
    content="In modern web applications, the frontend (React) communicates with the backend (Django REST API) via JSON endpoints over HTTP. Key principles include token authentication, clean serializers, and state sync."
)

StudyNote.objects.get_or_create(
    subject=subj2,
    title="Django ORM and Database Models Guide",
    content="Django ORM allows defining Python classes as database tables. Always ensure foreign key relations have appropriate on_delete behaviors, and use select_related() for performance when querying foreign keys."
)

StudyNote.objects.get_or_create(
    subject=subj3,
    title="React State Management with Hooks",
    content="useState and useEffect are the foundational hooks. Use useEffect with dependency arrays carefully to avoid infinite re-renders. For complex shared state, consider React Context or custom hooks."
)

# 4. MCQ Categories & Questions
cat1, _ = MCQCategory.objects.get_or_create(
    name="Python & Django",
    description="Core Python and Django Framework MCQs"
)
cat2, _ = MCQCategory.objects.get_or_create(
    name="React & JavaScript",
    description="Modern React, ES6+, and UI concepts"
)

# Questions for Category 1
MCQQuestion.objects.get_or_create(
    category=cat1,
    question_text="What command is used to apply database migrations in Django?",
    option_a="python manage.py runserver",
    option_b="python manage.py migrate",
    option_c="python manage.py makemigrations",
    option_d="python manage.py sync",
    correct_option="B"
)
MCQQuestion.objects.get_or_create(
    category=cat1,
    question_text="Which Django module is commonly used to create REST APIs with serializers and viewsets?",
    option_a="Django Templates",
    option_b="Django Forms",
    option_c="Django REST Framework (DRF)",
    option_d="Django Admin",
    correct_option="C"
)
MCQQuestion.objects.get_or_create(
    category=cat1,
    question_text="What is the default primary key created by Django models if none is explicitly specified?",
    option_a="Auto-incrementing id integer",
    option_b="UUID string",
    option_c="Email address",
    option_d="Hash string",
    correct_option="A"
)

# Questions for Category 2
MCQQuestion.objects.get_or_create(
    category=cat2,
    question_text="Which React hook is used to handle side effects like data fetching and subscriptions?",
    option_a="useState",
    option_b="useReducer",
    option_c="useMemo",
    option_d="useEffect",
    correct_option="D"
)
MCQQuestion.objects.get_or_create(
    category=cat2,
    question_text="What is JSX in React?",
    option_a="A database query language",
    option_b="Syntax extension for JavaScript that looks like HTML",
    option_c="A CSS preprocessor",
    option_d="A backend server engine",
    correct_option="B"
)

print("Database seeding completed successfully!")
