# Excel Import (T11)

Panduan import data Excel untuk trainer/admin.

## Jenis import

| Jenis | Template | Endpoint |
|-------|----------|----------|
| Soal quiz/latihan | `/api/import/templates/questions` | `/api/import/questions` |
| Enrollment | `/api/import/templates/enrollments` | `/api/import/enrollments` |
| Nilai | `/api/import/templates/scores` | `/api/import/scores` |

Halaman UI: `/trainer/import`

## Alur import

1. **Upload** — unduh template, isi data, upload file
2. **Preview** — sistem validasi per baris, tampilkan valid/error
3. **Confirm** — import hanya baris valid
4. **Result** — summary success/failed + unduh error report

Gunakan query `?mode=preview` atau `?mode=commit` pada endpoint import.

## Template kolom

### Soal (`questions`)

| Kolom | Wajib | Keterangan |
|-------|-------|------------|
| Pertanyaan | Ya | Teks pertanyaan |
| Pilihan A | Ya | Opsi jawaban |
| Pilihan B | Ya | Opsi jawaban |
| Pilihan C | Ya | Opsi jawaban |
| Pilihan D | Ya | Opsi jawaban |
| Pilihan E | Ya | Opsi jawaban |
| Jawaban Benar | Ya | A, B, C, D, atau E |

Urutan soal diatur otomatis oleh sistem; tidak perlu kolom nomor.

Import soal memerlukan `assessmentId` (dipilih via training + modul + jenis assessment di UI).

### Enrollment (`enrollments`)

| Kolom | Wajib |
|-------|-------|
| student_email | Ya |
| training_id | Ya (UUID) |

### Nilai (`scores`)

| Kolom | Wajib | Keterangan |
|-------|-------|------------|
| student_email | Ya | |
| training_id | Ya | UUID |
| module_name | Kondisional | Wajib untuk quiz/latihan |
| assessment_type | Ya | quiz, latihan, pre_test, post_test |
| score | Ya | 0-100 |

## Error report

Setelah preview, unduh baris gagal via `POST /api/import/error-report` dengan body `{ preview }`.

## QA

```bash
bun run qa:t11
```
