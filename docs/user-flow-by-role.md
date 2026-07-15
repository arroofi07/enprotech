# Panduan Penggunaan E-Training Enprotech

Panduan ini menjelaskan **cara memakai aplikasi langkah demi langkah** untuk setiap jenis pengguna: **Admin**, **Trainer**, dan **Student (Peserta)**. Tujuannya membantu Anda tahu *harus mulai dari mana* dan *apa langkah berikutnya*.

Bacalah bagian sesuai peran Anda:

- **[Admin](#panduan-admin)** — menyetujui pendaftar baru & mengatur peran pengguna.
- **[Trainer](#panduan-trainer)** — menyiapkan dan menjalankan pelatihan.
- **[Student / Peserta](#panduan-student-peserta)** — mengikuti pelatihan sampai dapat sertifikat.

---

## Mengenal 3 Jenis Pengguna

| Peran | Tugas utama |
|-------|-------------|
| **Admin** | Menyetujui akun baru, menentukan siapa yang jadi Trainer/Admin, mengawasi seluruh pelatihan. |
| **Trainer** | Membuat pelatihan, mengisi materi & soal, menjadwalkan sesi, menilai, dan menjalankan pelatihan. |
| **Student (Peserta)** | Mengikuti pelatihan: mengerjakan tes, membaca modul, ikut sesi, sampai memperoleh sertifikat. |

> **Catatan penting:** Admin bisa melakukan **semua** yang bisa dilakukan Trainer. Jadi seorang Admin juga bisa membuat dan mengelola pelatihan.

---

## Cara Masuk ke Sistem (Berlaku untuk Semua)

Sebelum bisa memakai aplikasi, setiap orang harus melewati alur ini:

```
Daftar akun  →  Menunggu disetujui Admin  →  Akun aktif  →  Bisa login
```

1. **Mendaftar** — Buka halaman **Daftar**, isi nama, email, dan kata sandi.
   - Setiap orang yang baru mendaftar otomatis menjadi **Student** dengan status **"menunggu persetujuan"**.
2. **Menunggu persetujuan Admin** — Akun belum bisa dipakai login sampai Admin menyetujui.
   - Jika mencoba login sebelum disetujui, akan muncul pesan *"menunggu persetujuan Admin"*.
3. **Login** — Setelah disetujui, masuk memakai email & kata sandi. Anda akan diarahkan ke halaman utama (dashboard) sesuai peran.

> **Bagaimana seseorang menjadi Trainer atau Admin?**
> Semua pendaftaran menghasilkan akun **Student**. Untuk menjadikan seseorang Trainer atau Admin, **Admin harus mengubah perannya** secara manual (dijelaskan di bagian Admin di bawah).

---

# Panduan Admin

Sebagai Admin, tugas paling khas Anda adalah **mengelola pengguna**: menyetujui pendaftar baru dan menentukan peran mereka.

## Langkah 1 — Menyetujui pengguna yang baru mendaftar

Ketika ada orang baru mendaftar, Anda akan mendapat pemberitahuan (ikon lonceng di atas). Untuk menyetujui:

1. Buka menu **Pengguna**.
2. Cari pengguna dengan status **"Menunggu"** (bisa pakai kolom pencarian atau filter status).
3. Klik tombol **Setujui** pada baris pengguna tersebut.
4. Setelah disetujui:
   - Status berubah menjadi **Aktif**.
   - Pengguna mendapat pemberitahuan bahwa akunnya sudah aktif.
   - **Pengguna itu sekarang bisa login.**

## Langkah 2 — Mengubah pengguna menjadi Trainer

Jika Anda ingin seseorang bisa membuat pelatihan (menjadi Trainer):

1. Buka menu **Pengguna**.
2. Cari pengguna yang bersangkutan.
3. Ubah **Peran** dari **Student** menjadi **Trainer** (atau **Admin** bila perlu).
4. Pengguna akan mendapat pemberitahuan bahwa perannya berubah, dan langsung memperoleh akses menu Trainer.

> Peran bisa diubah bolak-balik: Student ⇄ Trainer ⇄ Admin.

## Langkah 3 — Menonaktifkan / mengaktifkan kembali akun

- Untuk **memblokir** akses seseorang, ubah statusnya menjadi **Nonaktif** — pengguna itu tidak bisa login lagi.
- Untuk membuka aksesnya kembali, ubah statusnya menjadi **Aktif**.

## Aturan pengaman yang perlu Anda ketahui

Sistem otomatis mencegah kesalahan berbahaya:

- Anda **tidak bisa mengubah peran atau status akun Anda sendiri**.
- **Admin aktif terakhir tidak bisa diturunkan atau dinonaktifkan** — supaya sistem tidak pernah kehilangan seluruh Admin.

## Yang lain bisa Anda lakukan

- **Dashboard Admin** — melihat ringkasan statistik: jumlah pengguna, jumlah pelatihan, dan pintasan cepat.
- **Semua fitur Trainer** — karena Admin mewarisi kemampuan Trainer, Anda bisa membuat & mengelola pelatihan (lihat [Panduan Trainer](#panduan-trainer)). Berguna untuk mengawasi atau mengoreksi pekerjaan trainer.

---

# Panduan Trainer

Sebagai Trainer, Anda **menyiapkan dan menjalankan pelatihan** dari awal sampai peserta bisa memperoleh sertifikat. Ikuti urutan langkah berikut — **urutannya penting**, karena beberapa langkah baru bisa dilakukan setelah langkah sebelumnya selesai.

## Gambaran besar urutan penyiapan pelatihan

```
1. Buat pelatihan (masih draft, belum terlihat peserta)
2. Isi modul + materi (dokumen / video / link)
3. Jadwalkan Video Conference tiap modul
4. Buat soal Quiz & Latihan tiap modul
5. Buat soal Pre-Test & Post-Test
6. Atur pengaturan tes (batas waktu, jumlah soal, dll — opsional)
7. Publikasikan pelatihan (draft → aktif)
8. Daftarkan (enroll) peserta
9. Aktifkan Pre-Test  →  ✅ pelatihan siap dijalankan peserta
```

## Langkah 1 — Membuat pelatihan baru

1. Buka menu **Buat Training**.
2. Isi: **judul**, **deskripsi**, **nilai kelulusan** (0–100, standarnya 70), **tenggat waktu** (opsional), dan **gambar sampul** (opsional).
3. Simpan. Pelatihan dibuat dengan status **Draft** — **belum terlihat oleh peserta**. Anda akan diarahkan ke halaman pengelolaan pelatihan.

> **Status pelatihan:** Draft → Aktif → Selesai. Ada juga status Arsip (untuk menyimpan/menyembunyikan pelatihan lama).

## Langkah 2 — Mengisi modul & materi

1. Masuk ke bagian **Modul** pada pelatihan Anda.
2. **Buat modul** (judul, deskripsi). Anda bisa **mengubah urutan modul** dengan menggeser (drag & drop).
3. Untuk tiap modul, tambahkan materi:
   - **Dokumen** — unggah file (PDF/DOC/DOCX/XLS/XLSX, maksimal 1 MB). Peserta bisa mengunduhnya.
   - **Link Video** — tautan video (mis. YouTube).
   - **Link Unduhan** — tautan file eksternal (mis. Google Drive).
   - **Gambar sampul modul** (opsional, maksimal 2 MB).

## Langkah 3 — Menjadwalkan Video Conference

1. Buka menu **Video Conference**.
2. Untuk tiap modul, tentukan **waktu sesi** dan **tautan** (Google Meet/Zoom).

> **Penting:** Ini bukan sekadar jadwal. **Quiz sebuah modul baru terbuka untuk peserta setelah waktu Video Conference modul itu tiba.** Jadi kalau lupa menjadwalkan, quiz modulnya akan tetap terkunci.

- Setelah sesi selesai, Anda bisa menekan **Akhiri Sesi**.
- Menjadwalkan sesi otomatis memberi pemberitahuan ke peserta yang sudah terdaftar.

## Langkah 4 — Membuat soal Quiz & Latihan

Setiap modul memiliki **satu Quiz** dan **satu Latihan**. Soalnya berbentuk **pilihan ganda (5 pilihan, 1 jawaban benar)**.

1. Buka menu **Quiz** atau **Latihan** (atau tombol **Kelola Quiz/Latihan** dari panel modul).
2. Buat soal satu per satu, **atau** gunakan **Impor Excel** untuk menambah banyak soal sekaligus.

> **Cara Impor Excel:** unduh **template** lewat tombol **Export Excel**, isi soal di file itu, lalu unggah kembali. Sistem akan menampilkan pratinjau — baris yang valid bisa Anda konfirmasi, baris yang error bisa Anda perbaiki.

## Langkah 5 — Membuat soal Pre-Test & Post-Test

1. Buka menu **Pre Test** dan **Post Test**.
2. Buat soalnya seperti pada Quiz/Latihan (satu per satu atau Impor Excel).

## Langkah 6 — Mengatur tes (opsional)

Untuk tiap tes (Pre-Test, Quiz, Latihan, Post-Test) Anda bisa mengatur:

- **Jumlah soal yang ditampilkan** — kosongkan berarti semua soal ditampilkan.
- **Batas waktu (menit)** — kosongkan berarti tanpa batas waktu. Bila diisi, saat peserta mengerjakan akan ada hitung mundur dan **jawaban otomatis dikumpulkan ketika waktu habis**.
- **Acak urutan soal** — soal tampil dengan urutan berbeda tiap peserta.

> Anda juga bisa mengatur batas waktu semua tes sekaligus lewat menu **Batas Waktu**.

## Langkah 7 — Mempublikasikan pelatihan

1. Dari halaman pengelolaan pelatihan, ubah status dari **Draft** menjadi **Aktif** (**Publikasikan**).
2. Setelah aktif, pelatihan bisa terlihat oleh peserta yang terdaftar, dan mereka mendapat pemberitahuan.

## Langkah 8 — Mendaftarkan peserta (enroll)

1. Buka bagian **Enrollment** pada halaman pelatihan.
2. Pilih peserta berstatus **Aktif**, lalu klik **Daftarkan Terpilih** (atau daftarkan banyak sekaligus lewat Impor Excel).
3. Peserta yang sudah terdaftar akan dilewati. Peserta yang baru didaftarkan mendapat pemberitahuan.

## Langkah 9 — Mengaktifkan Pre-Test (langkah terakhir penyiapan)

Ini adalah **saklar utama** yang membuka pelatihan bagi peserta. Tombol **Aktifkan Pre-Test** hanya muncul bila semua syarat berikut sudah terpenuhi:

1. Pelatihan sudah berstatus **Aktif** (sudah dipublikasikan).
2. **Semua modul sudah punya materi**.
3. Pre-Test **sudah punya minimal 1 soal**.

Setelah Anda menekan **Aktifkan Pre-Test**, peserta bisa mulai mengerjakan dan pelatihan resmi berjalan. ✅

## Selama pelatihan berjalan

- **Nilai / Rekap** (menu **Nilai**) — melihat hasil semua peserta: nilai Quiz & Latihan, status modul, dsb. Bisa difilter per peserta/pelatihan/modul/tanggal, lalu **Export Excel** atau **Export PDF**.
- **Project** — meninjau tugas/project yang diunggah peserta.
- **Feedback** — membaca masukan dari peserta.
- **Sertifikat** — melihat sertifikat yang sudah terbit.

> **Tentang sertifikat:** **tidak ada tombol "buat sertifikat manual"**. Sistem menerbitkannya **otomatis** begitu peserta memenuhi semua syarat (lihat panduan Student). Tugas Anda cukup memastikan materi, soal, dan penilaian tersedia.

---

# Panduan Student (Peserta)

Sebagai peserta, Anda **mengikuti pelatihan secara berurutan**. Beberapa bagian sengaja dikunci sampai Anda menyelesaikan bagian sebelumnya — ini normal.

## Gambaran besar perjalanan Anda

```
1. Didaftarkan oleh trainer
2. Kerjakan PRE-TEST (cukup kumpulkan sekali, tidak harus lulus)
3. Buka MODUL satu per satu:
      baca materi → ikut Video Conference → kerjakan Quiz → kerjakan Latihan
4. POST-TEST (boleh diulang, tapi HARUS LULUS)
5. Unggah PROJECT + isi FEEDBACK
6. SERTIFIKAT terbit otomatis  →  bisa diunduh
```

## Langkah 1 — Pre-Test

1. Buka menu **Pre Test**. (Baru muncul setelah trainer mengaktifkannya.)
2. Kerjakan soalnya.
3. **Hanya bisa dikerjakan sekali** — tidak bisa diulang setelah dikumpulkan.
4. **Tidak harus lulus.** Cukup mengumpulkan Pre-Test untuk **membuka akses ke modul**.

## Langkah 2 — Mengerjakan modul

Buka menu **Modul**. Untuk tiap modul, urutannya:

1. **Baca materi** — unduh dokumen atau buka tautan video/unduhan.
2. **Ikut Video Conference** — Quiz modul baru terbuka setelah **waktu sesi Video Conference modul itu tiba**.
3. **Kerjakan Quiz.**
4. **Kerjakan Latihan** — Latihan terbuka setelah Quiz modul itu dikumpulkan.

**Aturan urutan modul:**
- **Modul berikutnya terkunci** sampai Anda **mengumpulkan Quiz + Latihan** modul sebelumnya.
- Sebuah modul otomatis ditandai **selesai** begitu Quiz dan Latihannya sudah dikumpulkan.

## Langkah 3 — Quiz & Latihan (detail)

- Alurnya: **Mulai → pilih jawaban (tersimpan otomatis) → Kumpulkan → lihat hasil → tinjau jawaban yang salah**.
- **Boleh diulang berkali-kali** sampai mencapai nilai kelulusan. Setelah lulus, tidak bisa diulang lagi. **Nilai tertinggi** yang dipakai.

## Langkah 4 — Post-Test

1. Buka menu **Post Test**. Baru terbuka setelah **semua modul selesai**.
2. **Boleh diulang berkali-kali**, tetapi Anda **HARUS LULUS** (nilai tertinggi mencapai nilai kelulusan).

## Langkah 5 — Project & Feedback

- **Project** (menu **Project**) — unggah file tugas Anda.
- **Feedback** (menu **Feedback**) — isi masukan tentang pelatihan.

> **Keduanya wajib** — tanpa keduanya, sertifikat tidak akan terbit.

## Langkah 6 — Sertifikat

Sertifikat terbit **otomatis** begitu **semua** syarat ini terpenuhi:

1. ✅ Semua modul selesai
2. ✅ Lulus Post-Test
3. ✅ Sudah mengunggah Project
4. ✅ Sudah mengisi Feedback

Setelah terbit:

- **Unduh PDF** dari menu **Sertifikat**.
- Sertifikat punya **nomor unik** dan bisa **diverifikasi publik** (siapa pun bisa mengecek keasliannya lewat halaman **Verifikasi** dengan memasukkan nomor sertifikat — tanpa perlu login).

## Memantau perkembangan Anda

- **Dashboard** & menu **Nilai** menunjukkan persentase kemajuan dan nilai per bagian.

> **Perlu diketahui — beda "membuka bagian berikutnya" dan "batang kemajuan":**
> - Untuk **membuka** modul/tes berikutnya, Anda cukup **mengumpulkan** Quiz/Latihan (berapa pun nilainya).
> - Tetapi pada **batang kemajuan (progress bar)**, Quiz/Latihan/Post-Test baru dihitung "selesai" jika Anda **LULUS**. Pre-Test dihitung selesai cukup dengan mengumpulkan.
> - Jadi wajar bila suatu bagian sudah terbuka tetapi batang kemajuan belum penuh — artinya Anda perlu memperbaiki nilai agar lulus.

---

## Ringkasan Aturan Buka/Kunci (Referensi Cepat)

| Ingin melakukan ini | Syaratnya |
|---------------------|-----------|
| Login | Akun berstatus **Aktif** (sudah disetujui Admin) |
| Trainer mengaktifkan Pre-Test | Pelatihan aktif + semua modul punya materi + Pre-Test punya ≥1 soal |
| Peserta membuka modul | Pre-Test sudah aktif **dan** peserta sudah mengumpulkan Pre-Test |
| Peserta membuka Quiz sebuah modul | Waktu Video Conference modul itu sudah tiba |
| Peserta membuka Latihan sebuah modul | Quiz modul itu sudah dikumpulkan |
| Peserta membuka modul berikutnya | Quiz + Latihan modul sebelumnya sudah dikumpulkan |
| Modul ditandai selesai | Quiz + Latihan modul itu sudah dikumpulkan |
| Peserta membuka Post-Test | Semua modul sudah selesai |
| Lulus Post-Test | Nilai tertinggi mencapai nilai kelulusan |
| Sertifikat terbit | Semua modul selesai + lulus Post-Test + Project diunggah + Feedback diisi |

---

## Diagram Peran Singkat

```
ADMIN    ── menyetujui akun, mengatur peran (Student/Trainer/Admin), mengawasi
              │  (juga bisa melakukan semua tugas Trainer)
              ▼
TRAINER  ── membuat & menjalankan pelatihan: modul, sesi, soal, penilaian
              │
              ▼
STUDENT  ── mengikuti alur: Pre-Test → Modul → Quiz/Latihan → Post-Test
              → Project + Feedback → Sertifikat (terbit otomatis)
```
