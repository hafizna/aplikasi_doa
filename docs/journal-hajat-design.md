# Rancangan: Perdalam Journal Hajat (Munajat Personal)

> Status: **rancangan**. Journal hajat adalah **diferensiator emosional** yang langka di
> pasar. Tujuan: kembangkan dari sekadar catatan jadi pendamping doa yang personal — tetap
> *anti-guilt* dan privacy-first.

## 1. Kondisi sekarang

[components/journal-panel.tsx](../components/journal-panel.tsx) +
[lib/store/munajat-store.ts](../lib/store/munajat-store.ts): hajat punya `title`, `body`,
`mood`, `tags`, `status` (`active`/`answered`), enkripsi opsional. Bisa tandai "dikabulkan"
→ section "Alhamdulillah, sudah dikabulkan". Solid sebagai fondasi.

## 2. Penambahan (skema)

Tambah field opsional ke `MunajatJournalEntry` di [lib/types/doa.ts](../lib/types/doa.ts):

```ts
hopeKey?: HopeKey;        // jodoh|keturunan|rezeki|kesembuhan|ilmu|pekerjaan|lainnya (reuse curation.ts)
lastPrayedAt?: string;    // kapan terakhir didoakan
prayedCount?: number;     // berapa kali didoakan (opt-in, BUKAN streak yang menghakimi)
gratitudeNote?: string;   // catatan syukur saat dikabulkan
reminderEnabled?: boolean;// pengingat lembut untuk hajat ini
```

Dexie naik ke **version(4)** di [lib/db.ts](../lib/db.ts) (mis. index `hopeKey`). Migrasi
aman karena field opsional.

> **Penting (enkripsi):** sekarang hanya `title`+`body` yang dienkripsi
> (`encryptJournalEntry`). `gratitudeNote` itu sensitif → masukkan ke payload terenkripsi
> yang sama. Field non-sensitif (`hopeKey`, `prayedCount`, `lastPrayedAt`) boleh plaintext.

## 3. Fitur

1. **Kategori hajat (`hopeKey`)** → filter journal + **tautkan ke doa relevan**: buka satu
   hajat → tampilkan paket doa ma'tsur terkait via `curateDoaPackage`
   ([lib/curation.ts](../lib/curation.ts)). "Hajat jodoh → ini doa yang bisa kamu baca."
2. **"Doakan lagi"** → tombol yang menaikkan `prayedCount` + set `lastPrayedAt`, lalu
   langsung membuka doa terkait. Counter ditampilkan **lembut & opt-in** ("sudah didoakan
   12 kali"), tanpa guilt kalau jeda lama. Sesuai aturan prompt #6.
3. **Alur syukur saat dikabulkan** → saat tandai "answered", minta `gratitudeNote` singkat +
   sarankan sujud syukur / bacaan "Alhamdulillah". Perkuat section syukur yang sudah ada.
4. **Pengingat lembut (`reminderEnabled`)** → terhubung ke notifikasi terjadwal (lihat
   [native-capacitor-design.md](native-capacitor-design.md)); di web tetap opt-in & terbatas.
5. **Statistik lembut** → "X hajat sedang didoakan, Y dikabulkan" + riwayat. Bukan ranking,
   bukan streak menghakimi.

## 4. UI

- Perluas [components/journal-panel.tsx](../components/journal-panel.tsx): badge kategori,
  tombol "Doakan lagi", `prayedCount`, dan tautan doa terkait.
- Saat menulis hajat di [components/mood-curation-client.tsx](../components/mood-curation-client.tsx),
  simpan `hopeKey` dari jawaban check-in (sudah ada `HopeKey` di curation).
- Halaman journal khusus (opsional) bila panel terasa sempit.

## 5. Penjagaan prinsip

- **Privacy**: semua lokal; field sensitif ikut enkripsi journal yang ada; siap untuk sync
  E2E ([sync-e2e-design.md](sync-e2e-design.md)).
- **Anti-guilt**: counter & reminder selalu opt-in, framing lembut, tanpa "kamu belum...".
- **Offline & free tier**: murni IndexedDB, nol server.

## 6. Fase

1. **A** — Skema v4 + simpan `hopeKey` dari check-in + filter kategori.
2. **B** — "Doakan lagi" + tautan ke `curateDoaPackage`.
3. **C** — Alur syukur + `gratitudeNote` (terenkripsi).
4. **D** — Pengingat lembut (sinkron dengan jalur native).
