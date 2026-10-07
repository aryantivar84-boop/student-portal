# Ati Technologies - Student & Internship Management Portal

A full-stack web application built with **Django REST Framework** (Backend) and **React + Vite + Tailwind CSS** (Frontend).

---

## 🎧 Requirements Implemented (From the 3 Voice Notes)

### **Part 1: Registration, Verification & Work Tracking**
* **Student Registration:** Students register with Name, Mobile, Email, College Name, University, and Technology/Domain.
* **Admin Verification:** Student accounts stay pending until an Admin verifies and accepts them. Unverified accounts cannot log in.
* **Clock-In / Clock-Out:**
  * Interactive **Clock-In** starts a real-time working timer.
  * **Pause / Break:** Logs breaks (Lunch, Water, Tea) and pauses the timer.
  * **Resume:** Continues the timer.
  * **Clock-Out:** Concludes daily attendance.
* **Daily Work Reporting:** Students submit an hourly task log (e.g. 2:00–3:00, 3:00–4:00) before leaving.
* **Admin Analytics:** Filter attendance sessions and hourly work reports by **Month** and **Student / Employee**.

### **Part 2: Auto-Generated Documents & MCQ Exams**
* **Automated PDF Generation:**
  * **Internship Offer Letter (PDF):** Generated on the fly with official company letterhead and student details once approved by Admin.
  * **Internship Completion Certificate (PDF):** Generated with certificate borders, seals, and authorized signatures.
* **MCQ Examination Engine:**
  * Admin creates questions categorized by technology (Python, React, etc.).
  * Students take online tests with instant score evaluation and question reviews.
  * Admin reviews student performance and scores.

### **Part 3: Allocated Study Notes & Materials**
* **Admin Notes Manager:** Admin creates subjects and publishes learning notes.
* **Subject-Based Access Control:** Students can **only view notes** for subjects that have been allocated to them by the Admin.

---

## 🚀 Quick Start Guide

### 1. Test Accounts Ready to Use:
* **Admin Account:**
  * Username: `admin`
  * Password: `admin123`
* **Demo Approved Student:**
  * Username: `student_demo`
  * Password: `demo123`

### 2. Running Backend (Django):
Open a terminal in `student_portal/backend`:
```powershell
python manage.py runserver 127.0.0.1:8000
```
Or double-click `run_backend.bat`.

### 3. Running Frontend (React):
Open a second terminal in `student_portal/frontend`:
```powershell
npm run dev
```
Or double-click `run_frontend.bat`.

Then open your browser at **`http://localhost:5173`**.
