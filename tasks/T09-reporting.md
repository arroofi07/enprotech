---
id: T09
title: Reporting & Rekap Hasil Training
prd_ref: §3.9
target_week: W5
priority: P1
estimate: L
status: Pending
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
- [ ] AC-1 — Admin/Trainer dapat akses halaman rekap hasil training
- [ ] AC-2 — Halaman menampilkan tabel dengan: nama student, training, modul, quiz score, latihan score, status
- [ ] AC-3 — Admin/Trainer dapat filter berdasarkan student (dropdown/search)
- [ ] AC-4 — Admin/Trainer dapat filter berdasarkan training
- [ ] AC-5 — Admin/Trainer dapat filter berdasarkan modul
- [ ] AC-6 — Admin/Trainer dapat filter berdasarkan range tanggal
- [ ] AC-7 — Admin/Trainer dapat melihat detail rekap per student
- [ ] AC-8 — Detail rekap menampilkan semua attempt dan nilai per assessment
- [ ] AC-9 — Admin/Trainer dapat export data ke Excel (.xlsx)
- [ ] AC-10 — Admin/Trainer dapat export data ke PDF
- [ ] AC-11 — Export mengikuti filter yang sedang aktif
- [ ] AC-12 — Pagination untuk data yang banyak

## Definition of Done
- [ ] Code merged ke `main` + reviewed
- [ ] Unit test untuk filter dan export logic
- [ ] Manual QA pass: filter data → export Excel → export PDF
- [ ] Dokumentasi: panduan menggunakan fitur reporting
- [ ] Tidak ada regresi T01-T08

## Catatan Teknis
- **Backend:** 
  - API Routes `/api/reports/training`, `/api/reports/training/export`
  - Query dengan multiple joins (users, trainings, modules, assessments, attempts)
  - Stream response untuk large export
- **Database:** 
  - View atau materialized view untuk reporting (opsional, untuk performance)
- **Frontend:** 
  - Halaman `/dashboard/reports`
  - DataTable dengan filter controls
  - Export buttons
- **Export Libraries:**
  - Excel: xlsx atau exceljs
  - PDF: @react-pdf/renderer atau jspdf
- **UI Components:** 
  - DataTable dengan sorting
  - Filter form (Select, DateRangePicker, SearchInput)
  - Export dropdown
