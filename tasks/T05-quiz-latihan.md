---
id: T05
title: Quiz & Latihan (CRUD Soal, Attempt, Scoring)
prd_ref: §3.5
target_week: W3
priority: P0
estimate: XL
status: Pending
dependencies: [T04]
---

# T05 — Quiz & Latihan

## Konteks
Setiap Modul memiliki Quiz (dikerjakan dalam sesi) dan Latihan (dikerjakan akhir sesi). Format soal adalah pilihan ganda. Student dapat retry unlimited jika belum mencapai passing grade, dan nilai tertinggi yang diambil.

## User Story
> Sebagai Trainer, saya ingin dapat membuat quiz dan latihan dengan soal pilihan ganda, agar dapat mengevaluasi pemahaman student terhadap materi modul.

> Sebagai Student, saya ingin dapat mengerjakan quiz dan latihan dengan kesempatan retry, agar saya dapat mencapai nilai terbaik.

## Scope
- **In scope:** 
  - CRUD soal pilihan ganda (untuk quiz dan latihan)
  - Import soal dari Excel
  - Mengerjakan quiz/latihan (attempt)
  - Auto-save jawaban
  - Unlimited retry jika belum passing
  - Nilai tertinggi yang diambil
  - Tampilkan hasil setelah submit
  - Review jawaban yang salah
  
- **Out of scope:** 
  - Soal essay
  - Soal dengan gambar
  - Time limit per soal
  - Randomize urutan soal/opsi

## Acceptance Criteria
- [ ] AC-1 — Trainer dapat membuat quiz untuk setiap modul
- [ ] AC-2 — Trainer dapat membuat latihan untuk setiap modul
- [ ] AC-3 — Trainer dapat menambah soal pilihan ganda (pertanyaan + 4 opsi + jawaban benar)
- [ ] AC-4 — Trainer dapat edit dan hapus soal
- [ ] AC-5 — Trainer dapat import soal dari Excel (template tersedia)
- [ ] AC-6 — Student dapat mengerjakan quiz/latihan
- [ ] AC-7 — Jawaban auto-save saat student memilih opsi
- [ ] AC-8 — Student dapat submit dan melihat hasil (score, passing/not passing)
- [ ] AC-9 — Student dapat retry jika belum mencapai passing grade
- [ ] AC-10 — Sistem menyimpan nilai tertinggi dari semua attempt
- [ ] AC-11 — Student dapat melihat review jawaban yang salah setelah submit
- [ ] AC-12 — Tampilkan riwayat attempt dengan score masing-masing
- [ ] AC-13 — Quiz/latihan yang sudah passing tidak bisa di-retry lagi (opsional)

## Definition of Done
- [ ] Code merged ke `main` + reviewed
- [ ] Unit test untuk scoring logic dan best score calculation
- [ ] Manual QA pass: create soal → import → attempt → retry → review
- [ ] Dokumentasi: panduan membuat quiz/latihan dan template Excel
- [ ] Tidak ada regresi T01-T04

## Catatan Teknis
- **Backend:** 
  - API Routes `/api/modules/[id]/assessments`, `/api/assessments/[id]/questions`
  - API untuk attempt: `/api/assessments/[id]/attempt`, `/api/attempts/[id]/submit`
- **Database:** 
  - Tabel `assessments` (id, module_id, type: quiz|latihan, title)
  - Tabel `questions` (id, assessment_id, question_text, options: JSON, order)
  - Tabel `assessment_attempts` (id, student_id, assessment_id, score, answers: JSON, submitted_at)
- **Frontend:** 
  - Trainer: `/dashboard/trainings/[id]/modules/[moduleId]/quiz`, `/dashboard/trainings/[id]/modules/[moduleId]/latihan`
  - Student: `/trainings/[id]/modules/[moduleId]/quiz`, `/trainings/[id]/modules/[moduleId]/latihan`
- **Excel Import:** 
  - Library: xlsx atau exceljs
  - Template: Kolom (no, question, option_a, option_b, option_c, option_d, correct_answer)
- **UI Components:** 
  - Radio group untuk pilihan ganda
  - Progress indicator
  - Result card dengan score
