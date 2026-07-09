---
id: T04
title: Module Management (CRUD, Content Upload, Ordering)
prd_ref: §3.4
target_week: W2-W3
priority: P0
estimate: XL
status: Review
dependencies: [T03]
---

# T04 — Module Management

## Konteks
Setiap Training terdiri dari beberapa Modul yang berurutan. Modul berisi materi pembelajaran dalam berbagai format: dokumen (PDF, Word, Excel), link video (YouTube), link download (Google Drive), dan link video conference (Google Meet/Zoom).

## User Story
> Sebagai Trainer, saya ingin dapat membuat dan mengelola modul pembelajaran dengan berbagai jenis konten, agar student dapat mengakses materi dengan lengkap dan terstruktur.

## Scope
- **In scope:** 
  - CRUD Modul dalam training
  - Upload thumbnail modul (gambar)
  - Upload materi dokumen (PDF, DOC/DOCX, XLS/XLSX, max 1MB)
  - Tambah link video (YouTube, Vimeo, dll)
  - Tambah link download (Google Drive, OneDrive, dll)
  - Tambah link video conference (Google Meet/Zoom)
  - Drag & drop untuk atur urutan modul
  - Preview konten modul
  
- **Out of scope:** 
  - Embedded video player
  - SCORM package upload
  - Interactive content builder

## Acceptance Criteria
- [x] AC-1 — Trainer dapat membuat modul baru dalam training (judul, deskripsi)
- [x] AC-2 — Trainer dapat upload thumbnail modul (gambar, max 2MB)
- [x] AC-3 — Trainer dapat upload dokumen materi (PDF/DOC/DOCX/XLS/XLSX, max 1MB per file)
- [x] AC-4 — Sistem menolak file dengan format atau ukuran tidak sesuai
- [x] AC-5 — Trainer dapat menambah multiple link video (YouTube, dll)
- [x] AC-6 — Trainer dapat menambah multiple link download (Google Drive, dll)
- [x] AC-7 — Trainer dapat menambah link video conference (Google Meet/Zoom)
- [x] AC-8 — Trainer dapat mengatur urutan modul dengan drag & drop
- [x] AC-9 — Trainer dapat edit dan hapus konten modul
- [x] AC-10 — Student dapat melihat dan mengakses semua konten modul
- [x] AC-11 — Student dapat download dokumen materi
- [x] AC-12 — Link video dan download terbuka di tab baru
- [x] AC-13 — Modul menampilkan status completion untuk Student

## Definition of Done
- [ ] Code merged ke `main` + reviewed
- [x] Unit test untuk upload dan validasi file
- [ ] Manual QA pass: create modul → upload content → reorder → student access
- [x] Dokumentasi: panduan mengelola modul dan format file yang didukung
- [x] Tidak ada regresi T01-T03

## Implementasi (selesai)

### Pendekatan
- Clean Architecture mirror T03 (domain → application → infrastructure → presentation)
- Hybrid: Server Actions untuk UI + thin API Routes
- Vercel Blob untuk thumbnail & dokumen dengan validasi MIME + size di domain layer
- @dnd-kit untuk drag & drop urutan modul
- react-dropzone untuk file upload UI

### File utama
| Layer | Path |
|-------|------|
| Domain | `lib/domain/modules/` |
| Application | `lib/application/modules/` |
| Infrastructure | `module-repository.ts`, `blob-storage.ts` |
| Presentation | `app/actions/modules.ts`, `app/api/modules/`, `app/api/trainings/[id]/modules/` |
| UI | `components/modules/` |
| Docs | `docs/module-management.md` |
| Tests | `tests/domain/modules/`, `tests/application/modules/` |

## Catatan Teknis
- **Backend:** 
  - API Routes `/api/trainings/[id]/modules`, `/api/modules/[id]/contents`
  - File upload endpoint dengan validasi MIME type dan size
- **Database:** 
  - Tabel `modules` (id, training_id, title, description, thumbnail, video_conference_link, order)
  - Tabel `module_contents` (id, module_id, type, title, url, file_size, order)
- **Frontend:** 
  - Trainer: `/dashboard/trainings/[id]/modules`
  - Student: `/trainings/[id]/modules/[moduleId]`
- **File Upload:** 
  - Vercel Blob untuk dokumen dan thumbnail
  - Validasi: PDF, DOC, DOCX, XLS, XLSX (max 1MB), Image (max 2MB)
- **UI Components:** 
  - Drag & drop: @dnd-kit/core atau react-beautiful-dnd
  - File upload: react-dropzone
  - Link input dengan URL validation
