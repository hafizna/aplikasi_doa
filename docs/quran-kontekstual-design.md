# Rancangan: Quran Kontekstual (bukan mushaf clone)

> Status: **rancangan**. Prinsip: Quran sebagai *pemeran pendukung* identitas "pendamping
> ibadah yang memandu" — bukan reference library yang berkompetisi dengan Quran.com/Muslim Pro.

## 1. Posisi produk

Jangan tampilkan 604 halaman mushaf lalu menang-kalah soal kelengkapan. Sebaliknya:
**munculkan ayat/surat yang relevan dengan konteks user** (waktu, hari, sholat, kalender,
mood/hajat), dengan **tadabbur** singkat. Ini melanjutkan mesin yang sudah ada
([lib/curation.ts](../lib/curation.ts), [lib/prayer.ts](../lib/prayer.ts),
[lib/seasonal-events.ts](../lib/seasonal-events.ts), [lib/hijri-calendar.ts](../lib/hijri-calendar.ts)).

## 2. Konten: subset terkurasi, bukan seluruh mushaf

Bundle **subset surat/ayat pilihan** sebagai JSON offline di `data/quran/`, bukan seluruh 114
surat. Cukup yang punya konteks amalan:

- Al-Kahf (Jumat), Al-Mulk (sebelum tidur), As-Sajdah, Ar-Rahman, Al-Waqi'ah, Yasin
- Muawwidzat (Al-Ikhlas/Falaq/Nas — sudah ada teksnya di dzikir), Ayat Kursi (sudah ada)
- Ayat-ayat tematik (doa dalam Quran — sebagian sudah jadi entri `doa-tematik`)

Sumber teks **terbuka & resmi** (jangan ketik manual): teks Arab Tanzil/King Fahd, terjemah
Kemenag (open). Mushaf penuh (kalau nanti perlu) → **streaming via Quran.com API** yang sudah
dipakai di [lib/audio.ts](../lib/audio.ts), dengan Cache API untuk offline selektif.

Skema (selaras `Doa` agar bisa reuse `DoaContent`/audio):

```ts
type QuranPassage = {
  id: string;              // "quran-al-kahf"
  surah: number;           // 18
  nama: string;            // "Al-Kahf"
  ayatRange?: [number, number];
  arab: string[];          // per ayat
  terjemah: string[];      // Kemenag
  tadabbur?: string;       // refleksi singkat (opsional, bersumber/aman)
  konteksTrigger: string[];// ["jumat","sebelum-tidur","ramadan",...]
  audio?: DoaAudio;        // provider quran.com (reuse)
};
```

## 3. Mesin rekomendasi kontekstual

`lib/quran-context.ts`:

```ts
getContextualReadings(now, settings): QuranPassage[]
```

Aturan deterministik (no AI generation, sesuai aturan prompt):
- **Hari Jumat** (cek `Date.getDay()===5` / hijri) → Al-Kahf.
- **Malam / setelah Isya** (pakai `getPrayerRows` dari [lib/prayer.ts](../lib/prayer.ts)) → Al-Mulk.
- **Setelah Subuh** → As-Sajdah/Yasin (opsional).
- **Event musiman** ([lib/seasonal-events.ts](../lib/seasonal-events.ts)) → surat terkait (Ramadan, Arafah).
- **Mood/hajat** ([lib/curation.ts](../lib/curation.ts)) → ayat doa relevan (nyambung "Doa Sesuai Hati").

## 4. UI

- Banner di home (pola sama dengan [components/seasonal-banner.tsx](../components/seasonal-banner.tsx)):
  "🕌 Hari Jumat — baca Al-Kahfi" → buka reader.
- Route baru `app/quran/page.tsx` + `components/quran-reader.tsx`: render `QuranPassage`
  pakai `arabic-text` styling yang ada + `AudioPlayer` (reuse).
- **Tadabbur**: tampilkan refleksi singkat di bawah ayat (toggle, seperti latin/terjemah).

## 5. Fase

1. **A** — `data/quran/*.json` subset + reader + audio (reuse). Murni offline.
2. **B** — `lib/quran-context.ts` + banner kontekstual di home.
3. **C** — Tadabbur prompt + integrasi ke "Doa Sesuai Hati" (ayat menyertai paket doa).
4. **D (opsional)** — Mushaf penuh via Quran.com API streaming + cache, **bukan** bundled.

## 6. Penjagaan prinsip

- Offline-first: subset terbundel; mushaf penuh online + cache.
- Tanpa fabrikasi: teks dari sumber resmi; tadabbur ringkas dari sumber tepercaya, beri sumber.
- Free tier: konten statis; API Quran.com gratis & client-side → nol beban server.
