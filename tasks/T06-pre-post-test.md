---
id: T06
title: Pre-Test & Post-Test (Assessment Gateway)
prd_ref: §3.6
target_week: W3-W4
priority: P0
estimate: L
status: Pending
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
- [ ] AC-1 — Trainer dapat membuat pre-test untuk training
- [ ] AC-2 — Trainer dapat membuat post-test untuk training
- [ ] AC-3 — Trainer dapat menambah/edit/hapus soal pre-test dan post-test
- [ ] AC-4 — Pre-test tidak aktif sampai Trainer mengaktifkannya
- [ ] AC-5 — Sistem mencegah aktivasi pre-test jika modul belum lengkap
- [ ] AC-6 — Student harus mengerjakan pre-test sebelum mengakses modul pertama
- [ ] AC-7 — Pre-test hanya bisa dikerjakan sekali (tidak ada retry)
- [ ] AC-8 — Student harus menyelesaikan semua modul sebelum mengakses post-test
- [ ] AC-9 — Post-test bisa retry unlimited jika belum mencapai passing grade
- [ ] AC-10 — Nilai tertinggi post-test yang diambil
- [ ] AC-11 — Student yang lulus post-test dapat akses sertifikat
- [ ] AC-12 — Tampilkan hasil pre-test dan post-test di dashboard student

## Definition of Done
- [ ] Code merged ke `main` + reviewed
- [ ] Unit test untuk gate logic (pre-test → modules → post-test)
- [ ] Manual QA pass: aktivasi pre-test → attempt → complete modules → post-test → retry
- [ ] Dokumentasi: alur pre-test dan post-test
- [ ] Tidak ada regresi T01-T05

## Catatan Teknis
- **Backend:** 
  - API Routes menggunakan struktur assessment yang sama dengan T05
  - Assessment type: `pre_test` dan `post_test` (module_id = null)
  - Gate logic di middleware atau API
- **Database:** 
  - Tabel `assessments` dengan type pre_test/post_test
  - Kolom `max_retry` (1 untuk pre-test, null untuk post-test)
  - Tabel `trainings` kolom `is_pretest_active`
- **Frontend:** 
  - Student: `/trainings/[id]/pre-test`, `/trainings/[id]/post-test`
  - Trainer: `/dashboard/trainings/[id]/pre-test`, `/dashboard/trainings/[id]/post-test`
- **Gate Logic:** 
  - Pre-test required sebelum akses modul
  - All modules completed sebelum akses post-test
  - Post-test passed sebelum akses certificate
