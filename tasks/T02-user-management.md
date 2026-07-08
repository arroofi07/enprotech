---
id: T02
title: User Management (Admin - Approve, Role, Activate/Deactivate)
prd_ref: §2.1 / §3.2
target_week: W1
priority: P0
estimate: M
status: Review
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
- [x] AC-1 — Admin dapat melihat daftar semua user dengan pagination
- [x] AC-2 — Admin dapat filter user berdasarkan role dan status
- [x] AC-3 — Admin dapat search user berdasarkan nama atau email
- [x] AC-4 — Admin dapat approve user pending (status: pending → active)
- [x] AC-5 — Admin dapat mengubah role user (Admin/Trainer/Student)
- [x] AC-6 — Admin dapat deactivate user aktif (status: active → inactive)
- [x] AC-7 — Admin dapat reactivate user inactive (status: inactive → active)
- [x] AC-8 — User yang di-deactivate tidak dapat login
- [x] AC-9 — Tampilkan label "(nonaktif)" untuk user inactive di seluruh aplikasi
- [x] AC-10 — Non-admin tidak dapat mengakses halaman user management

## Definition of Done
- [ ] Code merged ke `main` + reviewed
- [x] Unit test ≥ 80% untuk use case user management
- [ ] Manual QA pass: approve + ubah role + deactivate/activate
- [x] Dokumentasi: panduan Admin user management
- [x] Tidak ada regresi T01

## Implementasi (selesai)

### Pendekatan
- Clean Architecture mirror T01 (domain → application → infrastructure → presentation)
- Hybrid: Server Actions untuk UI + thin API Routes `/api/users`
- Soft session gate di `getCurrentUser` (re-check DB status)

### File utama
| Layer | Path |
|-------|------|
| Domain | `lib/domain/users/` |
| Application | `lib/application/users/` |
| Infrastructure | `user-repository.ts` (list/update) |
| Presentation | `app/actions/users.ts`, `app/api/users/`, `app/(dashboard)/admin/users/` |
| UI | `components/users/` |
| Docs | `docs/user-management.md` |
| Tests | `tests/domain/users/`, `tests/application/users/` |

## Catatan Teknis
- **Backend:** API Routes `/api/users` (GET, PATCH) + Server Actions
- **Database:** Tabel `users` - kolom `role`, `status` (sudah ada)
- **Frontend:** Halaman `/admin/users` dengan Table + filter + pagination
- **UI Components:** shadcn/ui Table, Dialog, AlertDialog, Badge, Pagination
- **Authorization:** `proxy.ts` + admin check di use case
