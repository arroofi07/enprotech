# Certificate Generation & Verification (T10)

Sertifikat diterbitkan otomatis saat student lulus post-test dan memenuhi seluruh alur training.

## Format nomor sertifikat

```
CERT-{TRAINING_CODE}-{YEAR}-{SEQUENCE}
```

| Bagian | Contoh | Keterangan |
|--------|--------|------------|
| `TRAINING_CODE` | `LEADERSHIP-1` | Diambil dari judul training (maks. 12 karakter, uppercase) |
| `YEAR` | `2026` | Tahun UTC saat sertifikat diterbitkan |
| `SEQUENCE` | `0007` | Urutan ke-7 untuk training tersebut di tahun yang sama |

Contoh lengkap: `CERT-LEADERSHIP-1-2026-0007`

## Kapan sertifikat dibuat

Trigger otomatis di `submitAttemptUseCase` ketika:
1. Assessment bertipe `post_test`
2. Best score student sudah memenuhi passing grade
3. Semua modul sudah selesai (`canAccessCertificate`)

Sertifikat hanya dibuat sekali per student per training (idempotent).

## Data sertifikat

- Nama student
- Nama training
- Tanggal terbit (`issued_at`)
- Nilai pre-test dan post-test
- Nilai akhir = rata-rata pre + post (dibulatkan)
- Nomor sertifikat unik

## Akses

| Role / Area | Path |
|-------------|------|
| Student list | `/student/certificates` |
| Student detail & download | `/student/certificates/[id]` |
| Download PDF API | `GET /api/certificates/[id]/download` |
| List API | `GET /api/certificates` |
| Verifikasi publik | `/verify`, `/verify/[certificateNumber]` |
| Verify API | `GET /api/verify/[certificateNumber]` |

## Verifikasi publik

1. Buka `/verify`
2. Masukkan nomor sertifikat
3. Halaman hasil menampilkan detail jika valid, atau pesan tidak ditemukan jika invalid

## QA

```bash
bun run qa:t10
```

Alur QA: setup training → lulus pre-test → selesaikan modul/quiz/latihan → lulus post-test → cek sertifikat → download PDF → verifikasi publik.
