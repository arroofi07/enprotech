---
id: T10
title: Certificate Generation & Download
prd_ref: §3.10
target_week: W5
priority: P1
estimate: M
status: Pending
dependencies: [T06, T07]
---

# T10 — Certificate

## Konteks
Student yang lulus post-test berhak mendapatkan sertifikat. Sertifikat di-generate otomatis dengan template default sistem. Sertifikat memiliki unique ID untuk verifikasi keaslian.

## User Story
> Sebagai Student, saya ingin mendapatkan sertifikat setelah menyelesaikan training, agar saya memiliki bukti kelulusan yang dapat diverifikasi.

## Scope
- **In scope:** 
  - Generate sertifikat otomatis setelah lulus post-test
  - Template default dari sistem
  - Data dinamis (nama, training, tanggal, nilai)
  - Unique certificate number untuk verifikasi
  - Download sertifikat dalam format PDF
  - Halaman verifikasi sertifikat (public)
  
- **Out of scope:** 
  - Custom template upload oleh trainer
  - Multiple template pilihan
  - Digital signature
  - QR code pada sertifikat

## Acceptance Criteria
- [ ] AC-1 — Sertifikat otomatis di-generate saat student lulus post-test
- [ ] AC-2 — Sertifikat menggunakan template default yang profesional
- [ ] AC-3 — Sertifikat menampilkan: nama student, nama training, tanggal terbit
- [ ] AC-4 — Sertifikat menampilkan nilai pre-test dan post-test
- [ ] AC-5 — Sertifikat memiliki unique certificate number
- [ ] AC-6 — Student dapat melihat daftar sertifikat yang dimiliki
- [ ] AC-7 — Student dapat download sertifikat dalam format PDF
- [ ] AC-8 — Halaman publik untuk verifikasi sertifikat berdasarkan certificate number
- [ ] AC-9 — Halaman verifikasi menampilkan detail sertifikat jika valid
- [ ] AC-10 — Halaman verifikasi menampilkan "tidak ditemukan" jika tidak valid

## Definition of Done
- [ ] Code merged ke `main` + reviewed
- [ ] Unit test untuk certificate generation logic
- [ ] Manual QA pass: pass post-test → view certificate → download → verify
- [ ] Dokumentasi: format certificate number dan cara verifikasi
- [ ] Tidak ada regresi T01-T09

## Catatan Teknis
- **Backend:** 
  - Trigger generation setelah post-test passed
  - API Routes `/api/certificates`, `/api/certificates/[id]/download`
  - Public API `/api/verify/[certificateNumber]`
- **Database:** 
  - Tabel `certificates` (id, certificate_number, student_id, training_id, issued_at, pre_test_score, post_test_score)
  - Certificate number format: `CERT-{TRAINING_CODE}-{YEAR}-{SEQUENCE}`
- **Frontend:** 
  - Student: `/certificates` (list), `/certificates/[id]` (detail & download)
  - Public: `/verify` atau `/verify/[certificateNumber]`
- **PDF Generation:**
  - Server-side: @react-pdf/renderer atau puppeteer
  - Template: React component yang di-render ke PDF
- **Certificate Template:**
  - Professional design dengan border/frame
  - Logo placeholder
  - Typography yang formal
