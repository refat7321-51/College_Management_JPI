# 🎓 Academic Portal & Management System

A full-featured college management system built with **Django (Python)** backend and a plain **HTML/CSS/JS** frontend. Supports student & teacher dashboards, attendance, assignments, quizzes with timers, notices, leaderboard, class routines, messaging, and more.

---

## ⚡ Quick Start — Double Click & Run (Recommended)

> **Anyone** can run this project on a new PC with just **one double-click** — no manual setup needed.

### Prerequisites (One-time only)
You only need **Python** installed on your PC.

1. Download Python from → **https://www.python.org/downloads/**
2. During installation, **check the box: `☑ Add python.exe to PATH`** — this is very important!
3. Click Install Now and finish the installation.

### Run the Project
1. Open the project folder.
2. **Double-click `setup.bat`**
3. That's it! The script will automatically:
   - Detect your Python installation
   - Create a virtual environment (`.venv`)
   - Install all required packages from `requirements.txt`
   - Set up the database (migrations)
   - Create required media folders
   - Open your browser at **http://127.0.0.1:8000**

---

## 🖥️ Manual Setup (Terminal / Command Prompt)

If you prefer to run commands manually, open a terminal in the project folder and run:

```bash
# Step 1 — Create a virtual environment
python -m venv .venv

# Step 2 — Activate the virtual environment (Windows)
.venv\Scripts\activate

# Step 3 — Install all required packages
pip install -r requirements.txt

# Step 4 — Run database migrations
python manage.py makemigrations
python manage.py migrate

# Step 5 — Start the development server
python manage.py runserver
```

Then open your browser and go to: **http://127.0.0.1:8000**

---

## 📁 Project Structure

```
project-root/
│
├── setup.bat              ← Double-click this to run the project (Windows)
├── manage.py              ← Django management command entry point
├── requirements.txt       ← All Python package dependencies
├── .env                   ← Email & secret key config (auto-created by setup.bat)
├── .env.example           ← Template for .env — fill in your Gmail credentials
├── db.sqlite3             ← SQLite database (auto-created on first run)
│
├── backend/               ← Django project settings & URL configuration
│   ├── settings.py
│   └── urls.py
│
├── api/                   ← All backend API logic
│   ├── models.py          ← Database models (Users, Quiz, Assignments, etc.)
│   ├── views.py           ← All API endpoint handlers
│   └── urls.py            ← API URL routes
│
├── frontend/              ← All HTML/CSS/JS frontend files
│   ├── index.html         ← Public landing page
│   ├── loginpage1.html    ← Login page
│   ├── dashboard.html     ← Student dashboard
│   ├── teacher-dashboard.html ← Teacher dashboard
│   ├── student-register.html  ← Student registration
│   ├── teacher-register.html  ← Teacher registration
│   ├── forgot-password.html   ← Password reset
│   ├── css/               ← Stylesheets
│   └── js/                ← JavaScript files
│
└── media/                 ← Uploaded files (profile photos, assignments, etc.)
    ├── profiles/
    ├── routines/
    └── assignments/
```

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 👩‍🏫 Teacher Dashboard | Create quizzes, manage attendance, post notices, assign assignments |
| 🎓 Student Dashboard | View quizzes, submit assignments, check attendance & leaderboard |
| ⏱️ Timed Quiz System | Full-screen quiz with countdown timer, auto-submit, instant scoring |
| 📋 Attendance Tracking | Teachers mark attendance; students view their records |
| 📢 Notice Board | Department & semester-specific announcements |
| 🏆 Leaderboard | Students ranked by quiz score + attendance |
| 📚 Semester Books | Probidhan 2022 book directory for all 7 departments |
| 💬 Messaging | Students can message teachers directly |
| 📅 Class Routine | Weekly schedule with image/PDF upload support |
| 🔒 OTP Email Login | Secure login with Gmail OTP verification |
| 📦 CR System | Class Representative nomination & approval |
| 🎭 Anonymous Complaints | Students submit anonymous complaints |

---

## ⚙️ Email Configuration (OTP Login)

This system sends OTP verification emails for login and registration. To enable it:

1. Open the `.env` file (auto-created by `setup.bat`).
2. Fill in your Gmail credentials:

```env
EMAIL_HOST_USER=your_gmail@gmail.com
EMAIL_HOST_PASSWORD=your_16_character_app_password
```

> **How to get an App Password:**
> Go to your Google Account → Security → 2-Step Verification → App Passwords → Create one for "Mail".
> Use the 16-character code as `EMAIL_HOST_PASSWORD`.

> **Note:** If you skip this, OTP emails will not be sent. The system will still run, but login/registration requiring OTP will not work.

---

## 🛠️ Troubleshooting

| Problem | Solution |
|---|---|
| `'python' is not recognized` | Reinstall Python and check **"Add python.exe to PATH"** during setup |
| `Port 8000 already in use` | Run `python manage.py runserver 8001` and open `http://127.0.0.1:8001` |
| `ModuleNotFoundError` | Run `.venv\Scripts\activate` then `pip install -r requirements.txt` again |
| `No module named 'django'` | Make sure you activated the virtual environment before running |
| `Migration error` | Delete `db.sqlite3` and run `python manage.py migrate` again |
| Browser shows blank page | Make sure the server is running (check the terminal for errors) |

---

## 🔗 Access URLs

| URL | Page |
|---|---|
| http://127.0.0.1:8000 | Public landing page |
| http://127.0.0.1:8000/frontend/loginpage1.html | Login |
| http://127.0.0.1:8000/frontend/dashboard.html | Student Dashboard |
| http://127.0.0.1:8000/frontend/teacher-dashboard.html | Teacher Dashboard |
| http://127.0.0.1:8000/api/ | API root |

---

## 📋 Tech Stack

- **Backend:** Python 3.10+, Django 4.2+
- **Database:** SQLite (built-in, no installation needed)
- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Email:** Gmail SMTP with App Password
- **File Storage:** Django Media Files (local)

---

*To stop the server, press `Ctrl + C` in the terminal window.*
