# Progress Tracking

Panduan perhitungan dan tampilan progress pembelajaran student per training.

## Ringkasan

Student dapat melihat progress di:

- Dashboard: `/student/dashboard`
- Halaman training: `/student/trainings/[id]`
- Daftar modul: `/student/modules`

## Formula Progress

```
Total items = 1 (pre-test) + n modul + n quiz + n latihan + 1 (post-test)
            = 2 + 3n

Completed items = jumlah item yang memenuhi syarat selesai
Progress % = round((completed / total) * 100), dibatasi 0–100
```

## Syarat Item Selesai

| Item | Dianggap selesai jika |
|------|------------------------|
| Pre-test | Sudah submit (tidak wajib lulus) |
| Modul | `module_progress.status = completed` |
| Quiz | Nilai tertinggi ≥ passing grade |
| Latihan | Nilai tertinggi ≥ passing grade |
| Post-test | Nilai tertinggi ≥ passing grade |

Pre-test dianggap **terkunci** jika trainer belum mengaktifkan pre-test.
Post-test dianggap **terkunci** sampai semua modul selesai.

## Passing Grade

Mengikuti aturan T05/T06:

1. `assessments.passing_grade` (jika di-set)
2. `modules.min_quiz_score` / `modules.min_latihan_score` (quiz/latihan)
3. `trainings.passing_grade` (default 70%)

## API

| Endpoint | Method | Deskripsi |
|----------|--------|-----------|
| `/api/student/trainings/[id]/progress` | GET | Progress lengkap student untuk satu training |

Response mencakup ringkasan statistik, status pre/post-test, dan detail per modul (termasuk nilai tertinggi quiz/latihan).

## Arsitektur

```
lib/domain/trainings/compute-progress.ts   → kalkulasi persentase (pure)
lib/domain/trainings/map-student-progress.ts → mapping raw data → progress view
lib/infrastructure/.../progress-repository.ts → aggregate query DB
lib/application/progress/                    → use cases
components/progress/                         → UI reusable
```

## Tests

```bash
npm test -- tests/domain/trainings/compute-progress.test.ts
```
