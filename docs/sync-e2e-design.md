# Rancangan: Sync Antar-Perangkat (End-to-End Encrypted)

> Status: **rancangan / belum diimplementasi**. Dokumen ini menjelaskan cara menambahkan
> sinkronisasi data antar-device tanpa mengkhianati prinsip *privacy-first* Munajat,
> dan tetap muat di **Vercel free tier (Hobby)**.

## 1. Konteks & batasan prinsip

Prompt awal Munajat melarang backend, akun, dan cloud sync — *privacy adalah fitur*.
Trade-off-nya: ganti HP = data hilang (dimitigasi export/import JSON manual di
[lib/db.ts](../lib/db.ts)).

Sync ini adalah **deviasi yang disengaja dan opt-in**, bukan default. Aturan main:

- **Default tetap 100% lokal & tanpa akun.** Sync hanya aktif jika user sengaja menyalakannya.
- **Zero-knowledge.** Server **tidak pernah** melihat teks asli — hanya menyimpan *ciphertext*.
  Secara teknis ini bukan "cloud yang membaca datamu"; server cuma brankas buta.
- **Passphrase tidak pernah meninggalkan device.** Hilang passphrase = data tak terpulihkan
  (sama seperti enkripsi journal yang sudah ada).
- Tampilkan layar **consent** yang jelas sebelum mengaktifkan: jelaskan apa yang dikirim
  (blob terenkripsi), apa yang tidak (kunci), dan konsekuensinya.

## 2. Ide inti

Sync = **export/import JSON yang sudah ada, tapi dienkripsi end-to-end dan diotomatiskan.**

`exportLocalData()` sudah menghasilkan `MunajatExportData` (settings, progress, tasbih,
journal). Alurnya:

```
push:  MunajatExportData → JSON → AES-GCM encrypt → { ciphertext, iv } → upsert ke server
pull:  fetch { ciphertext, iv } → AES-GCM decrypt → JSON → importLocalData()
```

Server hanya menyimpan `ciphertext` + `iv` + metadata non-rahasia (`updatedAt`, `version`).

## 3. Kriptografi (pakai ulang yang ada)

[lib/crypto.ts](../lib/crypto.ts) sudah punya semua primitifnya:

- `deriveJournalKey(passphrase, salt)` → PBKDF2 (210k iterasi, SHA-256) → AES-GCM 256-bit.
- `encryptText` / `decryptText` → AES-GCM, IV acak 12 byte.

Untuk sync:

1. User menetapkan **sync passphrase** (boleh sama atau beda dari password journal).
2. `salt` sync di-generate sekali (`createSalt()`), **boleh disimpan di server** (salt bukan rahasia).
3. Kunci sync = `deriveJournalKey(syncPassphrase, syncSalt)` — diturunkan **di device**, tak pernah dikirim.
4. Tiap push: `encryptText(JSON.stringify(exportData), key)` → kirim `{ ciphertext, iv }`.

> Catatan: journal yang sudah terenkripsi per-entri akan ter-enkripsi **dua lapis** (entri +
> blob). Itu tidak masalah; atau saat membangun payload sync, dekripsi dulu ke plaintext di
> memori lalu enkripsi sebagai satu blob. Pilih satu kebijakan dan konsisten.

## 4. Backend di Vercel free tier

Sync butuh dua hal: **identitas** (blob ini milik siapa) + **storage** (simpan blob).
Beban-nya kecil (blob ukuran KB, jarang ditulis), jadi semua opsi muat di free tier.

### Rekomendasi: Supabase (free tier)

- Auth bawaan (magic link / OAuth) + Postgres + Row Level Security. Gratis hingga batas wajar.
- Next.js di Vercel cukup pakai `@supabase/supabase-js` dari client; tak perlu server sendiri.
- RLS memastikan user hanya bisa baca/tulis barisnya sendiri — penting karena ini multi-user.

Skema minimal:

```sql
create table vaults (
  user_id     uuid primary key references auth.users(id) on delete cascade,
  ciphertext  text not null,
  iv          text not null,
  sync_salt   text not null,
  version     int  not null default 1,
  updated_at  timestamptz not null default now(),
  device_label text
);

alter table vaults enable row level security;

create policy "own vault" on vaults
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
```

### Alternatif (semua free-tier-friendly)

