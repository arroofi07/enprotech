---
id: T02
title: User Management (Admin - Approve, Role, Activate/Deactivate)
prd_ref: §2.1 / §3.2
target_week: W1
priority: P0
estimate: M
status: Pending
dependencies: [T01]
---

# T02 — User Management

## Konteks
Admin perlu mengelola user yang mendaftar ke sistem. User baru berstatus "pending" dan perlu di-approve oleh Admin. Admin juga dapat mengubah role user (Trainer/Student) serta mengaktifkan/menonaktifkan akun user.

## User Story
> Sebagai Admin E-Training, saya ingin dapat mengelola user (approve, ubah role, aktivasi/deaktivasi), agar sistem memiliki kontrol akses yang tepat untuk setiap pengguna.

## Scope
- **In scope:** 
  - Halaman daftar user dengan filter & search
  - Approve user baru (pending → active)
  - Ubah role user (Admin/Trainer/Student)
  - Aktivasi/Deaktivasi user
  - View detail user
  
- **Out of scope:** 
  - Bulk import user
  - Delete user permanent (hanya deactivate)
  - Edit profil user oleh Admin

## Acceptance Criteria
- [ ] AC-1 — Admin dapat melihat daftar semua user dengan pagination
- [ ] AC-2 — Admin dapat filter user berdasarkan role dan status
- [ ] AC-3 — Admin dapat search user berdasarkan nama atau email
- [ ] AC-4 — Admin dapat approve user pending (status: pending → active)
- [ ] AC-5 — Admin dapat mengubah role user (Admin/Trainer/Student)
- [ ] AC-6 — Admin dapat deactivate user aktif (status: active → inactive)
- [ ] AC-7 — Admin dapat reactivate user inactive (status: inactive → active)
- [ ] AC-8 — User yang di-deactivate tidak dapat login
- [ ] AC-9 — Tampilkan label "(nonaktif)" untuk user inactive di seluruh aplikasi
- [ ] AC-10 — Non-admin tidak dapat mengakses halaman user management

## Definition of Done
- [ ] Code merged ke `main` + reviewed
- [ ] Unit test ≥ 80% untuk use case user management
- [ ] Manual QA pass: approve + ubah role + deactivate/activate
- [ ] Dokumentasi: panduan Admin user management
- [ ] Tidak ada regresi T01

## Catatan Teknis
- **Backend:** API Routes `/api/users` (GET, PATCH)
- **Database:** Tabel `users` - kolom `role`, `status`
- **Frontend:** Halaman `/admin/users` dengan DataTable
- **UI Components:** shadcn/ui Table, Dialog, Select, Badge
- **Authorization:** Middleware check role === 'admin'
