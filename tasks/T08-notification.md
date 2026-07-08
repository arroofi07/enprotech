---
id: T08
title: Real-time Notification System
prd_ref: §3.8
target_week: W4
priority: P1
estimate: M
status: Pending
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
- [ ] AC-1 — Header menampilkan bell icon untuk notifikasi
- [ ] AC-2 — Badge counter menampilkan jumlah notifikasi belum dibaca
- [ ] AC-3 — Klik bell icon membuka dropdown list notifikasi
- [ ] AC-4 — Admin/Trainer menerima notifikasi saat student menyelesaikan modul
- [ ] AC-5 — Notifikasi menampilkan: nama student, nama modul, nama training, waktu
- [ ] AC-6 — Student menerima notifikasi reminder H-3 dan H-1 deadline
- [ ] AC-7 — User dapat mark single notification as read
- [ ] AC-8 — User dapat mark all notifications as read
- [ ] AC-9 — Notifikasi baru muncul tanpa refresh halaman (real-time)
- [ ] AC-10 — Klik notifikasi redirect ke halaman terkait

## Definition of Done
- [ ] Code merged ke `main` + reviewed
- [ ] Unit test untuk notification creation logic
- [ ] Manual QA pass: complete module → verify notification → mark read
- [ ] Dokumentasi: jenis-jenis notifikasi
- [ ] Tidak ada regresi T01-T07

## Catatan Teknis
- **Backend:** 
  - API Routes `/api/notifications` (GET, PATCH)
  - Trigger notification saat module completion
  - Cron job untuk deadline reminder (atau on-demand check)
- **Database:** 
  - Tabel `notifications` (id, user_id, type, title, message, data: JSON, is_read, created_at)
- **Frontend:** 
  - Notification bell component di header
  - Dropdown dengan virtual scroll untuk banyak notifikasi
- **Real-time Options:**
  - Polling setiap 30 detik (simple)
  - Server-Sent Events (SSE)
  - WebSocket (jika perlu bidirectional)
- **UI Components:** 
  - Bell icon dengan Badge
  - Dropdown/Popover
  - NotificationItem component
