---
id: T09
title: Reporting & Rekap Hasil Training
prd_ref: §3.9
target_week: W5
priority: P1
estimate: L
status: Review
dependencies: [T05, T06, T07]
---

# T09 — Reporting & Rekap

## Konteks
Admin dan Trainer membutuhkan rekap hasil training untuk monitoring dan evaluasi. Rekap dapat difilter berdasarkan user, modul, dan tanggal. Data juga dapat di-export ke Excel/PDF.

## User Story
> Sebagai Admin/Trainer, saya ingin melihat rekap hasil training yang dapat difilter dan di-export, agar saya dapat mengevaluasi efektivitas program training.

## Scope
- **In scope:** 
  - Halaman rekap hasil training global
  - Filter berdasarkan user/student
  - Filter berdasarkan modul
  - Filter berdasarkan tanggal/periode
  - Rekap hasil per user/student
  - Export ke Excel
  - Export ke PDF
  
- **Out of scope:** 
  - Analytics dashboard dengan chart
  - Trend analysis
  - Automated report scheduling

## Acceptance Criteria
- [x] AC-1 — Admin/Trainer dapat akses halaman rekap hasil training
- [x] AC-2 — Halaman menampilkan tabel dengan: nama student, training, modul, quiz score, latihan score, status
- [x] AC-3 — Admin/Trainer dapat filter berdasarkan student (dropdown/search)
- [x] AC-4 — Admin/Trainer dapat filter berdasarkan training
- [x] AC-5 — Admin/Trainer dapat filter berdasarkan modul
- [x] AC-6 — Admin/Trainer dapat filter berdasarkan range tanggal
- [x] AC-7 — Admin/Trainer dapat melihat detail rekap per student
- [x] AC-8 — Detail rekap menampilkan semua attempt dan nilai per assessment
- [x] AC-9 — Admin/Trainer dapat export data ke Excel (.xlsx)
- [x] AC-10 — Admin/Trainer dapat export data ke PDF
- [x] AC-11 — Export mengikuti filter yang sedang aktif
- [x] AC-12 — Pagination untuk data yang banyak

## Definition of Done
- [ ] Code merged ke `main` + reviewed
- [x] Unit test untuk filter dan export logic
- [x] Manual QA pass: filter data → export Excel → export PDF
- [x] Dokumentasi: panduan menggunakan fitur reporting
- [x] Tidak ada regresi T01-T08

## Catatan Teknis
- **Backend:** 
  - API Routes `/api/reports/training`, `/api/reports/training/export`
  - Query dengan multiple joins (users, trainings, modules, assessments, attempts)
  - Stream response untuk large export
- **Database:** 
  - View atau materialized view untuk reporting (opsional, untuk performance)
- **Frontend:** 
  - Halaman `/trainer/nilai` (redirect dari `/trainer/reports`)
  - DataTable dengan filter controls
  - Export buttons
- **Export Libraries:**
  - Excel: `xlsx`
  - PDF: `jspdf` + `jspdf-autotable`
- **UI Components:** 
  - DataTable dengan sorting
  - Filter form (Select, DateRangePicker, SearchInput)
  - Export dropdown

## Implementasi (selesai)

| Area | File / path |
|------|-------------|
| Domain | `lib/domain/reports/types.ts`, `errors.ts`, `build-export-rows.ts`, `export-excel.ts`, `export-pdf.ts`, `format-labels.ts` |
| Repository | `lib/infrastructure/db/repositories/report-repository.ts` |
| Application | `lib/application/reports/*` |
| API | `app/api/reports/training/route.ts`, `app/api/reports/training/export/route.ts` |
| UI | `components/reports/*`, `app/(dashboard)/trainer/nilai/page.tsx` |
| Tests | `tests/domain/reports/*`, `tests/application/reports/list-training-report.test.ts` |
| Docs | `docs/reporting.md` |
| QA | `scripts/qa-t09-reporting.ts` (`bun run qa:t09`) |
