---
id: T07
title: Progress Tracking & Dashboard
prd_ref: §3.7
target_week: W4
priority: P1
estimate: M
status: Review
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
- [x] AC-1 — Student dapat melihat dashboard dengan ringkasan progress
- [x] AC-2 — Dashboard menampilkan jumlah modul selesai dari total modul
- [x] AC-3 — Dashboard menampilkan jumlah quiz selesai dari total quiz
- [x] AC-4 — Dashboard menampilkan jumlah latihan selesai dari total latihan
- [x] AC-5 — Dashboard menampilkan status pre-test dan post-test
- [x] AC-6 — Dashboard menampilkan progress bar persentase keseluruhan
- [x] AC-7 — Setiap modul menampilkan status (not started, in progress, completed)
- [x] AC-8 — Student dapat melihat nilai tertinggi per assessment
- [x] AC-9 — Progress update real-time setelah menyelesaikan assessment
- [x] AC-10 — Tampilkan deadline training jika ada
- [x] AC-11 — Visual indicator untuk modul/assessment yang belum dikerjakan

## Definition of Done
- [ ] Code merged ke `main` + reviewed
- [x] Unit test untuk kalkulasi progress percentage
- [x] Manual QA pass: complete activities → verify dashboard update
- [x] Dokumentasi: penjelasan kalkulasi progress
- [x] Tidak ada regresi T01-T06

## Catatan Teknis
- **Backend:** 
  - API Routes `GET /api/student/trainings/[id]/progress`
  - Aggregate data dari `module_progress`, `assessment_attempts`
  - Use cases: `get-student-training-progress`, `enrich-enrolled-trainings`
- **Database:** 
  - Tabel `module_progress` (student_id, module_id, status, completed_at)
  - Query aggregate untuk progress calculation via `progress-repository`
- **Frontend:** 
  - Student dashboard: `/student/dashboard`
  - Progress per training: `/student/trainings/[id]`
  - Ringkasan di daftar training: `/student/modules`
  - Components: `TrainingProgressOverview`, `ProgressStatCard`, `TrainingProgressModules`, `AssessmentProgressBadge`
- **Progress Calculation:**
  ```
  Total items = pre_test(1) + modules(n) + quizzes(n) + latihans(n) + post_test(1)
              = 2 + 3n
  Completed items = pre-test submit + modul completed + quiz/latihan/post-test passed
  Progress % = round((completed / total) * 100), capped 0–100
  ```
- **UI Components:** 
  - Progress bar (shadcn `Progress`)
  - Status badges (`ModuleProgressBadge`, `AssessmentProgressBadge`)
  - Stat cards dengan icon (`ProgressStatCard`)

## Implementasi (selesai)

| Area | File / path |
|------|-------------|
| Domain | `lib/domain/trainings/compute-progress.ts`, `progress-types.ts`, `map-student-progress.ts`, `progress-raw-data.ts` |
| Repository | `lib/infrastructure/db/repositories/progress-repository.ts` |
| Application | `lib/application/progress/get-student-training-progress.ts`, `enrich-enrolled-trainings.ts` |
| API | `app/api/student/trainings/[id]/progress/route.ts` |
| UI | `components/progress/*`, update `student-training-card`, `student-module-card` |
| Pages | `app/(dashboard)/student/dashboard/page.tsx`, `student/trainings/[id]/page.tsx` |
| Tests | `tests/domain/trainings/compute-progress.test.ts` |
| Docs | `docs/progress-tracking.md` |
| QA | `scripts/qa-t07-progress.ts` (`bun run qa:t07`) |
