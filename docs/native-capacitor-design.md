# Rancangan: Jalur Native via Capacitor

> Status: **rancangan**. Tujuan: jadikan Munajat aplikasi native iOS/Android **dengan reuse
> 100% kode Next.js yang ada**, untuk membuka kemampuan yang PWA tak bisa andal.

## 1. Kenapa native (alasan teknis nyata)

| Kemampuan | PWA (sekarang) | Native (Capacitor) |
|---|---|---|
| Notifikasi terjadwal (adhan, dzikir pagi/petang) | Tidak andal, iOS payah; [prayer.ts](../lib/prayer.ts) `showPrayerNotification` hanya test manual | **Andal** via `@capacitor/local-notifications`, dijadwalkan dari `getPrayerRows` |
| Widget home screen (sholat berikutnya, ayat harian) | Tidak ada | Bisa (perlu kode native Swift/Kotlin) |
| Audio background, haptic tasbih | Terbatas | Stabil (`@capacitor/haptics`) |
| Hadir di App Store / Play | Tidak | Ya |

## 2. Pendekatan: static export + shell native

Munajat sudah hampir sepenuhnya static/SSG (cek build: semua route `○`/`●`, tanpa API route
atau server action). Jadi bisa `next build` → **static export** → di-bundle ke Capacitor
sebagai `webDir` (offline penuh, true native), **bukan** sekadar memuat URL hosted.

Langkah:
1. `npm i @capacitor/core @capacitor/cli && npx cap init Munajat com.munajat.app`
2. `next.config.mjs`: tambah `output: "export"` (mode build native). Catatan: `next/image`
   pakai `unoptimized: true`; dynamic route `app/hari-ini/[eventId]` sudah SSG via
   `generateStaticParams` → aman untuk export.
3. **Service worker (serwist)**: nonaktifkan di build native (Capacitor punya cache sendiri),
   aktif hanya untuk target web. Gunakan flag env saat build.
4. `npx cap add ios && npx cap add android`, set `webDir` ke folder export (`out`).
5. `next build && npx cap sync` tiap rilis.

> Alternatif cepat: Capacitor sebagai shell tipis yang memuat PWA hosted. Lebih sederhana
> tapi butuh jaringan saat load pertama dan kurang "native". **Rekomendasi: static export.**

## 3. Plugin yang dipakai

- `@capacitor/local-notifications` — **fitur kunci**: jadwalkan adhan + reminder dzikir
  pagi/petang/hari-istimewa untuk N hari ke depan, dihitung dari [lib/prayer.ts](../lib/prayer.ts).
  Ini akhirnya membuat toggle notifikasi yang sudah ada di settings (`adhan`,
  `dzikirMorning`, dst.) benar-benar berfungsi.
- `@capacitor/haptics` — getar tasbih (ganti `navigator.vibrate`).
- `@capacitor/geolocation` — lokasi untuk jadwal sholat (lebih andal dari web GPS).
- `@capacitor/preferences` — opsional, sebagian state ringan; data utama tetap IndexedDB/Dexie.
- `@capacitor/share` — share doa (privacy-safe).

## 4. Penjadwalan notifikasi (inti)

```
hitung getPrayerRows untuk 7 hari ke depan (adhan, sudah ada)
→ untuk tiap waktu sholat aktif: LocalNotifications.schedule({ at, title, body })
→ reminder dzikir pagi (setelah Subuh) & petang (setelah Ashar) bila toggle ON
→ re-schedule saat app dibuka / lokasi berubah (notifikasi terjadwal punya batas kuota OS)
```

Framing **anti-guilt** (sesuai prompt): ajakan lembut ("Sudah Maghrib, yuk dzikir"), bukan
teguran ("kamu belum dzikir!").

## 5. Caveat

- iOS butuh akun Apple Developer ($99/th); Play sekali $25. Capacitor sendiri gratis/open-source.
- Widget & Live Activity = kode native terpisah (fase lanjutan), bukan dari web.
- Pertahankan **web PWA tetap jalan** — static export untuk native, build PWA normal untuk web.
- Dexie/IndexedDB jalan normal di WebView Capacitor.

## 6. Fase

1. **A** — Setup Capacitor + static export + jalan di simulator (reuse semua kode).
2. **B** — `@capacitor/local-notifications`: adhan + reminder dzikir benar-benar terjadwal.
3. **C** — Haptics, geolocation, share native.
4. **D** — Widget home screen + Live Activity (kode native, terpisah).
5. **E** — Rilis TestFlight / internal testing Play.
