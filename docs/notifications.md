# Notifications

Panduan sistem notifikasi in-app untuk Admin, Trainer, dan Student.

## Jenis Notifikasi

| Type | Penerima | Trigger |
|------|----------|---------|
| `module_completed` | Admin aktif + pembuat training | Student menyelesaikan modul (`module_progress.status = completed`) |
| `deadline_reminder` | Student terdaftar | Deadline training H-3 atau H-1 (on-demand saat fetch notifikasi) |

## Isi Notifikasi Modul Selesai

Menampilkan:

- Nama student
- Nama modul
- Nama training
- Waktu relatif (UI)

Klik notifikasi mengarahkan ke `/trainer/trainings/[trainingId]`.

## Reminder Deadline

- **H-3**: deadline masih 3 hari lagi
- **H-1**: deadline besok

Reminder dibuat sekali per training per threshold (dedup via `data.dedupKey`).
Klik notifikasi mengarahkan ke `/student/trainings/[trainingId]`.

## API

| Endpoint | Method | Deskripsi |
|----------|--------|-----------|
| `/api/notifications` | GET | List notifikasi + `unreadCount` |
| `/api/notifications` | PATCH | Mark read (`{ notificationId }`) atau mark all (`{ markAll: true }`) |

## Real-time Update

Frontend memakai polling setiap **30 detik** via komponen `NotificationBell`, plus refresh saat dropdown dibuka.

## Arsitektur

```
lib/domain/notifications/build-notifications.ts  → pure builders + deadline logic
lib/infrastructure/.../notification-repository.ts
lib/application/notifications/                   → use cases
components/notifications/notification-bell.tsx   → bell + dropdown UI
```

## Tests

```bash
npm test -- tests/domain/notifications
bun run qa:t08
```
