---
id: T08
title: Real-time Notification System
prd_ref: §3.8
target_week: W4
priority: P1
estimate: M
status: Review
dependencies: [T04, T05]
---

# T08 — Notification System

## Konteks
Admin dan Trainer perlu mendapat notifikasi real-time saat student menyelesaikan modul. Notifikasi ditampilkan di website dengan bell icon dan badge counter. Student juga mendapat notifikasi untuk reminder deadline.

## User Story
> Sebagai Admin/Trainer, saya ingin mendapat notifikasi saat student menyelesaikan modul, agar saya dapat memantau progress pembelajaran secara real-time.

> Sebagai Student, saya ingin mendapat notifikasi reminder deadline, agar saya tidak melewatkan batas waktu training.

## Scope
- **In scope:** 
  - Bell icon dengan badge counter di header
  - Dropdown list notifikasi
  - Notifikasi modul selesai ke Admin & Trainer
  - Notifikasi reminder deadline ke Student
  - Mark as read (single dan all)
  - Real-time update (polling atau WebSocket)
  
- **Out of scope:** 
  - Push notification (browser/mobile)
  - Email notification
  - Notification preferences/settings

## Acceptance Criteria
- [x] AC-1 — Header menampilkan bell icon untuk notifikasi
- [x] AC-2 — Badge counter menampilkan jumlah notifikasi belum dibaca
- [x] AC-3 — Klik bell icon membuka dropdown list notifikasi
- [x] AC-4 — Admin/Trainer menerima notifikasi saat student menyelesaikan modul
- [x] AC-5 — Notifikasi menampilkan: nama student, nama modul, nama training, waktu
- [x] AC-6 — Student menerima notifikasi reminder H-3 dan H-1 deadline
- [x] AC-7 — User dapat mark single notification as read
- [x] AC-8 — User dapat mark all notifications as read
- [x] AC-9 — Notifikasi baru muncul tanpa refresh halaman (real-time)
- [x] AC-10 — Klik notifikasi redirect ke halaman terkait

## Definition of Done
- [ ] Code merged ke `main` + reviewed
- [x] Unit test untuk notification creation logic
- [x] Manual QA pass: complete module → verify notification → mark read
- [x] Dokumentasi: jenis-jenis notifikasi
- [x] Tidak ada regresi T01-T07

## Catatan Teknis
- **Backend:** 
  - API Routes `GET/PATCH /api/notifications`
  - Trigger notification saat `updateStudentModuleProgress` → `completed`
  - On-demand deadline reminder saat list notifikasi student
- **Database:** 
  - Tabel `notifications` (id, user_id, type, title, message, data: JSON, is_read, created_at)
  - Dedup via `data.dedupKey`
- **Frontend:** 
  - `NotificationBell` di header Student/Trainer/Admin
  - Dropdown dengan `ScrollArea`
  - Polling 30 detik + refresh saat dropdown dibuka
- **Real-time:** Polling setiap 30 detik (simple, sesuai task spec)

## Implementasi (selesai)

| Area | File / path |
|------|-------------|
| Domain | `lib/domain/notifications/build-notifications.ts`, `types.ts`, `errors.ts` |
| Repository | `lib/infrastructure/db/repositories/notification-repository.ts` |
| Application | `lib/application/notifications/*`, trigger di `update-student-module-progress.ts` |
| API | `app/api/notifications/route.ts` |
| UI | `components/notifications/notification-bell.tsx`, update `*-header.tsx` |
| Tests | `tests/domain/notifications/build-notifications.test.ts` |
| Docs | `docs/notifications.md` |
| QA | `scripts/qa-t08-notification.ts` (`bun run qa:t08`) |
