# Training Management (Admin / Trainer / Student)

Dokumentasi manajemen training E-Training Enprotech (T03).

## Ringkasan

Admin dan Trainer mengelola program training:

- Membuat training baru (judul, deskripsi, thumbnail URL, passing grade, deadline)
- Melihat daftar training dengan filter & pagination
- Mengedit detail training
- Mempublikasikan training (`draft` → `active`)
- Mengarsipkan training (soft delete → `archived`)
- Enroll / remove student
- Mengaktifkan pre-test (setelah semua modul memiliki materi)

Student melihat training yang sudah di-enroll beserta progress modul.

Training `draft` dan `archived` tidak muncul di halaman student.

## Halaman

| Role | URL | Keterangan |
|------|-----|------------|
| Admin / Trainer | `/trainer/trainings` | Daftar training |
| Admin / Trainer | `/trainer/trainings/new` | Buat training baru |
| Admin / Trainer | `/trainer/trainings/[id]/edit` | Edit, enrollment, pengaturan |
| Student | `/student/trainings` | Training enrolled + progress |

Nav (sidebar) mengikuti alur E-Training PRD:

| Role | Grup Administrasi | Grup Alur E-Training |
|------|-------------------|----------------------|
| Admin | Dashboard, Pengguna, Training | Pre Test, Modul, Video Conference, Quiz, Latihan, Post Test, Nilai, Sertifikat |
| Trainer | Dashboard, Training | (sama) |
| Student | — | (sama, tanpa administrasi) |

Konfigurasi: `lib/navigation/dashboard-nav.ts`. Item belum diimplementasi ditandai badge **Segera**.

Student: `/student/trainings` redirect ke `/student/modules`.

## Status Training

| Status | Terlihat Student | Keterangan |
|--------|------------------|------------|
| `draft` | Tidak | Baru dibuat, belum dipublikasikan |
| `active` | Ya (jika enrolled) | Training berjalan |
| `completed` | Ya (jika enrolled) | Periode training selesai |
| `archived` | Tidak | Soft delete |

Transisi utama:

- Publish: `draft` → `active`
- Complete: `active` → `completed`
- Archive: `draft|active|completed` → `archived`
- Restore: `archived` → `active`

## Alur Trainer

1. Buka `/trainer/trainings` → **Buat Training**
2. Isi judul, deskripsi, passing grade (0–100), deadline opsional, URL thumbnail opsional
3. Training dibuat dengan status `draft`, redirect ke halaman edit
4. Tab **Detail** → simpan perubahan
5. Tab **Pengaturan** → **Publikasikan** (`draft` → `active`)
6. Tab **Enrollment** → pilih student aktif → **Enroll Terpilih**
7. Setelah modul & materi siap (T04) → **Aktifkan Pre-test**

## Alur Student

1. Trainer enroll student ke training `active`
2. Student login → `/student/trainings`
3. Lihat card training dengan progress bar (% modul selesai)
4. Training `draft` / `archived` tidak ditampilkan

## Pre-test Activation (AC-9)

Syarat aktivasi:

1. Training status = `active`
2. Pre-test belum aktif
3. Ada minimal 1 modul
4. Setiap modul punya minimal 1 `module_content`

Pre-test diaktifkan lewat tab **Pengaturan**, bukan lewat form edit umum.

## API

Semua endpoint membutuhkan session cookie. Authorization di application layer.

### `GET /api/trainings`

Query: `search`, `status`, `page`, `pageSize`  
Role: Admin / Trainer

### `POST /api/trainings`

Body: `title`, `description?`, `thumbnail?`, `passingGrade?`, `deadline?`

### `GET /api/trainings/[id]`

Detail training + enrollments. Role: Admin / Trainer

### `PATCH /api/trainings/[id]`

Update field training (termasuk `status` dengan validasi transisi).

### `DELETE /api/trainings/[id]`

Archive training (soft delete).

### `POST /api/trainings/[id]/enroll`

```json
{ "studentIds": ["uuid-student-1", "uuid-student-2"] }
```

Hanya student `active`. Student yang sudah enrolled di-skip; jika semua sudah enrolled → error `ALREADY_ENROLLED`.

### `DELETE /api/trainings/[id]/enroll`

```json
{ "enrollmentId": "uuid-enrollment" }
```

### `GET /api/trainings/enrolled`

Daftar training enrolled untuk student + `progressPercent`.

## Server Actions

File: `app/actions/trainings.ts`

| Action | Fungsi |
|--------|--------|
| `createTrainingFormAction` | Buat training + redirect edit |
| `updateTrainingAction` | Simpan detail |
| `publishTrainingAction` | Publish draft |
| `archiveTrainingAction` | Arsipkan |
| `enrollStudentsAction` | Enroll multiple student |
| `removeEnrollmentAction` | Hapus enrollment |
| `activatePretestAction` | Aktifkan pre-test |

## Arsitektur

```
Presentation  → app/actions/trainings.ts, app/api/trainings/*, app/(dashboard)/trainer|student/trainings
Application   → lib/application/trainings (CRUD, enroll, pretest, list-enrolled)
Domain        → lib/domain/trainings (errors, status-transitions, compute-progress)
Infrastructure → training-repository.ts, user-repository listActiveStudents
UI            → components/trainings/, components/trainer/, components/student/
```

## Database

- `trainings`: `id`, `title`, `description`, `thumbnail`, `passing_grade`, `deadline`, `status`, `is_pretest_active`, `created_by`
- `enrollments`: `id`, `student_id`, `training_id`, `status`, `enrolled_at` (unique: `student_id` + `training_id`)

## Manual QA Checklist

Jalankan otomatis: `npm run qa:t03` (butuh dev server untuk smoke HTTP).

1. Login trainer → buat training draft di `/trainer/trainings/new`
2. Edit judul, passing grade 0–100, deadline opsional
3. Publikasikan training → status `active`
4. Enroll 1 student, lalu multiple students sekaligus
5. Coba enroll ulang student yang sama → error / tidak duplikat
6. Remove student dari enrollment
7. Archive training → hilang dari student view
8. Login student → `/student/trainings` hanya tampil training enrolled non-draft
9. Progress bar tampil (0% jika belum ada modul)
10. Aktifkan pre-test tanpa modul → error `MODULES_NOT_READY`
11. Student akses `/trainer/trainings` → unauthorized
12. Regresi: login, user management (T01/T02) masih berfungsi

## Catatan

- Thumbnail saat ini via **URL input**; upload Vercel Blob direncanakan di T04
- Progress detail (quiz, pre/post-test) akan diperkaya di T07
- Modul & materi dikelola di T04
