# Product Requirements Document (PRD)
# E-Training Platform

**Version:** 1.0  
**Last Updated:** July 8, 2026  
**Status:** Draft

---

## 1. Overview

### 1.1 Product Summary
E-Training adalah platform e-learning berbasis web yang memungkinkan organisasi untuk menyelenggarakan pelatihan online secara terstruktur. Platform ini mendukung alur pembelajaran yang sistematis mulai dari pre-test, modul pembelajaran, quiz, latihan, hingga post-test dan penerbitan sertifikat.

### 1.2 Objectives
- Menyediakan platform e-learning yang mudah digunakan untuk trainer dan student
- Memungkinkan tracking progress pembelajaran secara real-time
- Otomatisasi penerbitan sertifikat setelah menyelesaikan training
- Menyediakan reporting dan rekap hasil training yang komprehensif

### 1.3 Target Users
| Role | Deskripsi |
|------|-----------|
| **Admin** | Mengelola user, mengatur role, aktivasi/deaktivasi akun |
| **Trainer** | Membuat dan mengelola materi training, quiz, latihan |
| **Student** | Mengikuti training dan mengakses sertifikat |

---

## 2. User Roles & Permissions

### 2.1 Admin
- Mengelola semua user (CRUD)
- Mengubah role user (trainer/student)
- Mengaktifkan/menonaktifkan user
- Mengatur passing grade dan deadline training
- Melihat rekap hasil training global
- Menerima notifikasi penyelesaian modul

### 2.2 Trainer
- Upload dan kelola materi modul
- Mengatur jadwal video conference
- Membuat quiz dan latihan (pilihan ganda)
- Import data dari Excel (data training & nilai)
- Mengatur passing grade dan deadline training
- Melihat rekap hasil training
- Menerima notifikasi penyelesaian modul

### 2.3 Student
- Mengikuti pre-test (sekali saja)
- Mengakses materi modul
- Mengikuti video conference via link external
- Mengerjakan quiz dan latihan (unlimited retry)
- Mengerjakan post-test (unlimited retry)
- Melihat progress dan nilai
- Mengakses dan download sertifikat

---

## 3. Core Features

### 3.1 Authentication & Authorization
- Login/Logout
- Register (pending approval dari admin)
- Role-based access control (RBAC)
- Session management

### 3.2 User Management (Admin)
- List semua user dengan filter & search
- Approve user baru
- Ubah role user (admin/trainer/student)
- Aktivasi/deaktivasi user
- View detail user

### 3.3 Training Management
- CRUD Training/Kelas
- Setting passing grade per training
- Setting deadline/periode training
- Assign trainer ke training
- Enroll student ke training
- Aktivasi pre-test (setelah semua materi ready)

### 3.4 Module Management
- CRUD Modul dalam training
- Upload thumbnail modul (gambar)
- Upload materi dokumen (PDF, DOC/DOCX, XLS/XLSX, max 1MB)
- Tambah link video (YouTube, dll)
- Tambah link download (Google Drive untuk PPT, dll)
- Tambah link video conference (Google Meet/Zoom)
- Atur urutan modul

### 3.5 Quiz & Latihan
- CRUD soal pilihan ganda
- Import soal dari Excel
- Setting jumlah soal per quiz/latihan
- Unlimited retry jika tidak mencapai passing grade
- Nilai tertinggi yang diambil
- Auto-save jawaban
- Tampilkan hasil setelah submit

### 3.6 Pre-Test & Post-Test
- **Pre-Test:**
  - Hanya bisa dikerjakan sekali
  - Aktif setelah semua materi di-upload oleh trainer
  - Wajib sebelum memulai modul pertama
  
- **Post-Test:**
  - Unlimited retry jika tidak mencapai passing grade
  - Wajib setelah menyelesaikan semua modul
  - Syarat untuk mendapatkan sertifikat

### 3.7 Progress Tracking
- Dashboard progress per student
- Tracking modul yang sudah diselesaikan
- Tracking quiz dan latihan yang sudah dikerjakan
- Tracking nilai per assessment
- Progress bar keseluruhan training

### 3.8 Notification System
- Real-time notification di website
- Notifikasi ke admin & trainer saat student menyelesaikan modul
- Notifikasi ke student untuk reminder deadline
- Bell icon dengan badge counter

### 3.9 Reporting & Rekap
- Rekap hasil training global (admin & trainer)
- Filter berdasarkan:
  - User/Student
  - Modul
  - Tanggal training
- Rekap hasil per user
- Export report ke Excel/PDF

### 3.10 Certificate
- Generate otomatis setelah lulus post-test
- Template default dari sistem
- Data dinamis (nama, training, tanggal, nilai)
- Download dalam format PDF
- Unique certificate ID untuk verifikasi

### 3.11 Excel Import/Export
- Import data training
- Import nilai hasil training peserta
- Import soal quiz/latihan
- Template Excel yang bisa didownload

---

## 4. Learning Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              ALUR E-TRAINING                                │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────────────┐
│  LOGIN   │───▶│ PRE-TEST │───▶│  MODUL   │───▶│ VIDEO CONFERENCE │
└──────────┘    └──────────┘    └──────────┘    └──────────────────┘
                 (sekali)         (pilih)            (sesuai jadwal)
                                     │
                                     ▼
┌──────────────────────────────────────────────────────────────────┐
│                    LOOP UNTUK SETIAP MODUL                       │
│  ┌────────────────┐    ┌───────────┐    ┌────────────────────┐  │
│  │ VIDEO CONFERENCE│───▶│   QUIZ    │───▶│ LATIHAN (Akhir Sesi)│ │
│  └────────────────┘    └───────────┘    └────────────────────┘  │
│                                                    │             │
│                              ┌─────────────────────┘             │
│                              ▼                                   │
│                    ┌──────────────────┐                         │
│                    │ NILAI TERSIMPAN  │                         │
│                    │    OTOMATIS      │                         │
│                    └──────────────────┘                         │
└──────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
                    ┌──────────────────────────┐
                    │ LANJUT KE MODUL BERIKUTNYA│
                    └──────────────────────────┘
                                     │
                                     ▼
