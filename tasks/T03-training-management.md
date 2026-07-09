---
id: T03
title: Training/Kelas Management (CRUD, Settings, Enrollment)
prd_ref: §3.3
target_week: W2
priority: P0
estimate: L
status: Review
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
- [x] AC-1 — Admin/Trainer dapat membuat training baru (judul, deskripsi, thumbnail)
- [x] AC-2 — Admin/Trainer dapat mengatur passing grade (0-100) per training
- [x] AC-3 — Admin/Trainer dapat mengatur deadline training (opsional)
- [x] AC-4 — Admin/Trainer dapat melihat daftar semua training
- [x] AC-5 — Admin/Trainer dapat edit detail training
- [x] AC-6 — Admin/Trainer dapat archive training (soft delete)
- [x] AC-7 — Admin/Trainer dapat enroll student ke training (single atau multiple)
- [x] AC-8 — Admin/Trainer dapat remove student dari training
- [x] AC-9 — Admin/Trainer dapat mengaktifkan pre-test (hanya jika semua modul sudah di-upload)
- [x] AC-10 — Student dapat melihat daftar training yang di-enroll
- [x] AC-11 — Training dengan status "draft" tidak muncul untuk Student
- [x] AC-12 — Tampilkan progress student di list training (untuk Student)

## Definition of Done
- [ ] Code merged ke `main` + reviewed
- [x] Unit test untuk CRUD training dan enrollment
- [x] Manual QA pass: create training → setting → enroll → student view
- [x] Dokumentasi: panduan mengelola training
- [x] Tidak ada regresi T01, T02

## Implementasi (selesai)

### Pendekatan
- Clean Architecture mirror T01/T02 (domain → application → infrastructure → presentation)
- Hybrid: Server Actions untuk UI + thin API Routes `/api/trainings`
- Role-based routes: `/trainer/*` (admin + trainer), `/student/*`
- Status `archived` untuk soft delete; kolom `is_pretest_active` untuk gate pre-test

### File utama
| Layer | Path |
|-------|------|
| Domain | `lib/domain/trainings/` |
| Application | `lib/application/trainings/` |
| Infrastructure | `training-repository.ts`, `user-repository listActiveStudents` |
| Presentation | `app/actions/trainings.ts`, `app/api/trainings/`, `app/(dashboard)/trainer|student/trainings/` |
| UI | `components/trainings/`, `components/trainer/`, `components/student/` |
| Docs | `docs/training-management.md` |
| Tests | `tests/domain/trainings/`, `tests/application/trainings/` |

## Catatan Teknis
- **Backend:** API Routes `/api/trainings`, `/api/trainings/[id]`, `/api/trainings/[id]/enroll`, `/api/trainings/enrolled` + Server Actions
- **Database:** 
  - Tabel `trainings` (+ `is_pretest_active`, status termasuk `archived`)
  - Tabel `enrollments` (unique `student_id` + `training_id`)
- **Frontend:** 
  - Admin/Trainer: `/trainer/trainings`, `/trainer/trainings/new`, `/trainer/trainings/[id]/edit`
  - Student: `/student/trainings`
- **File Upload:** Thumbnail via URL input (Vercel Blob → T04)
- **UI Components:** shadcn Card, Table, Tabs, Dialog, AlertDialog, Badge, Progress, Checkbox
