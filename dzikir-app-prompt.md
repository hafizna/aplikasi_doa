# Prompt: Aplikasi Pemandu Dzikir & Doa "Munajat"

> **Cara pakai prompt ini**: Copy seluruh isi file ini, paste sebagai initial prompt ke Claude Code / Cursor / v0 / Bolt. Untuk hasil terbaik, jalankan secara bertahap — minta AI menyelesaikan **Fase 1** dulu, review, baru lanjut Fase 2, dst.

---

## 🎯 Konteks & Tujuan

Bangun **Munajat** — sebuah Progressive Web App (PWA) yang memandu seorang muslim melakukan **dzikir setelah sholat, doa-doa harian, dan munajat personal** dengan pendekatan yang **personal, terkurasi, dan berbasis sumber otentik (Al-Qur'an + Hadis shahih)**.

Berbeda dari aplikasi dzikir biasa yang hanya menampilkan list scrollable, Munajat:
1. **Memahami kondisi user** (mood, hajat, situasi) lalu mengkurasi paket doa yang relevan
2. **Sadar konteks waktu** (Hari Arafah, malam Jumat, Ramadan, Asyura, dll) dan otomatis menyarankan amalan spesifik
3. **Step-by-step guided flow**, bukan sekadar list — mirip wizard meditasi
4. **Offline-first**, privacy-first (semua data lokal, tanpa akun)

**Audiens target**: Muslim Indonesia, mayoritas Sunni, beragam tingkat literasi keagamaan (dari yang baru belajar sampai yang ingin pendalaman).

---

## 🧱 Tech Stack (WAJIB)

- **Framework**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui (komponen Radix)
- **Database lokal**: IndexedDB via **Dexie.js** (jangan pakai localStorage — kapasitas terlalu kecil)
- **PWA**: `next-pwa` atau `@serwist/next` untuk service worker + offline caching
- **State management**: Zustand (ringan, cukup untuk skala ini)
- **Audio player**: HTML5 `<audio>` native + custom controls (Howler.js opsional kalau butuh)
- **Hijri calendar**: `hijri-converter` atau `moment-hijri`
- **Deploy target**: Cloudflare Pages atau Vercel (free tier)
- **Font Arab**: Amiri / Scheherazade New / KFGQPC Uthmanic (self-host, jangan Google Fonts CDN untuk Arabic biar offline aman)

**Yang DILARANG**:
- ❌ Backend/database server — semua client-side
- ❌ Authentication / user accounts
- ❌ Analytics tracking (privacy-first)
- ❌ Telemetri ke server pihak ketiga
- ❌ AI yang **menghasilkan** teks doa baru. AI hanya boleh mengkurasi/menyarankan doa dari sumber yang sudah ada di database.

---

## 📐 Arsitektur Konten (Critical!)

### Struktur data doa (schema TypeScript)

```typescript
type Doa = {
  id: string;                    // contoh: "dzikir-setelah-sholat-istighfar-1"
  judul: string;                 // "Istighfar setelah sholat"
  kategori: KategoriDoa;         // enum di bawah
  arab: string;                  // teks Arab dengan harakat lengkap
  latin: string;                 // transliterasi Indonesia standar
  terjemah: string;              // terjemah bahasa Indonesia
  pengulangan: number | null;    // misal 33, 3, atau null kalau bebas
  sumber: SumberDoa;             // wajib ada
  audioUrl?: string;             // path ke file audio (lokal/CDN)
  tags: string[];                // misal ["tobat", "pengampunan", "pagi"]
  keutamaan?: string;            // fadhilah singkat, kalau ada riwayatnya
  konteks?: string;              // kapan/bagaimana dibaca
};

type SumberDoa = {
  jenis: "quran" | "hadis" | "atsar";
  referensi: string;             // "QS. Al-Baqarah: 201" atau "HR. Muslim no. 2725"
  derajat?: "shahih" | "hasan" | "dhaif";  // untuk hadis
  kitabSumber?: string;          // "Hisnul Muslim", "Adzkar An-Nawawi", dll
};

type KategoriDoa =
  | "dzikir-setelah-sholat"
  | "dzikir-pagi"
  | "dzikir-petang"
  | "doa-harian"
  | "doa-tematik"        // tobat, rezeki, jodoh, keturunan, kesembuhan, dll
  | "doa-musiman"        // Arafah, Asyura, Ramadan, dll
  | "munajat-personal";  // template buat user nulis sendiri
```

### Sumber konten yang harus di-seed (compile dari sumber publik)

**Wajib ada di v1**:
1. **Dzikir setelah sholat fardhu** lengkap (Hisnul Muslim Bab 27):
   - Istighfar 3x
   - "Allahumma antas-salam..."
   - Ayat Kursi
   - 3 surat (Al-Ikhlas, Al-Falaq, An-Nas) — dibaca 1x setelah Dzuhur/Ashar/Isya, 3x setelah Subuh/Maghrib
   - Tasbih 33x, Tahmid 33x, Takbir 33x (+ La ilaha illallah penutup = 100)
   - Doa-doa pilihan setelah sholat

2. **Dzikir pagi & petang** (Hisnul Muslim Bab 26)

3. **Doa-doa tematik** (minimal 8-10 doa per kategori):
   - Tobat & pengampunan (Sayyidul Istighfar, doa Nabi Adam, doa Nabi Yunus, dll)
   - Memohon rezeki halal
   - Jodoh / pernikahan (doa Nabi Musa, doa Zakaria, dll)
   - Keturunan (doa Nabi Ibrahim, Zakaria, dll)
   - Kesembuhan diri & keluarga
   - Mohon ilmu & kemudahan
   - Perlindungan dari kesulitan
   - Kebaikan dunia-akhirat (rabbana atina...)

4. **Doa musiman** (auto-trigger berdasarkan kalender Hijriah):
   - Hari Arafah (9 Dzulhijjah): "La ilaha illallah wahdahu la syarika lah..."
   - 10 Muharram (Asyura): puasa & doa
   - Malam Lailatul Qadar: "Allahumma innaka 'afuwwun..."
   - Ramadan: doa berbuka, doa setelah tarawih
   - Malam Jumat: perbanyak shalawat & Al-Kahfi

**Format penyimpanan**: JSON files di `/data/doa/*.json`, di-bundle ke aplikasi (di-import di build time, masuk service worker cache). Strukturnya per kategori per file.

**⚠️ Verifikasi sumber**: SEMUA doa harus punya referensi sumber yang **dapat dilacak ke kitab primer** (Bukhari, Muslim, Abu Dawud, Tirmidzi, Nasai, Ibnu Majah, Ahmad, atau kitab kompilasi seperti Hisnul Muslim / Adzkar An-Nawawi). Jangan pernah kompilasi doa tanpa sumber.

**Tentang "style ustadz tertentu"**: JANGAN namai fitur dengan nama ustadz spesifik (UAS/UAH/Khalid Basalamah/dll) karena (a) risiko misattribution, (b) kontroversi manhaj, (c) potensi isu legal. **Sebagai gantinya**, kategorikan berdasarkan **tradisi/manhaj**:
- "Dzikir Ma'tsur (sesuai sunnah)"
- "Wirid Pilihan Ulama Salaf"
- "Munajat dari Kitab-Kitab Klasik" (Ihya, Al-Hikam, dll)

User bisa filter by tag/sumber kalau dia familiar dengan referensi tertentu.

---

## 🎨 UX Flow Utama

### Flow 1: "Setelah Sholat" (HOMEPAGE — most prominent)

User buka app → landing dengan **prayer-time-aware greeting**:
- Kalau dalam 30 menit setelah waktu sholat → "Selesai sholat Maghrib? Yuk lanjut dzikir."
- Default → tombol besar "Mulai Dzikir Setelah Sholat"

Tap → masuk **guided sequential flow**:
```
Step 1/8: Istighfar 3x   [counter ketuk besar, haptic feedback]
   ↓ (auto-advance after 3, atau tap "lanjut")
Step 2/8: Allahumma antas-salam... [tampil Arab + latin + terjemah, tombol "selesai"]
   ↓
Step 3/8: Ayat Kursi
   ↓
...
Step 8/8: Doa penutup pilihan [user bisa pilih dari 3-5 opsi atau skip]
   ↓
"Alhamdulillah, selesai. Ada hajat yang ingin didoakan?" 
→ [Iya, lanjut Munajat Personal] [Cukup, terima kasih]
```

**Detail penting flow ini**:
- Counter tasbih: tombol fullscreen ketuk besar, angka di tengah, progress bar
- Auto-haptic vibration tiap ketuk (kalau supported)
- Bisa pause/resume kapan aja, state disimpan di IndexedDB
- Ukuran teks Arab bisa diatur (default besar, min 24px)
- Toggle: tampilkan latin/terjemah on/off (untuk yang sudah hafal)

### Flow 2: "Mood-Based Munajat" (Custom doa berdasarkan kondisi)

Tombol di home: **"Doa Sesuai Hati"**

Tap → mini check-in:
```
Q1: "Apa yang sedang kamu rasakan?"
[Bersalah / butuh tobat]
[Berat / banyak masalah]  
[Bersyukur / lega]
[Khawatir / cemas]
[Berharap sesuatu]
[Lainnya — tulis sendiri]

Q2 (kalau "berharap sesuatu"): "Hajat apa yang sedang diperjuangkan?"
[Jodoh] [Keturunan] [Rezeki] [Kesembuhan] [Ilmu/ujian] [Pekerjaan] [Lainnya]

Q3: "Berapa lama waktumu?"
[5 menit — singkat]  
[15 menit — cukup khusyuk]  
[Bebas — sampai puas]
```

Berdasarkan jawaban → app generate **paket doa terkurasi**:
- 2-4 doa ma'tsur yang paling relevan
- Slot "Munajat Personal" — user bisa tulis hajat dalam bahasa Indonesia/bahasa hatinya, app simpan lokal sebagai journal
- Penutup: shalawat + "Rabbana atina fiddunya hasanah..."

Durasi paket otomatis disesuaikan budget waktu yang dipilih.

### Flow 3: "Hari Ini" (Kalender-aware)

Banner di home muncul OTOMATIS kalau hari ini/besok ada hari istimewa:

```
🌙 Besok 9 Dzulhijjah — Hari Arafah
Hari paling utama untuk berdoa. Pelajari amalan Hari Arafah →
```

Tap → halaman khusus dengan:
- Penjelasan singkat keutamaan hari tersebut + sumber hadis
- Amalan utama hari itu (puasa, doa khusus, dll)
- Doa-doa yang ma'tsur untuk hari itu
- Saran durasi (misal: "Nabi ﷺ paling banyak berdoa di Hari Arafah — luangkan minimal 30 menit setelah Ashar")
- Slot "Munajat personal Hari Arafah" — user bisa tulis & app ingatkan tahun depan

**Hari-hari yang harus di-handle**:
- 9 Dzulhijjah (Arafah)
- 10 Dzulhijjah + hari Tasyrik
- 1 Muharram
- 10 Muharram (Asyura)
- Bulan Rajab (sebagai bulan haram, tanpa amalan khusus yang dhaif)
- Nisfu Sya'ban (dengan catatan ikhtilaf ulama, sajikan netral)
- Setiap hari Ramadan + 10 malam terakhir (Lailatul Qadar)
- Hari Senin & Kamis (puasa sunnah)
- Ayyamul Bidh (13, 14, 15 setiap bulan Hijriah)
- Malam Jumat & hari Jumat

### Flow 4: "Jelajah" (Browse library)

Browse semua doa by kategori, tag, atau search. Sederhana — list dengan filter.

---

## 🧩 Fitur Detail

### 1. Tasbih Digital
- Counter besar fullscreen
- Konfigurable target (33, 100, custom)
- Haptic + sound (opsional, default ON)
- Auto-save count ke IndexedDB (kalau user keluar app, count tetap tersimpan)
- Riwayat hari ini: berapa kali tasbih, tahmid, takbir, dll

### 2. Audio Playback
- Tiap doa punya audio recitation (Arab)
- Sumber audio: gunakan **Quran.com API audio** untuk ayat Al-Quran (gratis, public), atau host audio sendiri di Cloudflare R2 untuk hadis-based dzikir
- Player: play/pause, repeat, speed (0.75x/1x/1.25x)
- Pre-cache audio favorit user ke service worker biar offline

### 3. Munajat Personal Journal
- User bisa tulis hajat personal (text bebas)
- Tersimpan **lokal saja** di IndexedDB — ENCRYPTED dengan password opsional (Web Crypto API)
- Tampilan: list hajat aktif + tanggal mulai didoakan
- Kalau hajat sudah terkabul, user bisa tandai → muncul section "Alhamdulillah, sudah dikabulkan" sebagai pengingat syukur
- **TIDAK ADA cloud sync**. Kalau user ganti device, data hilang (trade-off untuk privacy). Sediakan export/import JSON manual.

### 4. Notifikasi
- Browser push notification (iOS 16.4+ support PWA push)
- Konfigurable: reminder waktu sholat (opsional, pakai prayer time API), reminder dzikir pagi/petang, alert hari istimewa H-1
- Default: SEMUA OFF. User opt-in.

### 5. Settings
- Bahasa terjemah: Indonesia (default), atau pilihan
- Font Arab: ukuran 18/22/28/36px
- Tampilkan latin: on/off
- Tampilkan terjemah: on/off
- Tema: light/dark/auto
- Madzhab waktu sholat: Syafi'i (default), Hanafi, dll
- Lokasi (untuk waktu sholat): GPS atau manual city
- Reset data lokal (dengan konfirmasi)
- Export hajat journal ke JSON

---

## 🚀 Roadmap Pengembangan (BANGUN BERTAHAP)

**Bangun fase per fase. Setelah tiap fase, beri jeda untuk review sebelum lanjut.**

### Fase 1: Foundation (PRIORITAS PERTAMA)
1. Setup Next.js 14 + Tailwind + shadcn + PWA config
2. Buat schema TypeScript untuk Doa
3. Seed data: dzikir setelah sholat lengkap + 5 doa tematik (tobat, rezeki, jodoh, keturunan, kesembuhan) — total ~30 doa
4. Setup IndexedDB via Dexie
5. Halaman home dengan tombol "Mulai Dzikir Setelah Sholat"
6. Flow 1: guided sequential dzikir setelah sholat — fully working dengan tasbih counter

**Output yang diharapkan**: User bisa buka app, klik "Mulai Dzikir Setelah Sholat", dan menyelesaikan flow dzikir lengkap dengan counter tasbih yang persistent.

### Fase 2: Mood-Based Curation
1. Flow 2: mood check-in + curation engine
2. Library halaman jelajah (Flow 4)
3. Toggle latin/terjemah, font size settings
4. Munajat personal text input (tanpa enkripsi dulu)

### Fase 3: Calendar-Aware
1. Integrasi Hijri calendar
2. Auto-detect hari istimewa
3. Banner & halaman khusus hari istimewa
4. Seed konten untuk minimal Arafah, Asyura, Ramadan, Lailatul Qadar

### Fase 4: Audio & Polish
1. Audio recitation per doa
2. Pre-cache audio ke service worker
3. Player controls
4. Animasi & micro-interactions

### Fase 5: Advanced
1. Enkripsi journal dengan Web Crypto API
2. Notifikasi push
3. Export/import data
4. Statistik personal (berapa hari berturut-turut dzikir, dll — tampilkan gentle, jangan judgy)

---

## 🎨 Design Guidelines

**Vibe**: Tenang, teduh, kontemplatif. **BUKAN** gamification ala Duolingo. **BUKAN** overly ornamental dengan kaligrafi berlebihan.

- **Palette**: Earthy & calm. Saran: cream/off-white background, deep teal atau warm brown sebagai primary, dengan accent gold halus. Dark mode wajib (banyak yang dzikir malam hari).
- **Typography**: 
  - Arab: Amiri atau KFGQPC Uthmanic — besar, lapang, harakat jelas
  - Latin: Inter atau Geist Sans — readable, modern
  - Hindari font terlalu dekoratif
- **Spacing**: Generous whitespace. Setiap doa punya napas, jangan crowded.
- **Animasi**: Minimal, smooth, gak distracting. Transisi page <300ms. Tasbih counter boleh ada subtle bounce ketika di-tap.
- **Sound**: Default no sound effects (banyak orang baca dzikir di tempat umum). Kalau ada, kasih toggle prominent.

**Inspirasi UX**: Lihat aplikasi seperti **Headspace, Calm** untuk feel kontemplatif. Untuk konten muslim, lihat **Muslim Pro, Quran.com (web)** untuk treatment teks Arab. Tapi **jangan jiplak** — bikin identity sendiri.

---

## ⚠️ Aturan Penting yang JANGAN Dilanggar

1. **JANGAN pernah menghasilkan teks doa baru via AI**. Semua doa harus dari database yang sudah diverifikasi sumbernya.
2. **JANGAN sebut nama ustadz/syaikh kontemporer** sebagai branding kategori. Pakai pendekatan tematik/manhaj.
3. **JANGAN tampilkan hadis dhaif tanpa label jelas**. Lebih baik skip kalau ragu.
4. **JANGAN bikin akun / login / cloud sync**. Semua lokal.
5. **JANGAN tracking / analytics**. Privacy is the feature.
6. **JANGAN bikin streak yang bikin guilt** ("kamu sudah 3 hari tidak dzikir!"). Ibadah bukan kompetisi.
7. **JANGAN tampilkan iklan**, jangan ada monetisasi yang mengganggu.
8. **Selalu cantumkan sumber** di footer setiap doa. Trust adalah segalanya untuk audience ini.
9. **Verifikasi setiap hadis** yang masuk database — minimal ada referensi kitab + nomor + derajat (shahih/hasan). Untuk v1, **prioritaskan hanya yang shahih dan hasan**.
10. **Bahasa default Indonesia**. Inggris opsional di Settings.

---

## 📋 Definition of Done untuk v1 (Fase 1)

User bisa:
- [x] Buka app di browser HP (iOS Safari atau Android Chrome)
- [x] "Add to Home Screen" → app terinstall seperti native
- [x] Buka app **offline** dan tetap bisa pakai semua fitur Fase 1
- [x] Klik "Mulai Dzikir Setelah Sholat" → diguidance step-by-step sampai selesai
- [x] Counter tasbih persistent (tutup app, buka lagi, count masih ada)
- [x] Lihat sumber tiap doa (referensi kitab + nomor)
- [x] Atur ukuran font Arab
- [x] Toggle dark/light mode

Performance:
- [x] Lighthouse PWA score ≥ 90
- [x] First Contentful Paint < 1.5s di 4G
- [x] Bundle size < 500KB (gzipped) untuk initial load

---

## 🛠️ Instruksi Eksekusi untuk AI Coding Tool

1. **Mulai dengan Fase 1 saja**. Jangan langsung bangun semua fase.
2. **Tanyakan dulu**: ada keputusan teknis ambigu yang perlu konfirmasi? (misal: shadcn theme color, atau cara seed data).
3. **Setelah scaffold project**, **tampilkan struktur folder** sebelum lanjut nulis komponen.
4. **Untuk data doa**: kalau lu (AI) belum yakin teks Arab atau sumbernya, **kasih placeholder dengan komentar** `// TODO: verify source - HR. xxx no. xxx` daripada nebak. Saya akan validasi manual.
5. **Setelah Fase 1 selesai**: lakukan self-review terhadap checklist Definition of Done, lalu **tunggu konfirmasi** sebelum masuk Fase 2.
6. **Selalu pakai TypeScript strict mode**. Tidak ada `any`.
7. **Test di iOS Safari mode**. Service worker, IndexedDB, PWA install — semua harus jalan di iOS.

---

## 📚 Referensi Sumber Konten (untuk seeding)

Kompilasi data doa dari sumber-sumber publik berikut (yang sudah public domain atau open license):
- **Hisnul Muslim** (Sa'id bin Ali bin Wahf Al-Qahthani) — kompilasi dzikir terlengkap
- **Al-Adzkar** (Imam An-Nawawi)
- **Riyadhus Shalihin** (Imam An-Nawawi) — bab dzikir & doa
- **Al-Quran Al-Karim** — untuk doa-doa di dalam Al-Quran
- **Sahih Bukhari & Muslim** — untuk hadis-hadis doa
- Untuk teks Arab Quran: gunakan **Quran.com API** (gratis, terverifikasi mushaf Madinah)

Catatan: kompilasi-kompilasi ini sudah banyak versi digitalnya di GitHub (cari "hisn-al-muslim json" atau "azkar json"). Boleh adopt strukturnya, tapi **verifikasi ulang** setiap entry sebelum masuk database.

---

**Mulai sekarang. Tanyakan jika ada yang perlu diklarifikasi sebelum koding.**
