import { allDoa, seasonalDoa } from "@/lib/data/doa";
import type { Doa } from "@/lib/types/doa";

export type SeasonalEventId =
  | "arafah"
  | "idul-adha-tasyrik"
  | "muharram"
  | "asyura"
  | "rajab"
  | "nisfu-syaban"
  | "ramadan"
  | "lailatul-qadar"
  | "senin-kamis"
  | "ayyamul-bidh"
  | "jumat";

export type SeasonalEvent = {
  id: SeasonalEventId;
  title: string;
  shortTitle: string;
  summary: string;
  detail: string;
  source: string;
  dateLabel: string;
  primaryDoaIds: string[];
  practices: string[];
  suggestion: string;
  note?: string;
};

export const seasonalEvents: SeasonalEvent[] = [
  {
    id: "arafah",
    title: "Hari Arafah",
    shortTitle: "Arafah",
    summary: "Hari utama untuk memperbanyak doa dan dzikir tauhid.",
    detail:
      "Hari Arafah jatuh pada 9 Dzulhijjah. Bagi yang tidak sedang berhaji, puasa Arafah memiliki keutamaan besar dan dzikir tauhid dianjurkan untuk diperbanyak.",
    source: "HR. Tirmidzi no. 3585; HR. Muslim no. 1162",
    dateLabel: "9 Dzulhijjah",
    primaryDoaIds: ["musiman-arafah-tahlil", "quran-rabbana-atina"],
    practices: [
      "Perbanyak doa dan dzikir tauhid.",
      "Puasa Arafah bagi yang tidak berhaji.",
      "Luangkan waktu khusus setelah Ashar atau menjelang Maghrib untuk munajat personal."
    ],
    suggestion: "Siapkan 15-30 menit untuk doa tenang, terutama di waktu sore."
  },
  {
    id: "idul-adha-tasyrik",
    title: "Idul Adha dan Hari Tasyrik",
    shortTitle: "Dzulhijjah",
    summary: "Hari makan, minum, dan berdzikir kepada Allah.",
    detail:
      "10 Dzulhijjah adalah Idul Adha, lalu 11-13 Dzulhijjah adalah hari Tasyrik. App tidak menambahkan ritual khusus di luar dzikir dan takbir yang ma'tsur.",
    source: "HR. Muslim no. 1141",
    dateLabel: "10-13 Dzulhijjah",
    primaryDoaIds: ["dzikir-setelah-sholat-takbir-33", "quran-rabbana-atina"],
    practices: [
      "Perbanyak dzikir dan takbir.",
      "Jangan berpuasa pada hari Tasyrik.",
      "Jadikan momen kurban sebagai pengingat syukur dan ketakwaan."
    ],
    suggestion: "Gunakan flow dzikir setelah sholat sebagai jangkar ibadah harian."
  },
  {
    id: "muharram",
    title: "Bulan Muharram",
    shortTitle: "Muharram",
    summary: "Bulan Allah yang utama untuk memperbanyak puasa sunnah.",
    detail:
      "Muharram termasuk bulan haram. Keutamaan yang kuat adalah memperbanyak puasa sunnah secara umum, bukan menetapkan doa khusus awal tahun.",
    source: "QS. At-Taubah: 36; HR. Muslim no. 1163",
    dateLabel: "Bulan Muharram",
    primaryDoaIds: ["quran-rabbana-atina", "tematik-tobat-yunus"],
    practices: [
      "Perbanyak puasa sunnah jika mampu.",
      "Jaga diri dari kezaliman, karena Muharram termasuk bulan haram.",
      "Gunakan doa Qurani umum untuk kebaikan dunia dan akhirat."
    ],
    suggestion: "Pilih satu hari puasa sunnah yang realistis, tanpa rasa bersalah bila belum mampu.",
    note: "Munajat tidak menetapkan doa khusus awal tahun Hijriah karena butuh verifikasi riwayat yang kuat."
  },
  {
    id: "asyura",
    title: "Hari Asyura",
    shortTitle: "Asyura",
    summary: "10 Muharram, hari yang dianjurkan untuk puasa sunnah.",
    detail:
      "Puasa Asyura disebutkan memiliki keutamaan penghapus dosa tahun sebelumnya. Dianjurkan pula menyelisihi Ahlul Kitab dengan berpuasa sehari sebelum atau sesudahnya menurut penjelasan ulama.",
    source: "HR. Muslim no. 1162 dan no. 1134",
    dateLabel: "10 Muharram",
    primaryDoaIds: ["musiman-ashura-puasa", "tematik-tobat-adam"],
    practices: [
      "Puasa Asyura jika mampu.",
      "Boleh menambah puasa 9 atau 11 Muharram.",
      "Perbanyak istighfar dan doa Qurani."
    ],
    suggestion: "Jika sedang tidak berpuasa, tetap gunakan hari ini untuk istighfar dan doa."
  },
  {
    id: "rajab",
    title: "Bulan Rajab",
    shortTitle: "Rajab",
    summary: "Salah satu bulan haram, tanpa paket amalan khusus yang tidak kuat sumbernya.",
    detail:
      "Rajab termasuk empat bulan haram. Munajat menampilkan pengingat umum untuk menjaga diri dan memperbanyak amal saleh, tanpa menetapkan doa atau ritual khusus Rajab.",
    source: "QS. At-Taubah: 36",
    dateLabel: "Bulan Rajab",
    primaryDoaIds: ["tematik-tobat-yunus", "quran-rabbana-atina"],
    practices: [
      "Perbanyak amal saleh yang umum.",
      "Jauhi kezaliman dan dosa.",
      "Jangan menganggap ada doa khusus Rajab tanpa sumber yang kuat."
    ],
    suggestion: "Gunakan Rajab sebagai momentum memperbaiki rutinitas dzikir harian.",
    note: "Catatan kehati-hatian: app tidak menampilkan riwayat dhaif sebagai anjuran khusus."
  },
  {
    id: "nisfu-syaban",
    title: "Nisfu Sya'ban",
    shortTitle: "Nisfu Sya'ban",
    summary: "Disajikan netral dengan catatan ikhtilaf ulama.",
    detail:
      "Sebagian ulama membahas keutamaan malam pertengahan Sya'ban, sementara rincian ritual tertentu diperselisihkan. Munajat tidak menetapkan doa atau sholat khusus.",
    source: "Disajikan sebagai catatan ikhtilaf; tidak ada ritual khusus yang ditetapkan app.",
    dateLabel: "15 Sya'ban",
    primaryDoaIds: ["tematik-tobat-adam", "quran-rabbana-atina"],
    practices: [
      "Perbanyak istighfar dan doa yang umum.",
      "Hindari mengaitkan bacaan tertentu dengan kepastian sumber bila belum jelas.",
      "Hormati ikhtilaf ulama tanpa saling menyalahkan."
    ],
    suggestion: "Baca doa taubat dan kebaikan dunia-akhirat sebagai munajat umum.",
    note: "App sengaja tidak menampilkan doa khusus Nisfu Sya'ban."
  },
  {
    id: "ramadan",
    title: "Bulan Ramadan",
    shortTitle: "Ramadan",
    summary: "Bulan puasa, Qur'an, doa, dan ampunan.",
    detail:
      "Saat Ramadan, Munajat menonjolkan doa berbuka, doa Qurani, dan pengingat memperbanyak ibadah dengan tenang.",
    source: "QS. Al-Baqarah: 183-185; HR. Abu Dawud no. 2357",
    dateLabel: "1-30 Ramadan",
    primaryDoaIds: ["musiman-berbuka-puasa", "quran-rabbana-atina", "tematik-tobat-sayyidul-istighfar"],
    practices: [
      "Jaga puasa dan sholat wajib.",
      "Perbanyak membaca Al-Qur'an.",
      "Gunakan waktu berbuka dan malam hari untuk doa."
    ],
    suggestion: "Simpan hajat personal Ramadan agar bisa dibaca ulang setiap malam."
  },
  {
    id: "lailatul-qadar",
    title: "Sepuluh Malam Terakhir Ramadan",
    shortTitle: "Lailatul Qadar",
    summary: "Perbanyak doa pemaafan pada malam-malam terakhir Ramadan.",
    detail:
      "Sepuluh malam terakhir Ramadan adalah waktu utama untuk mencari Lailatul Qadar. Doa yang diajarkan kepada Aisyah radhiyallahu 'anha adalah memohon pemaafan Allah.",
    source: "HR. Tirmidzi no. 3513; QS. Al-Qadr: 1-5",
    dateLabel: "21-30 Ramadan",
    primaryDoaIds: ["musiman-lailatul-qadar", "tematik-tobat-sayyidul-istighfar", "quran-rabbana-atina"],
    practices: [
      "Perbanyak doa Allahumma innaka 'afuwwun.",
      "Hidupkan malam dengan sholat, dzikir, Qur'an, dan munajat.",
      "Fokus pada malam ganjil tanpa meninggalkan malam lainnya."
    ],
    suggestion: "Buat paket 15 menit: istighfar, doa Lailatul Qadar, lalu munajat personal."
  },
  {
    id: "senin-kamis",
    title: "Senin dan Kamis",
    shortTitle: "Senin/Kamis",
    summary: "Hari yang dikenal untuk puasa sunnah dan pengangkatan amal.",
    detail:
      "Senin dan Kamis adalah hari yang sering dianjurkan untuk puasa sunnah. Munajat menampilkan pengingat lembut, bukan kewajiban.",
    source: "HR. Tirmidzi no. 747; HR. Muslim no. 1162",
    dateLabel: "Setiap Senin dan Kamis",
    primaryDoaIds: ["musiman-berbuka-puasa", "quran-rabbana-atina"],
    practices: [
      "Puasa sunnah bila mampu.",
      "Gunakan waktu berbuka untuk doa.",
      "Jika tidak berpuasa, tetap jaga dzikir harian."
    ],
    suggestion: "Bila sedang sibuk, cukup pilih satu doa pendek dan baca dengan hadir."
  },
  {
    id: "ayyamul-bidh",
    title: "Ayyamul Bidh",
    shortTitle: "Ayyamul Bidh",
    summary: "Tanggal 13, 14, dan 15 Hijriah untuk puasa sunnah.",
    detail:
      "Ayyamul Bidh adalah tiga hari pertengahan bulan Hijriah. App mengingatkan amalan puasa sunnah dan doa umum tanpa membuat bacaan khusus.",
    source: "HR. An-Nasa'i no. 2420; HR. Tirmidzi no. 761",
    dateLabel: "13-15 setiap bulan Hijriah",
    primaryDoaIds: ["musiman-berbuka-puasa", "quran-rabbana-atina"],
    practices: [
      "Puasa sunnah tanggal 13, 14, dan 15 Hijriah bila mampu.",
      "Catat hajat personal yang ingin dijaga selama tiga hari.",
      "Baca doa kebaikan dunia-akhirat sebagai penutup."
    ],
    suggestion: "Pilih target yang ringan: satu hari dulu juga baik bila tiga hari belum mampu."
  },
  {
    id: "jumat",
    title: "Hari Jumat",
    shortTitle: "Jumat",
    summary: "Perbanyak shalawat dan doa pada hari Jumat.",
    detail:
      "Hari Jumat memiliki banyak keutamaan. Munajat menonjolkan shalawat dan doa umum yang sumbernya jelas.",
    source: "HR. Abu Dawud no. 1047",
    dateLabel: "Setiap Jumat",
    primaryDoaIds: ["musiman-shalawat-jumat", "quran-rabbana-atina"],
    practices: [
      "Perbanyak shalawat.",
      "Luangkan waktu khusus untuk doa.",
      "Jaga adab Jumat dan sholat Jumat bagi laki-laki muslim yang wajib."
    ],
    suggestion: "Buka paket ini setelah Ashar atau sebelum Maghrib untuk munajat singkat."
  }
];

export function getSeasonalEvent(id: string) {
  return seasonalEvents.find((event) => event.id === id);
}

export function getSeasonalEventDoa(event: SeasonalEvent): Doa[] {
  return event.primaryDoaIds
    .map((id) => allDoa.find((doa) => doa.id === id) ?? seasonalDoa.find((doa) => doa.id === id))
    .filter((doa): doa is Doa => Boolean(doa));
}
