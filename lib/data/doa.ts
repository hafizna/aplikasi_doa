import dzikirAfterPrayerData from "@/data/doa/dzikir-setelah-sholat.json";
import seasonalData from "@/data/doa/musiman.json";
import thematicData from "@/data/doa/tematik.json";
import type { Doa, DzikirFlowStep } from "@/lib/types/doa";

export const dzikirAfterPrayer = dzikirAfterPrayerData as Doa[];
export const thematicDoa = thematicData as Doa[];
export const seasonalDoa = seasonalData as Doa[];
export const allDoa = [...dzikirAfterPrayer, ...thematicDoa, ...seasonalDoa];

export const dzikirAfterPrayerFlow: DzikirFlowStep[] = [
  { doaId: "dzikir-setelah-sholat-istighfar", mode: "counter", target: 3 },
  { doaId: "dzikir-setelah-sholat-allahumma-antas-salam", mode: "read" },
  { doaId: "dzikir-setelah-sholat-la-ilaha-illallah-wahdahu", mode: "read" },
  { doaId: "dzikir-setelah-sholat-la-mania", mode: "read" },
  { doaId: "quran-ayat-kursi", mode: "read" },
  { doaId: "quran-al-ikhlas", mode: "read" },
  { doaId: "quran-al-falaq", mode: "read" },
  { doaId: "quran-an-nas", mode: "read" },
  { doaId: "dzikir-setelah-sholat-tasbih-33", mode: "counter", target: 33 },
  { doaId: "dzikir-setelah-sholat-tahmid-33", mode: "counter", target: 33 },
  { doaId: "dzikir-setelah-sholat-takbir-33", mode: "counter", target: 33 },
  { doaId: "dzikir-setelah-sholat-penutup-seratus", mode: "read" },
  { doaId: "dzikir-setelah-sholat-allahumma-ainni", mode: "read" },
  { doaId: "quran-rabbana-atina", mode: "read" }
];

export function getDoaById(id: string) {
  return allDoa.find((doa) => doa.id === id);
}

export function getDzikirFlowItems() {
  return dzikirAfterPrayerFlow.map((step) => {
    const doa = getDoaById(step.doaId);

    if (!doa) {
      throw new Error(`Missing doa for flow step: ${step.doaId}`);
    }

    return {
      ...step,
      target: step.target ?? doa.pengulangan ?? undefined,
      doa
    };
  });
}
