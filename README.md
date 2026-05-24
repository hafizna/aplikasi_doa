# Munajat

Munajat adalah Progressive Web App untuk dzikir setelah sholat, doa tematik, kalender-aware amalan musiman, audio bacaan Qur'an, dan journal munajat personal yang privacy-first.

## Fitur

- Next.js 14 App Router + TypeScript strict
- Tailwind CSS + komponen Radix/shadcn-style
- PWA offline-first via Serwist
- IndexedDB via Dexie untuk progress, settings, journal, dan statistik
- Guided dzikir setelah sholat dengan counter persistent
- Doa sesuai hati dengan kurasi deterministik dari database doa
- Jelajah doa dengan search/filter
- Kalender Hijriah offline dan halaman hari istimewa
- Audio player Qur'an via Quran.com API + Cache API untuk simpan offline
- Enkripsi journal opsional dengan Web Crypto
- Export/import JSON lokal

## Development

```bash
npm install
npm run dev
```

Buka `http://localhost:3000`.

## Checks

```bash
npm run typecheck
npm run lint
npm run build
```

## Deploy ke Vercel

Project ini siap di-import dari GitHub ke Vercel sebagai project Next.js.

Rekomendasi setting:

- Framework Preset: `Next.js`
- Install Command: `npm install`
- Build Command: `npm run build`
- Output Directory: biarkan default
- Node.js Version: `22.x`

Tidak ada environment variable wajib. Semua data user disimpan lokal di browser.

## Catatan Konten

Semua doa yang ditampilkan berasal dari seed database statis di `data/doa`. Aplikasi tidak menghasilkan teks doa baru. Untuk penambahan konten, sertakan sumber yang dapat dilacak dan prioritaskan riwayat shahih/hasan.
