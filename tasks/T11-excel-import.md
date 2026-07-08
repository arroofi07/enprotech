---
id: T11
title: Excel Import (Training Data, Scores, Questions)
prd_ref: §3.11
target_week: W5
priority: P2
estimate: M
status: Pending
dependencies: [T03, T05]
---

# T11 — Excel Import

## Konteks
Trainer membutuhkan cara cepat untuk input data dalam jumlah banyak. Fitur import Excel memungkinkan upload data training, nilai hasil peserta, dan soal quiz/latihan sekaligus.

## User Story
> Sebagai Trainer, saya ingin dapat import data dari Excel, agar saya tidak perlu input data satu per satu secara manual.

## Scope
- **In scope:** 
  - Import soal quiz/latihan dari Excel
  - Import data enrollment (student ke training)
  - Import nilai hasil training peserta
  - Template Excel yang bisa didownload
  - Validasi data sebelum import
  - Preview data sebelum confirm import
  - Error reporting untuk data yang gagal
  
- **Out of scope:** 
  - Import modul/materi dari Excel
  - Import user baru dari Excel
  - Scheduled/automated import

## Acceptance Criteria
- [ ] AC-1 — Trainer dapat download template Excel untuk setiap jenis import
- [ ] AC-2 — Trainer dapat upload file Excel untuk import soal
- [ ] AC-3 — Template soal: no, question, option_a, option_b, option_c, option_d, correct_answer
- [ ] AC-4 — Trainer dapat upload file Excel untuk import enrollment
- [ ] AC-5 — Template enrollment: student_email, training_id
- [ ] AC-6 — Trainer dapat upload file Excel untuk import nilai
- [ ] AC-7 — Template nilai: student_email, training_id, module_name, assessment_type, score
- [ ] AC-8 — Sistem memvalidasi format dan data sebelum import
- [ ] AC-9 — Tampilkan preview data sebelum confirm import
- [ ] AC-10 — Tampilkan error untuk baris yang gagal validasi
- [ ] AC-11 — User dapat proceed import hanya untuk data yang valid
- [ ] AC-12 — Tampilkan summary hasil import (success count, failed count)

## Definition of Done
- [ ] Code merged ke `main` + reviewed
- [ ] Unit test untuk parsing dan validasi Excel
- [ ] Manual QA pass: download template → fill data → upload → preview → import
- [ ] Dokumentasi: panduan import Excel dengan contoh data
- [ ] Tidak ada regresi T01-T10

## Catatan Teknis
- **Backend:** 
  - API Routes `/api/import/questions`, `/api/import/enrollments`, `/api/import/scores`
  - Parse Excel di server untuk validasi
  - Batch insert dengan transaction
- **Database:** 
  - Bulk insert dengan ON CONFLICT handling
- **Frontend:** 
  - Import modal/page dengan steps: Upload → Preview → Confirm → Result
  - DataTable untuk preview dengan error highlighting
- **Excel Libraries:**
  - Server: xlsx atau exceljs
  - Validasi schema dengan zod atau yup
- **Template Files:**
  - Store di `/public/templates/` atau generate on-demand
  - Format .xlsx dengan header row dan contoh data
- **Error Handling:**
  - Row-level error messages
  - Collect all errors before returning
  - Option to download error report
