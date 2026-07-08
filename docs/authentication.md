# Authentication Flow

Dokumentasi alur autentikasi E-Training Enprotech (T01).

## Ringkasan

- **Register:** User mendaftar dengan nama, email, password → status default `pending`, role `student`
- **Approval:** Admin menyetujui user via `/admin/users` (lihat `docs/user-management.md`)
- **Login:** Hanya user `active` yang dapat login
- **Session:** JWT di HTTP-only cookie (`session`)
- **RBAC:** Route protection via `proxy.ts`

## Role & Akses Route

| Route prefix | Akses |
|--------------|-------|
| `/admin/*` | Admin saja |
| `/trainer/*` | Admin, Trainer |
| `/student/*` | Semua role yang login |
| `/login`, `/register` | Public (redirect ke dashboard jika sudah login) |

## Environment Variables

```env
DATABASE_URL=postgresql://...
SESSION_SECRET=<min-32-chars-random>
SESSION_MAX_AGE=604800
SEED_ADMIN_EMAIL=admin@enprotech.local
SEED_ADMIN_PASSWORD=Admin123!
```

## Bootstrap Admin

```bash
bun run db:seed
```

Membuat admin pertama dengan status `active`. Idempotent — skip jika email sudah ada.

## Manual QA Checklist

1. Register user baru → status pending, redirect ke login
2. Login dengan user pending → pesan "menunggu persetujuan Admin"
3. Approve user via `/admin/users` → login berhasil
4. Login sebagai admin → redirect `/admin/dashboard`
5. Akses `/admin/*` sebagai student → redirect `/unauthorized`
6. Refresh browser → session tetap ada
7. Logout → redirect `/login`, session hilang

## Arsitektur

```
Presentation  → app/actions, pages, proxy.ts
Application   → lib/application/auth (use cases)
Domain        → lib/domain/auth (types, errors, permissions)
Infrastructure → repositories, session-manager, password-hasher
```

## JWT Payload

```json
{
  "sub": "user-uuid",
  "email": "user@example.com",
  "name": "User Name",
  "role": "student",
  "status": "active",
  "iat": 1234567890,
  "exp": 1234567890
}
```
