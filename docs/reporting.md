# Reporting & Rekap Hasil Training (T09)

Fitur rekap hasil training untuk Admin dan Trainer dengan filter dan export.

## Akses

- Halaman: `/trainer/nilai` (Admin juga dapat mengakses via route trainer)
- API:
  - `GET /api/reports/training` — daftar rekap (pagination + filter)
  - `GET /api/reports/training?detail=student&studentId=...&trainingId=...` — detail per student
  - `GET /api/reports/training/export?format=xlsx|pdf` — export sesuai filter aktif

## Filter

| Parameter | Deskripsi |
|-----------|-----------|
| `search` | Cari nama/email student |
| `studentId` | Filter student tertentu |
| `trainingId` | Filter training |
| `moduleId` | Filter modul (pilih training dulu) |
| `dateFrom` / `dateTo` | Rentang tanggal enrollment atau penyelesaian modul |
| `page` / `pageSize` | Pagination |

## Kolom rekap

- Nama student & email
- Training & modul
- Nilai quiz & latihan (best submitted score)
- Status modul & enrollment

## Detail student

Klik **Lihat** pada baris rekap untuk membuka dialog berisi:

- Info enrollment
- Semua assessment (pre-test, quiz, latihan, post-test)
- Daftar attempt beserta nilai per assessment

## Export

Tombol **Export Excel** dan **Export PDF** di header halaman mengikuti filter yang sedang aktif.

- Excel: library `xlsx`
- PDF: `jspdf` + `jspdf-autotable`

## Arsitektur

| Layer | Path |
|-------|------|
| Domain | `lib/domain/reports/*` |
| Application | `lib/application/reports/*` |
| Repository | `lib/infrastructure/db/repositories/report-repository.ts` |
| API | `app/api/reports/training/*` |
| UI | `components/reports/*`, `app/(dashboard)/trainer/nilai/page.tsx` |

## QA manual

```bash
bun run qa:t09
```

Pastikan dev server berjalan di `http://localhost:3000` (atau set `QA_BASE_URL`).
