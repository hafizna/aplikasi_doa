export type QuranContextTrigger = "jumat" | "malam" | "pagi" | "umum";

export type QuranPassage = {
  id: string;
  surah: number;
  nama: string;
  arti: string;
  ayatCount: number;
  deskripsi: string;
  sumber?: string;
  konteks: QuranContextTrigger[];
};

export const quranPassages: QuranPassage[] = [
  {
    id: "al-kahf",
    surah: 18,
    nama: "Al-Kahf",
    arti: "Gua",
    ayatCount: 110,
    deskripsi: "Dianjurkan dibaca pada hari Jumat; menjadi cahaya bagi pembacanya di antara dua Jumat.",
    sumber: "HR. Al-Hakim, dishahihkan Al-Albani",
    konteks: ["jumat"]
  },
  {
    id: "al-mulk",
    surah: 67,
    nama: "Al-Mulk",
    arti: "Kerajaan",
    ayatCount: 30,
    deskripsi: "Dibaca menjelang tidur; surat yang memberi syafaat hingga diampuni, pelindung dari azab kubur.",
    sumber: "HR. Tirmidzi, hasan",
    konteks: ["malam"]
  },
  {
    id: "as-sajdah",
    surah: 32,
    nama: "As-Sajdah",
    arti: "Sujud",
    ayatCount: 30,
    deskripsi: "Nabi ﷺ tidak tidur sebelum membaca As-Sajdah dan Al-Mulk.",
    sumber: "HR. Tirmidzi",
    konteks: ["malam"]
  },
  {
    id: "ya-sin",
    surah: 36,
    nama: "Ya-Sin",
    arti: "Ya Sin",
    ayatCount: 83,
    deskripsi: "Sering dibaca di pagi hari sebagai perenungan; jantungnya Al-Qur'an.",
    konteks: ["pagi"]
  },
  {
    id: "ar-rahman",
    surah: 55,
    nama: "Ar-Rahman",
    arti: "Yang Maha Pengasih",
    ayatCount: 78,
    deskripsi: "Perenungan atas nikmat-nikmat Allah yang tak terhitung.",
    konteks: ["umum"]
  },
  {
    id: "al-waqiah",
    surah: 56,
    nama: "Al-Waqi'ah",
    arti: "Hari Kiamat",
    ayatCount: 96,
    deskripsi: "Pengingat tentang hari akhir dan golongan manusia di sisi Allah.",
    konteks: ["malam", "umum"]
  }
];

export function getPassageById(id: string) {
  return quranPassages.find((passage) => passage.id === id);
}

export function getActiveTriggers(now = new Date()): QuranContextTrigger[] {
  const triggers: QuranContextTrigger[] = [];
  const day = now.getDay();
  const hour = now.getHours();

  // Malam Jumat (Kamis maghrib) & hari Jumat.
  if (day === 5 || (day === 4 && hour >= 18)) {
    triggers.push("jumat");
  }

  if (hour >= 19 || hour < 4) {
    triggers.push("malam");
  }

  if (hour >= 4 && hour < 9) {
    triggers.push("pagi");
  }

  return triggers;
}

export function getContextualReadings(now = new Date()): QuranPassage[] {
  const triggers = getActiveTriggers(now);

  if (triggers.length === 0) {
    return [];
  }

  return quranPassages.filter((passage) => passage.konteks.some((trigger) => triggers.includes(trigger)));
}

export function getContextLabel(now = new Date()): string | null {
  const triggers = getActiveTriggers(now);

  if (triggers.includes("jumat")) {
    return "Hari Jumat — waktunya membaca Al-Kahfi";
  }

  if (triggers.includes("malam")) {
    return "Menjelang malam — bacaan penutup harimu";
  }

  if (triggers.includes("pagi")) {
    return "Pagi yang tenang — mulai dengan tilawah";
  }

  return null;
}
