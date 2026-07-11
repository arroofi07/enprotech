# Module Management (Trainer / Student)

Dokumentasi manajemen modul pembelajaran E-Training Enprotech (T04).

## Ringkasan

Setiap training terdiri dari modul-modul berurutan. Trainer mengelola modul beserta kontennya; student mengakses materi dan melacak progress.

Fitur utama:

- CRUD modul dalam training
- Upload thumbnail modul (gambar, max 2MB)
- Upload dokumen materi (PDF/DOC/DOCX/XLS/XLSX, max 1MB)
- Tambah multiple link video (YouTube, Vimeo, dll)
- Tambah multiple link download (Google Drive, OneDrive, dll)
- Link video conference per modul (Google Meet/Zoom)
- Drag & drop urutan modul
- Student: lihat konten, download dokumen, buka link di tab baru
- Status completion per modul untuk student

## Halaman

| Role | URL | Keterangan |
|------|-----|------------|
| Trainer | `/trainer/trainings/[id]/modules` | Kelola modul & konten |
| Student | `/student/trainings/[id]` | Daftar modul training |
| Student | `/student/trainings/[id]/modules/[moduleId]` | Detail modul & materi |

Akses modul dari halaman edit training lewat tombol **Kelola Modul**.

## Format File

| Tipe | Format | Batas Ukuran |
|------|--------|--------------|
| Thumbnail | JPEG, PNG, WebP, GIF | 2 MB |
| Dokumen | PDF, DOC, DOCX, XLS, XLSX | 1 MB |

File disimpan di **Supabase Storage**. Set variabel Supabase di environment.

## Jenis Konten (`module_contents`)

| Type | Keterangan |
|------|------------|
| `document` | File upload (download langsung) |
| `video_link` | Link video eksternal (buka tab baru) |
| `download_link` | Link download eksternal (buka tab baru) |

Video conference disimpan di kolom `video_conference_link` pada tabel `modules`.

## Alur Trainer

1. Buka training → **Kelola Modul**
2. **Buat Modul Baru** (judul, deskripsi, link Meet/Zoom opsional)
3. Pada tiap modul:
   - Upload thumbnail
   - Tambah dokumen via drag & drop
   - Tambah link video / download
4. Atur urutan modul dengan drag & drop → **Simpan Urutan Modul**
5. Setelah semua modul punya konten → aktifkan pre-test (T03)

## Alur Student

1. Buka `/student/trainings` → klik training
2. Pilih modul dari daftar (modul berikutnya terkunci sampai quiz + latihan modul sebelumnya disubmit)
3. Akses materi (download dokumen / buka link di tab baru)
4. Kerjakan **Quiz** dan **Latihan** modul
5. Modul otomatis selesai setelah keduanya disubmit; progress tercermin di badge status

## API

| Method | Endpoint | Role | Keterangan |
|--------|----------|------|------------|
| GET | `/api/trainings/[id]/modules` | Trainer/Admin | List modul + konten |
| POST | `/api/trainings/[id]/modules` | Trainer/Admin | Buat modul |
| PATCH | `/api/trainings/[id]/modules` | Trainer/Admin | Reorder modul |
| GET/PATCH/DELETE | `/api/modules/[id]` | Trainer/Admin | Detail/update/hapus modul |
| POST/PATCH | `/api/modules/[id]/contents` | Trainer/Admin | Tambah/reorder konten |
| PATCH/DELETE | `/api/module-contents/[id]` | Trainer/Admin | Edit/hapus konten |
| POST | `/api/modules/upload` | Trainer/Admin | Upload file (FormData) |
| GET | `/api/student/trainings/[id]/modules` | Student | List modul + progress |
| GET/PATCH | `/api/student/modules/[moduleId]` | Student | Detail + update progress |

Server Actions tersedia di `app/actions/modules.ts` untuk form UI.

## Arsitektur

```
lib/domain/modules/          → errors, types, file-validation
lib/application/modules/     → use cases
lib/infrastructure/          → module-repository, supabase-storage
app/api/                     → REST endpoints
app/actions/modules.ts       → Server Actions
components/modules/          → UI components
```

## Environment

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_STORAGE_BUCKET=uploads
```

Buat bucket `uploads` di Supabase Dashboard dan set sebagai **public** agar file dapat diakses via URL.

Tanpa konfigurasi Supabase, upload file akan gagal dengan error `UPLOAD_FAILED`.
