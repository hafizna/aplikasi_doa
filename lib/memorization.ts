import { allDoa, dzikirAfterPrayer, thematicDoa } from "@/lib/data/doa";
import type { Doa, MemorizationProgress } from "@/lib/types/doa";

export const memorizationCandidates = [
  ...dzikirAfterPrayer.filter((doa) => (doa.arab.length <= 420 || doa.pengulangan) && doa.sumber.jenis !== "atsar"),
  ...thematicDoa.filter((doa) => doa.arab.length <= 520)
];

export function getMemorizationDoa(id: string) {
  return allDoa.find((doa) => doa.id === id);
}

export function getMemorizationProgress(progress: MemorizationProgress[], doaId: string) {
  return progress.find((item) => item.doaId === doaId);
}

export function getMemorizationLabel(progress?: MemorizationProgress) {
  if (!progress) {
    return "Belum mulai";
  }

  if (progress.status === "memorized") {
    return "Sudah lancar";
  }

  if (progress.status === "reviewing") {
    return "Perlu murajaah";
  }

  return "Sedang belajar";
}

export function getDueMemorization(progress: MemorizationProgress[], date = new Date()) {
  return progress.filter((item) => new Date(item.dueAt).getTime() <= date.getTime());
}

function getFirstLetters(text: string) {
  return text
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0])
    .join(" ");
}

function maskEveryOtherWord(text: string) {
  return text
    .split(/\s+/)
    .map((word, index) => (index % 2 === 0 ? word : "____"))
    .join(" ");
}

export function getArabicPrompt(doa: Doa, helpMode: "full" | "masked" | "firstLetters" | "hidden") {
  if (helpMode === "full") {
    return doa.arab;
  }

  if (helpMode === "masked") {
    return maskEveryOtherWord(doa.arab);
  }

  if (helpMode === "firstLetters") {
    return getFirstLetters(doa.arab);
  }

  return "";
}