┌──────────────────┐    ┌───────────┐    ┌─────────────────────┐
│ PENYELESAIAN     │───▶│ POST-TEST │───▶│ SELESAI E-TRAINING  │
│ SELURUH MODUL    │    │           │    │ + SERTIFIKAT        │
└──────────────────┘    └───────────┘    └─────────────────────┘
                      (unlimited retry)
```

---

## 5. Data Models

### 5.1 User
```
User {
  id: UUID
  email: string (unique)
  password: string (hashed)
  name: string
  role: enum (admin, trainer, student)
  status: enum (pending, active, inactive)
  avatar: string (optional)
  created_at: timestamp
  updated_at: timestamp
}
```

### 5.2 Training
```
Training {
  id: UUID
  title: string
  description: text
  thumbnail: string
  passing_grade: integer (0-100)
  deadline: date (optional)
  status: enum (draft, active, completed)
  created_by: UUID (trainer/admin)
  created_at: timestamp
  updated_at: timestamp
}
```

### 5.3 Module
```
Module {
  id: UUID
  training_id: UUID (FK)
  title: string
  description: text
  thumbnail: string
  video_conference_link: string (optional)
  order: integer
  created_at: timestamp
  updated_at: timestamp
}
```

### 5.4 Module Content
```
ModuleContent {
  id: UUID
  module_id: UUID (FK)
  type: enum (document, video_link, download_link)
  title: string
  url: string
  file_size: integer (optional, for documents)
  order: integer
  created_at: timestamp
}
```

### 5.5 Assessment (Quiz/Latihan/Pre-Test/Post-Test)
```
Assessment {
  id: UUID
  training_id: UUID (FK)
  module_id: UUID (FK, nullable for pre/post-test)
  type: enum (pre_test, quiz, latihan, post_test)
  title: string
  passing_grade: integer (optional, inherit from training)
  time_limit: integer (optional, in minutes)
  max_retry: integer (null = unlimited, 1 for pre-test)
  created_at: timestamp
}
```

### 5.6 Question
```
Question {
  id: UUID
  assessment_id: UUID (FK)
  question_text: text
  options: JSON [{id, text, is_correct}]
  order: integer
  created_at: timestamp
}
```

### 5.7 Student Enrollment
```
Enrollment {
  id: UUID
  student_id: UUID (FK)
  training_id: UUID (FK)
  enrolled_at: timestamp
  completed_at: timestamp (nullable)
  status: enum (enrolled, in_progress, completed)
}
```

### 5.8 Assessment Attempt
```
AssessmentAttempt {
  id: UUID
  student_id: UUID (FK)
  assessment_id: UUID (FK)
  score: integer
  answers: JSON [{question_id, selected_option_id}]
  started_at: timestamp
  submitted_at: timestamp
}
```

### 5.9 Module Progress
```
ModuleProgress {
  id: UUID
  student_id: UUID (FK)
  module_id: UUID (FK)
  status: enum (not_started, in_progress, completed)
  completed_at: timestamp (nullable)
}
```

### 5.10 Certificate
```
Certificate {
  id: UUID
  certificate_number: string (unique)
  student_id: UUID (FK)
  training_id: UUID (FK)
  issued_at: timestamp
  pre_test_score: integer
  post_test_score: integer
  final_grade: integer
}
```

### 5.11 Notification
```
Notification {
  id: UUID
  user_id: UUID (FK)
  type: string
  title: string
  message: text
  data: JSON
  is_read: boolean
  created_at: timestamp
}
```

---

## 6. Technical Requirements

### 6.1 Technology Stack
- **Frontend:** Next.js (App Router), React, TypeScript
- **UI Library:** shadcn/ui, Tailwind CSS
- **Backend:** Next.js API Routes / Server Actions
- **Database:** PostgreSQL (via Neon/Supabase)
- **Authentication:** NextAuth.js / Clerk
- **File Storage:** Vercel Blob / Cloudinary
- **Real-time:** WebSocket / Server-Sent Events
- **PDF Generation:** @react-pdf/renderer

### 6.2 Non-Functional Requirements
- **Performance:** Page load < 3 seconds
- **Security:** HTTPS, password hashing, CSRF protection
- **Scalability:** Support 1000+ concurrent users
- **Availability:** 99.9% uptime
- **Browser Support:** Chrome, Firefox, Safari, Edge (latest 2 versions)
- **Responsive:** Desktop, tablet, mobile

---

## 7. Success Metrics

| Metric | Target |
|--------|--------|
| User Registration Completion | > 90% |
| Training Completion Rate | > 70% |
| Average Quiz Score | > 75% |
| Certificate Generation Success | 100% |
| Page Load Time | < 3 seconds |
| System Uptime | > 99.9% |

---

## 8. Future Enhancements (Out of Scope v1)

- Mobile app (iOS/Android)
- Live video streaming (embedded)
- Discussion forum per modul
- Gamification (badges, leaderboard)
- Multi-language support
- Advanced analytics dashboard
- SCORM compliance
- Integration dengan LMS external

---

## 9. Appendix

### 9.1 Wireframe Reference
Lihat file: `assets/flow-e55423f1-a16d-4de9-a377-9ce0add8d470.png`

### 9.2 Related Documents
- Task Files: `tasks/01-authentication.md` s/d `tasks/11-excel-import.md`
- Database Schema: TBD
- API Documentation: TBD
