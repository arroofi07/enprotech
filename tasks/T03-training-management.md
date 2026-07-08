---
id: T03
title: Training/Kelas Management (CRUD, Settings, Enrollment)
prd_ref: §3.3
target_week: W2
priority: P0
estimate: L
status: Pending
dependencies: [T01, T02]
---

# T03 — Training Management

## Konteks
Training/Kelas adalah entitas utama yang menampung modul-modul pembelajaran. Admin dan Trainer dapat membuat training baru, mengatur passing grade, deadline, serta meng-enroll student ke training tertentu.

## User Story
> Sebagai Trainer, saya ingin dapat membuat dan mengelola training beserta pengaturannya, agar student dapat mengikuti program pembelajaran yang terstruktur.

## Scope
- **In scope:** 
  - CRUD Training (Create, Read, Update, Delete/Archive)
  - Setting passing grade per training
  - Setting deadline/periode training
  - Enroll student ke training
  - Aktivasi pre-test (setelah semua materi ready)
  - List training untuk Admin/Trainer
  - List training yang di-enroll untuk Student
  
- **Out of scope:** 
  - Duplicate/clone training
  - Training template
  - Auto-enrollment berdasarkan kriteria

## Acceptance Criteria
- [ ] AC-1 — Admin/Trainer dapat membuat training baru (judul, deskripsi, thumbnail)
- [ ] AC-2 — Admin/Trainer dapat mengatur passing grade (0-100) per training
- [ ] AC-3 — Admin/Trainer dapat mengatur deadline training (opsional)
- [ ] AC-4 — Admin/Trainer dapat melihat daftar semua training
- [ ] AC-5 — Admin/Trainer dapat edit detail training
- [ ] AC-6 — Admin/Trainer dapat archive training (soft delete)
- [ ] AC-7 — Admin/Trainer dapat enroll student ke training (single atau multiple)
- [ ] AC-8 — Admin/Trainer dapat remove student dari training
- [ ] AC-9 — Admin/Trainer dapat mengaktifkan pre-test (hanya jika semua modul sudah di-upload)
- [ ] AC-10 — Student dapat melihat daftar training yang di-enroll
- [ ] AC-11 — Training dengan status "draft" tidak muncul untuk Student
- [ ] AC-12 — Tampilkan progress student di list training (untuk Student)

## Definition of Done
- [ ] Code merged ke `main` + reviewed
- [ ] Unit test untuk CRUD training dan enrollment
- [ ] Manual QA pass: create training → setting → enroll → student view
- [ ] Dokumentasi: panduan mengelola training
- [ ] Tidak ada regresi T01, T02

## Catatan Teknis
- **Backend:** API Routes `/api/trainings`, `/api/trainings/[id]/enroll`
- **Database:** 
  - Tabel `trainings` (id, title, description, thumbnail, passing_grade, deadline, status, created_by)
  - Tabel `enrollments` (id, student_id, training_id, status, enrolled_at)
- **Frontend:** 
  - Admin/Trainer: `/dashboard/trainings` (list), `/dashboard/trainings/new`, `/dashboard/trainings/[id]/edit`
  - Student: `/trainings` (enrolled list)
- **File Upload:** Thumbnail via Vercel Blob atau similar
- **UI Components:** Card, Form, DatePicker, MultiSelect (untuk enroll)
