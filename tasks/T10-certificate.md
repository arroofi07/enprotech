---
id: T10
title: Certificate Generation & Download
prd_ref: §3.10
target_week: W5
priority: P1
estimate: M
status: Review
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
- [x] AC-1 — Sertifikat otomatis di-generate saat student lulus post-test
- [x] AC-2 — Sertifikat menggunakan template default yang profesional
- [x] AC-3 — Sertifikat menampilkan: nama student, nama training, tanggal terbit
- [x] AC-4 — Sertifikat menampilkan nilai pre-test dan post-test
- [x] AC-5 — Sertifikat memiliki unique certificate number
- [x] AC-6 — Student dapat melihat daftar sertifikat yang dimiliki
- [x] AC-7 — Student dapat download sertifikat dalam format PDF
- [x] AC-8 — Halaman publik untuk verifikasi sertifikat berdasarkan certificate number
- [x] AC-9 — Halaman verifikasi menampilkan detail sertifikat jika valid
- [x] AC-10 — Halaman verifikasi menampilkan "tidak ditemukan" jika tidak valid

## Definition of Done
- [ ] Code merged ke `main` + reviewed
- [x] Unit test untuk certificate generation logic
- [x] Manual QA pass: pass post-test → view certificate → download → verify
- [x] Dokumentasi: format certificate number dan cara verifikasi
- [x] Tidak ada regresi T01-T09

## Catatan Teknis
- **Backend:** 
  - Trigger generation setelah post-test passed
  - API Routes `/api/certificates`, `/api/certificates/[id]/download`
  - Public API `/api/verify/[certificateNumber]`
- **Database:** 
  - Tabel `certificates` (id, certificate_number, student_id, training_id, issued_at, pre_test_score, post_test_score)
  - Certificate number format: `CERT-{TRAINING_CODE}-{YEAR}-{SEQUENCE}`
- **Frontend:** 
  - Student: `/student/certificates` (list), `/student/certificates/[id]` (detail & download)
  - Public: `/verify`, `/verify/[certificateNumber]`
- **PDF Generation:**
  - Server-side: `jspdf` (template landscape A4)
- **Certificate Template:**
  - Professional design dengan border/frame
  - Logo placeholder
  - Typography yang formal

## Implementasi (selesai)

| Area | File / path |
|------|-------------|
| Domain | `lib/domain/certificates/*` |
| Repository | `lib/infrastructure/db/repositories/certificate-repository.ts` |
| Application | `lib/application/certificates/*`, trigger di `submit-attempt.ts` |
| API | `app/api/certificates/*`, `app/api/verify/[certificateNumber]/route.ts` |
| UI | `components/certificates/*`, `app/(dashboard)/student/certificates/*`, `app/verify/*` |
| Tests | `tests/domain/certificates/*`, `tests/application/certificates/verify-certificate.test.ts` |
| Docs | `docs/certificates.md` |
| QA | `scripts/qa-t10-certificate.ts` (`bun run qa:t10`) |
