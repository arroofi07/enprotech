---
id: T06
title: Pre-Test & Post-Test (Assessment Gateway)
prd_ref: §3.6
target_week: W3-W4
priority: P0
estimate: L
status: Review
dependencies: [T05]
---

# T06 — Pre-Test & Post-Test

## Konteks
Pre-Test adalah assessment awal sebelum memulai modul pertama (hanya sekali, tidak bisa retry). Post-Test adalah assessment akhir setelah menyelesaikan semua modul (unlimited retry). Pre-Test baru aktif setelah semua materi di-upload oleh Trainer.

## User Story
> Sebagai Trainer, saya ingin dapat membuat pre-test dan post-test untuk mengukur pengetahuan student sebelum dan sesudah training.

> Sebagai Student, saya ingin mengerjakan pre-test untuk memulai training dan post-test untuk mendapatkan sertifikat.

## Scope
- **In scope:** 
  - CRUD soal pre-test (pilihan ganda)
  - CRUD soal post-test (pilihan ganda)
  - Pre-test: sekali attempt, tidak bisa retry
  - Post-test: unlimited retry jika belum passing
  - Aktivasi pre-test oleh Trainer (setelah semua materi ready)
  - Gate: Student harus lulus post-test untuk dapat sertifikat
  
- **Out of scope:** 
  - Adaptive testing
  - Pre-test mempengaruhi jalur belajar
  - Time limit per test

## Acceptance Criteria
- [x] AC-1 — Trainer dapat membuat pre-test untuk training
- [x] AC-2 — Trainer dapat membuat post-test untuk training
- [x] AC-3 — Trainer dapat menambah/edit/hapus soal pre-test dan post-test
- [x] AC-4 — Pre-test tidak aktif sampai Trainer mengaktifkannya
- [x] AC-5 — Sistem mencegah aktivasi pre-test jika modul belum lengkap
- [x] AC-6 — Student harus mengerjakan pre-test sebelum mengakses modul pertama
- [x] AC-7 — Pre-test hanya bisa dikerjakan sekali (tidak ada retry)
- [x] AC-8 — Student harus menyelesaikan semua modul sebelum mengakses post-test
- [x] AC-9 — Post-test bisa retry unlimited jika belum mencapai passing grade
- [x] AC-10 — Nilai tertinggi post-test yang diambil
- [x] AC-11 — Student yang lulus post-test dapat akses sertifikat
- [x] AC-12 — Tampilkan hasil pre-test dan post-test di dashboard student

## Definition of Done
- [ ] Code merged ke `main` + reviewed
- [x] Unit test untuk gate logic (pre-test → modules → post-test)
- [ ] Manual QA pass: aktivasi pre-test → attempt → complete modules → post-test → retry
- [x] Dokumentasi: alur pre-test dan post-test
- [x] Tidak ada regresi T01-T05

## Catatan Teknis
- **Backend:** 
  - API Routes menggunakan struktur assessment yang sama dengan T05
  - Assessment type: `pre_test` dan `post_test` (module_id = null)
  - Gate logic di application layer (`lib/domain/training-flow/gates.ts`)
- **Database:** 
  - Tabel `assessments` dengan type pre_test/post_test
  - Kolom `max_retry` (1 untuk pre-test, null untuk post-test)
  - Tabel `trainings` kolom `is_pretest_active`
- **Frontend:** 
  - Student: `/student/trainings/[id]/pre-test`, `/student/trainings/[id]/post-test`
  - Trainer: `/trainer/trainings/[id]/pre-test`, `/trainer/trainings/[id]/post-test`
  - Hub: `/student/pre-test`, `/student/post-test`, `/trainer/pre-test`, `/trainer/post-test`
- **Gate Logic:** 
  - Pre-test required sebelum akses modul
  - All modules completed sebelum akses post-test
  - Post-test passed sebelum akses certificate
- **Dokumentasi:** `docs/pre-post-test.md`
