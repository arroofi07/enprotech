---
id: T01
title: Authentication & Authorization (Login, Register, RBAC)
prd_ref: §3.1
target_week: W1
priority: P0
estimate: L
status: Review
dependencies: []
---

# T01 — Authentication & Authorization

## Konteks
Sistem E-Training memiliki 3 role berbeda (Admin, Trainer, Student) dengan permission yang berbeda-beda. Authentication menjadi fondasi untuk seluruh fitur lainnya. User baru yang register akan berstatus pending hingga di-approve oleh Admin.

## User Story
> Sebagai pengguna E-Training, saya ingin dapat login/register ke sistem dengan role yang sesuai, agar saya dapat mengakses fitur sesuai dengan hak akses saya.

## Scope
- **In scope:** 
  - Halaman Login (email + password)
  - Halaman Register (nama, email, password)
  - Role-based access control (Admin, Trainer, Student)
  - Session management
  - Protected routes berdasarkan role
  - Logout functionality
  
- **Out of scope:** 
  - OAuth/Social login
  - Two-factor authentication
  - Password reset via email (v1)
  - Remember me functionality

## Acceptance Criteria
- [x] AC-1 — User dapat register dengan nama, email, password; status default "pending"
- [x] AC-2 — User dapat login dengan email dan password yang valid
- [x] AC-3 — User dengan status "pending" tidak dapat login (tampilkan pesan menunggu approval)
- [x] AC-4 — User dengan status "inactive" tidak dapat login
- [x] AC-5 — Setelah login, user diarahkan ke dashboard sesuai role
- [x] AC-6 — Route admin hanya bisa diakses oleh role Admin
- [x] AC-7 — Route trainer hanya bisa diakses oleh role Admin dan Trainer
- [x] AC-8 — Session tersimpan dan persist setelah refresh browser
- [x] AC-9 — Logout menghapus session dan redirect ke halaman login
- [x] AC-10 — Password di-hash sebelum disimpan ke database

## Definition of Done
- [ ] Code merged ke `main` + reviewed
- [x] Unit test untuk auth logic
- [ ] Manual QA pass: register → pending → approve → login → logout
- [x] Dokumentasi: alur authentication
- [x] Tidak ada security vulnerability (SQL injection, XSS)

## Implementasi (selesai)

### Pendekatan yang dipakai
- **Auth:** Custom session — `jose` (JWT) + HTTP-only cookie + `bcryptjs`
- **Arsitektur:** Clean architecture (domain → application → infrastructure → presentation)
- **Route protection:** `proxy.ts` (Next.js 16, bukan `middleware.ts`)
- **UI:** shadcn/ui + react-hook-form + zod

### File utama
| Layer | Path |
|-------|------|
| Domain | `lib/domain/auth/` (types, errors, permissions, password-policy) |
| Application | `lib/application/auth/` (login, register, logout, get-session) |
| Infrastructure | `lib/infrastructure/db/repositories/user-repository.ts`, `lib/infrastructure/auth/` |
| Presentation | `app/actions/auth.ts`, `app/(auth)/`, `app/(dashboard)/`, `proxy.ts` |
| UI | `components/auth/` (login-form, register-form, dashboard-shell) |
| Tests | `tests/` — 12 unit tests (permissions, password-hasher, login, register) |
| Docs | `docs/authentication.md` |
| Seed | `scripts/seed-admin.ts` (`bun run db:seed`) |

### Halaman & route
- `/login`, `/register` — form autentikasi
- `/admin/dashboard`, `/trainer/dashboard`, `/student/dashboard` — placeholder per role
- `/unauthorized` — akses ditolak
- `/` — redirect ke dashboard (jika login) atau `/login`

### Env vars tambahan
```
SESSION_SECRET=
SESSION_MAX_AGE=604800
SEED_ADMIN_EMAIL=
SEED_ADMIN_PASSWORD=
```

### Verifikasi otomatis
- `bun run test` — 12 tests passed
- `bun run build` — sukses
- Admin seed — `admin@enprotech.local` (via `bun run db:seed`)

### Catatan sisa
- **Approve user** UI tersedia di T02 (`/admin/users`)
- **Merge ke main** dan **manual QA end-to-end** belum dilakukan

## Catatan Teknis
- **Framework:** Next.js App Router dengan Server Actions
- **Auth Library:** Custom JWT (`jose`) + HTTP-only cookie
- **Database:** PostgreSQL - tabel `users` dengan kolom role, status (Drizzle ORM)
- **Password Hashing:** bcryptjs (cost 12)
- **Session:** JWT di HTTP-only cookie (`session`)
- **Route protection:** `proxy.ts` + RBAC `canAccessRoute()`
