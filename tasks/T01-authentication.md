---
id: T01
title: Authentication & Authorization (Login, Register, RBAC)
prd_ref: §3.1
target_week: W1
priority: P0
estimate: L
status: Pending
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
- [ ] AC-1 — User dapat register dengan nama, email, password; status default "pending"
- [ ] AC-2 — User dapat login dengan email dan password yang valid
- [ ] AC-3 — User dengan status "pending" tidak dapat login (tampilkan pesan menunggu approval)
- [ ] AC-4 — User dengan status "inactive" tidak dapat login
- [ ] AC-5 — Setelah login, user diarahkan ke dashboard sesuai role
- [ ] AC-6 — Route admin hanya bisa diakses oleh role Admin
- [ ] AC-7 — Route trainer hanya bisa diakses oleh role Admin dan Trainer
- [ ] AC-8 — Session tersimpan dan persist setelah refresh browser
- [ ] AC-9 — Logout menghapus session dan redirect ke halaman login
- [ ] AC-10 — Password di-hash sebelum disimpan ke database

## Definition of Done
- [ ] Code merged ke `main` + reviewed
- [ ] Unit test untuk auth logic
- [ ] Manual QA pass: register → pending → approve → login → logout
- [ ] Dokumentasi: alur authentication
- [ ] Tidak ada security vulnerability (SQL injection, XSS)

## Catatan Teknis
- **Framework:** Next.js App Router dengan Server Actions
- **Auth Library:** NextAuth.js atau custom JWT
- **Database:** PostgreSQL - tabel `users` dengan kolom role, status
- **Password Hashing:** bcrypt
- **Session:** HTTP-only cookies atau JWT
- **Middleware:** Route protection di `middleware.ts`