| Opsi | Catatan |
|---|---|
| **Vercel Postgres / Neon** | Postgres gratis; auth pakai Auth.js (NextAuth) terpisah. |
| **Turso (libSQL)** | SQLite terdistribusi, free tier besar. |
| **Upstash Redis/KV** | Cukup untuk 1 blob per user (key = userId). Paling ringan. |
| **Cloudflare R2 + KV** | Kalau mau lepas dari Vercel untuk storage. |

### Opsi identitas paling privacy-pure (tanpa email)

Daripada email (PII), pakai **sync code**: server generate `vault_id` (UUID acak) sebagai
"akun anonim". User menyimpan `vault_id` + passphrase di device lain untuk pulih. Tidak ada
PII di server sama sekali — hanya ciphertext + UUID. Trade-off: tak ada recovery via email.

## 5. Protokol sinkronisasi

Simpan `lastSyncedAt` lokal. Saat sync:

1. **Pull dulu**: ambil `{ updated_at, ciphertext, iv }` dari server.
2. Bandingkan `remote.updated_at` vs `lastSyncedAt`:
   - Remote lebih baru → decrypt → merge ke lokal → set `lastSyncedAt = remote.updated_at`.
   - Lokal lebih baru → lanjut ke push.
3. **Push**: encrypt `exportLocalData()` → `upsert` baris vault dengan `updated_at = now()`.

### Strategi konflik

- **v1 — last-write-wins (LWW)** per seluruh blob. Sederhana, cukup untuk 1 user 2 device
  yang jarang bentrok.
- **v2 — merge per-record** (lebih baik):
  - `munajatJournal`: gabung berdasar `id` + ambil `updatedAt` terbaru; entri "answered" menang.
  - `tasbihHistory`: union (append-only, dedup by id).
  - `settings` / `progress`: LWW by `updatedAt`.
  Merge ini berjalan **di device** setelah decrypt — server tetap buta.

## 6. Yang tetap lokal / jaminan privasi

- Passphrase & kunci turunannya: **hanya di device**.
- Server menyimpan: ciphertext, iv, salt, timestamp, (opsional) email/UUID. **Tidak ada teks doa, journal, atau hajat dalam bentuk terbaca.**
- Tidak ada analytics/telemetri (konsisten aturan prompt).
- Fitur bisa dimatikan kapan saja → hapus baris vault + lupakan kredensial lokal.

## 7. Kepatuhan Vercel free tier (Hobby)

- Payload KB-an, sync jarang → jauh di bawah batas eksekusi serverless function & 100GB bandwidth.
- Tidak perlu cron / background job.
- Hobby = **non-komersial**. Kalau app mau dimonetisasi, perlu naik ke Pro (tapi prompt
  justru melarang monetisasi yang mengganggu, jadi selaras).

## 8. Risiko & mitigasi

- **Kehilangan passphrase** → data tak terpulihkan. Mitigasi: peringatan jelas + dorong simpan
  recovery (export JSON lokal tetap ada).
- **Penyalahgunaan endpoint** → rate-limit + cap ukuran payload (mis. 1MB) di RLS/API.
- **Korelasi metadata** → minimalkan kolom; pakai opsi sync-code tanpa email bila ingin maksimal.
- **Perubahan posture privasi** → wajib opt-in + consent; jangan pernah nyala diam-diam.

## 9. Rencana implementasi bertahap

1. **Fase A — Crypto & payload**: fungsi `buildSyncPayload()` / `applySyncPayload()` di atas
   `exportLocalData`/`importLocalData` + `lib/crypto.ts`. Murni lokal, bisa diуji tanpa server.
2. **Fase B — Storage adapter**: interface `SyncBackend { pull(), push() }`; implementasi
   Supabase (atau Upstash). Simpan kredensial di IndexedDB (settings).
3. **Fase C — UI**: layar consent + setup passphrase + tombol "Sync sekarang" + status terakhir,
   ditambahkan ke [components/settings-panel.tsx](../components/settings-panel.tsx) atau
   [components/advanced-panel.tsx](../components/advanced-panel.tsx).
4. **Fase D — Auto-sync & merge**: sync saat app fokus/online + merge per-record (v2).

## 10. Keputusan yang perlu diambil sebelum koding

- Email (recoverable, ada PII) **vs** sync-code anonim (privacy maksimal, tak ada recovery)?
- Backend: Supabase (paling lengkap) vs Upstash (paling ringan)?
- Default konflik: LWW dulu, atau langsung merge per-record?

Setelah tiga keputusan ini disepakati, implementasi bisa langsung mengikuti Fase A→D.
