# User Management (Admin)

Dokumentasi manajemen pengguna E-Training Enprotech (T02).

## Ringkasan

Admin mengelola user yang mendaftar ke sistem:

- Melihat daftar user (filter role/status, search nama/email, pagination)
- Approve user `pending` → `active`
- Ubah role (`admin` / `trainer` / `student`)
- Deactivate (`active` → `inactive`) / reactivate (`inactive` → `active`)
- Lihat detail user

User `inactive` tidak dapat login. Nama user inactive ditampilkan dengan label `(nonaktif)`.

## Halaman Admin

URL: `/admin/users` (hanya role Admin; non-admin → `/unauthorized`)

Nav: link **Users** tersedia di shell dashboard untuk Admin.

## Alur Approve

1. User register → status `pending`, role `student`
2. Admin buka `/admin/users`, filter status **Pending**
3. Klik **Approve**
4. User dapat login

## Safeguard

- Admin tidak dapat mengubah role/status akun sendiri
- Admin aktif terakhir tidak dapat di-demote atau dinonaktifkan

## API

Semua endpoint membutuhkan session cookie Admin.

### `GET /api/users`

Query: `search`, `role`, `status`, `page`, `pageSize`

```json
{
  "items": [{ "id": "...", "email": "...", "name": "...", "role": "student", "status": "pending", "createdAt": "...", "updatedAt": "..." }],
  "total": 1,
  "page": 1,
  "pageSize": 10,
  "totalPages": 1
}
```

### `GET /api/users/[id]`

Detail satu user (tanpa password hash).

### `PATCH /api/users/[id]`

Body:

```json
{ "action": "approve" }
{ "action": "setRole", "role": "trainer" }
{ "action": "setStatus", "status": "inactive" }
```

## Arsitektur

```
Presentation  → app/actions/users.ts, app/api/users/*, app/(dashboard)/admin/users
Application   → lib/application/users (list, get, approve, update-role, set-status)
Domain        → lib/domain/users (errors, status-transitions, format-display-name)
Infrastructure → user-repository list/update helpers
```

## Manual QA Checklist

1. Register user baru → muncul di list dengan status Pending
2. Approve → login user berhasil
3. Filter role/status + search nama/email + pagination
4. Ubah role student → trainer
5. Deactivate → login gagal + label `(nonaktif)` di list
6. Reactivate → login OK
7. Student buka `/admin/users` → unauthorized
8. Self-modify / last-admin blocked
