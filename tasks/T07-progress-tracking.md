---
id: T07
title: Progress Tracking & Dashboard
prd_ref: §3.7
target_week: W4
priority: P1
estimate: M
status: Pending
dependencies: [T04, T05, T06]
---

# T07 — Progress Tracking & Dashboard

## Konteks
Student perlu melihat progress pembelajaran mereka secara real-time. Dashboard menampilkan modul yang sudah diselesaikan, quiz/latihan yang sudah dikerjakan, nilai, dan progress bar keseluruhan training.

## User Story
> Sebagai Student, saya ingin melihat progress pembelajaran saya di dashboard, agar saya tahu sejauh mana pencapaian saya dalam training.

## Scope
- **In scope:** 
  - Dashboard progress per student per training
  - Tracking modul yang sudah diselesaikan
  - Tracking quiz dan latihan yang sudah dikerjakan
  - Tracking nilai per assessment
  - Progress bar keseluruhan training (%)
  - Status per modul (not started, in progress, completed)
  
- **Out of scope:** 
  - Learning analytics
  - Time spent tracking
  - Comparison dengan student lain

## Acceptance Criteria
- [ ] AC-1 — Student dapat melihat dashboard dengan ringkasan progress
- [ ] AC-2 — Dashboard menampilkan jumlah modul selesai dari total modul
- [ ] AC-3 — Dashboard menampilkan jumlah quiz selesai dari total quiz
- [ ] AC-4 — Dashboard menampilkan jumlah latihan selesai dari total latihan
- [ ] AC-5 — Dashboard menampilkan status pre-test dan post-test
- [ ] AC-6 — Dashboard menampilkan progress bar persentase keseluruhan
- [ ] AC-7 — Setiap modul menampilkan status (not started, in progress, completed)
- [ ] AC-8 — Student dapat melihat nilai tertinggi per assessment
- [ ] AC-9 — Progress update real-time setelah menyelesaikan assessment
- [ ] AC-10 — Tampilkan deadline training jika ada
- [ ] AC-11 — Visual indicator untuk modul/assessment yang belum dikerjakan

## Definition of Done
- [ ] Code merged ke `main` + reviewed
- [ ] Unit test untuk kalkulasi progress percentage
- [ ] Manual QA pass: complete activities → verify dashboard update
- [ ] Dokumentasi: penjelasan kalkulasi progress
- [ ] Tidak ada regresi T01-T06

## Catatan Teknis
- **Backend:** 
  - API Routes `/api/trainings/[id]/progress`
  - Aggregate data dari module_progress, assessment_attempts
- **Database:** 
  - Tabel `module_progress` (student_id, module_id, status, completed_at)
  - Query aggregate untuk progress calculation
- **Frontend:** 
  - Student dashboard: `/trainings/[id]` atau `/dashboard`
  - Components: ProgressBar, StatCard, ModuleList with status
- **Progress Calculation:**
  ```
  Total items = pre_test(1) + modules(n) + quizzes(n) + latihans(n) + post_test(1)
  Completed items = count of passed items
  Progress % = (completed / total) * 100
  ```
- **UI Components:** 
  - Progress bar (shadcn)
  - Status badges
  - Stat cards dengan icon
