# Quiz & Latihan

Panduan mengelola quiz dan latihan per modul training.

## Ringkasan

- Setiap modul dapat memiliki **satu quiz** dan **satu latihan**
- Format soal: pilihan ganda (5 opsi, 1 jawaban benar)
- Student dapat retry unlimited sampai mencapai passing grade
- Nilai tertinggi dari semua attempt yang disimpan
- Setelah passing, retry diblokir (AC-13)

## Passing Grade

Urutan prioritas:

1. `assessments.passing_grade` (jika di-set)
2. `modules.min_quiz_score` / `modules.min_latihan_score`
3. `trainings.passing_grade` (default 70%)

## Trainer

### Akses

- Hub: `/trainer/quiz`, `/trainer/latihan`
- Per modul: `/trainer/trainings/[id]/modules/[moduleId]/quiz` atau `/latihan`
- Dari panel kelola modul: tombol **Kelola Quiz** / **Kelola Latihan**

### Fitur

- Tambah, edit, hapus soal pilihan ganda
- Impor soal dari Excel (tombol **Export Excel** untuk template, **Impor Excel** untuk upload)
- Lihat jumlah soal dan passing grade modul

### Template Excel

Unduh template via tombol **Export Excel** di halaman kelola soal, atau langsung dari `/api/import/templates/questions`

Kolom wajib:

| Kolom | Keterangan |
|-------|------------|
| Pertanyaan | Teks pertanyaan |
| Pilihan A | Opsi A |
| Pilihan B | Opsi B |
| Pilihan C | Opsi C |
| Pilihan D | Opsi D |
| Pilihan E | Opsi E |
| Jawaban Benar | A, B, C, D, atau E |

Urutan soal diatur otomatis oleh sistem; tidak perlu kolom nomor.

## Student

### Akses

- Hub: `/student/quiz`, `/student/latihan`
- Per modul: `/student/trainings/[id]/modules/[moduleId]/quiz` atau `/latihan`
- Dari halaman modul: tombol **Kerjakan Quiz** / **Kerjakan Latihan**

### Alur Attempt

1. Klik **Mulai Quiz/Latihan**
2. Pilih jawaban — auto-save saat memilih opsi
3. Klik **Submit Jawaban**
4. Lihat hasil (score, lulus/belum lulus, nilai tertinggi)
5. Review jawaban salah
6. Retry jika belum passing

## API

| Endpoint | Method | Deskripsi |
|----------|--------|-----------|
| `/api/modules/[id]/assessments?type=quiz\|latihan` | GET | Ambil/buat assessment modul |
| `/api/assessments/[id]/questions` | GET, POST | List/tambah soal |
| `/api/assessments/[id]/questions/[questionId]` | PATCH, DELETE | Edit/hapus soal |
| `/api/assessments/[id]/import` | POST | Impor Excel (FormData `file`) |
| `/api/assessments/[id]/attempt` | POST | Mulai attempt |
| `/api/attempts/[id]` | PATCH | Auto-save jawaban |
| `/api/attempts/[id]/submit` | POST | Submit & scoring |

## Arsitektur

```
lib/domain/assessments/       → scoring, retry, excel parse
lib/application/assessments/  → use cases
lib/infrastructure/.../assessment-repository.ts
app/actions/assessments.ts    → server actions (trainer CRUD)
components/assessments/       → UI reusable
```

## Tests

```bash
npm test -- tests/domain/assessments
```
