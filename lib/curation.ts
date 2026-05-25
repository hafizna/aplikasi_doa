import { allDoa, getDoaById, thematicDoa } from "@/lib/data/doa";
import type { Doa, HopeKey } from "@/lib/types/doa";

export type { HopeKey };
export type MoodKey = "tobat" | "berat" | "syukur" | "cemas" | "berharap" | "lainnya";
export type DurationKey = "singkat" | "cukup" | "bebas";

export type CurationAnswers = {
  mood: MoodKey | null;
  hope: HopeKey | null;
  duration: DurationKey | null;
  freeText: string;
};

export const moodOptions: Array<{ key: MoodKey; label: string; tags: string[] }> = [
  { key: "tobat", label: "Bersalah / butuh tobat", tags: ["tobat", "ampunan"] },
  { key: "berat", label: "Berat / banyak masalah", tags: ["kesulitan", "perlindungan"] },
  { key: "syukur", label: "Bersyukur / lega", tags: ["syukur", "dunia-akhirat"] },
  { key: "cemas", label: "Khawatir / cemas", tags: ["perlindungan", "kesulitan"] },
  { key: "berharap", label: "Berharap sesuatu", tags: ["dunia-akhirat"] },
  { key: "lainnya", label: "Lainnya", tags: ["dunia-akhirat", "quran"] }
];

export const hopeOptions: Array<{ key: HopeKey; label: string; tags: string[] }> = [
  { key: "jodoh", label: "Jodoh", tags: ["jodoh", "keluarga"] },
  { key: "keturunan", label: "Keturunan", tags: ["keturunan", "keluarga"] },
  { key: "rezeki", label: "Rezeki", tags: ["rezeki"] },
  { key: "kesembuhan", label: "Kesembuhan", tags: ["kesembuhan", "ruqyah"] },
  { key: "ilmu", label: "Ilmu / ujian", tags: ["ilmu", "amal"] },
  { key: "pekerjaan", label: "Pekerjaan", tags: ["rezeki", "kebutuhan"] },
  { key: "lainnya", label: "Lainnya", tags: ["dunia-akhirat", "quran"] }
];

export const durationOptions: Array<{ key: DurationKey; label: string; limit: number }> = [
  { key: "singkat", label: "5 menit - singkat", limit: 2 },
  { key: "cukup", label: "15 menit - cukup khusyuk", limit: 4 },
  { key: "bebas", label: "Bebas - sampai puas", limit: 6 }
];

function uniqueDoa(items: Doa[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.id)) {
      return false;
    }

    seen.add(item.id);
    return true;
  });
}

function scoreDoa(doa: Doa, tags: string[]) {
  return tags.reduce((score, tag) => (doa.tags.includes(tag) ? score + 1 : score), 0);
}

export function getTagsForAnswers(answers: CurationAnswers) {
  const moodTags = moodOptions.find((option) => option.key === answers.mood)?.tags ?? [];
  const hopeTags = hopeOptions.find((option) => option.key === answers.hope)?.tags ?? [];
  const inferredTags = answers.freeText
    .toLowerCase()
    .split(/\s+/)
    .flatMap((word) => {
      if (["sakit", "sembuh", "sehat"].includes(word)) return ["kesembuhan"];
      if (["kerja", "pekerjaan", "uang", "nafkah"].includes(word)) return ["rezeki"];
      if (["nikah", "jodoh"].includes(word)) return ["jodoh"];
      if (["anak", "keturunan"].includes(word)) return ["keturunan"];
      return [];
    });

  return Array.from(new Set([...moodTags, ...hopeTags, ...inferredTags]));
}

export function curateDoaPackage(answers: CurationAnswers) {
  const tags = getTagsForAnswers(answers);
  const limit = durationOptions.find((option) => option.key === answers.duration)?.limit ?? 3;

  const scored = thematicDoa
    .map((doa) => ({ doa, score: scoreDoa(doa, tags) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.doa.judul.localeCompare(b.doa.judul))
    .map((item) => item.doa);

  const fallbackIds = [
    "tematik-tobat-yunus",
    "tematik-rezeki-nabi-musa",
    "tematik-jodoh-keluarga-penyejuk",
    "quran-rabbana-atina"
  ];
  const fallback = fallbackIds
    .map((id) => getDoaById(id))
    .filter((doa): doa is Doa => Boolean(doa));

  const closing = allDoa.find((doa) => doa.id === "quran-rabbana-atina");
  const selected = uniqueDoa([...scored, ...fallback]).slice(0, limit);

  return uniqueDoa(closing ? [...selected, closing] : selected);
}
