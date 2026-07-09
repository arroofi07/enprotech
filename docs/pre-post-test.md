# Pre-Test & Post-Test

Panduan pre-test dan post-test per training.

## Ringkasan

- **Pre-Test**: assessment awal sebelum modul, **1 attempt**, wajib selesai (submit)
- **Post-Test**: assessment akhir setelah semua modul selesai, **unlimited retry** jika belum lulus
- Nilai tertinggi post-test yang disimpan
- Pre-test diaktifkan trainer setelah semua modul punya materi dan minimal 1 soal

## Alur Student

```
Pre-Test (1x) → Modul 1..N → Post-Test (retry) → Sertifikat (T10)
```

| Gate | Syarat |
|------|--------|
| Akses modul | Pre-test aktif + sudah submit pre-test |
| Akses post-test | Semua modul status `completed` |
| Akses sertifikat | Lulus post-test (≥ passing grade) |

## Passing Grade

Urutan prioritas untuk pre/post-test:

1. `assessments.passing_grade` (jika di-set)
2. `trainings.passing_grade` (default 70%)

## Trainer

### Akses

- Hub: `/trainer/pre-test`, `/trainer/post-test`
- Per training: `/trainer/trainings/[id]/pre-test`, `/post-test`
- Dari halaman edit training: **Kelola Pre-Test** / **Kelola Post-Test**

### Aktivasi Pre-Test

1. Upload materi ke semua modul
2. Tambahkan soal pre-test (manual atau import Excel)
3. Klik **Aktifkan Pre-test** di halaman edit training

### Fitur

- CRUD soal pilihan ganda (reuse komponen quiz/latihan)
- Import Excel (template sama dengan quiz/latihan)

## Student

### Akses

- Hub: `/student/pre-test`, `/student/post-test`
- Per training: `/student/trainings/[id]/pre-test`, `/post-test`

### Pre-Test

- Hanya tersedia setelah trainer mengaktifkan
- Satu attempt — tidak bisa retry setelah submit
- Tidak harus lulus untuk lanjut ke modul (cukup selesai)

### Post-Test

- Terbuka setelah semua modul diselesaikan
- Retry unlimited jika belum lulus
- Nilai tertinggi dari semua attempt

## API

| Endpoint | Method | Deskripsi |
|----------|--------|-----------|
| `/api/trainings/[id]/assessments?type=pre_test\|post_test` | GET | Ambil/buat assessment training |
| `/api/assessments/[id]/questions` | GET, POST | List/tambah soal |
| `/api/assessments/[id]/import` | POST | Impor Excel |
| `/api/assessments/[id]/attempt` | POST | Mulai attempt |
| `/api/attempts/[id]/submit` | POST | Submit & scoring |

## Arsitektur

```
lib/domain/training-flow/gates.ts     → gate logic (pure)
lib/application/training-flow/        → pretest gate state
lib/application/assessments/          → training assessment use cases
components/assessments/               → UI reusable (shared dengan T05)
```

## Tests

```bash
npm test -- tests/domain/training-flow
npm test -- tests/domain/assessments
```
