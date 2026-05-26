import dzikirAfterPrayerData from "@/data/doa/dzikir-setelah-sholat.json";
import dzikirMorningData from "@/data/doa/dzikir-pagi.json";
import dzikirEveningData from "@/data/doa/dzikir-petang.json";
import closingData from "@/data/doa/doa-penutup.json";
import closingTraditionalData from "@/data/doa/doa-penutup-tradisi.json";
import sunnahClosingData from "@/data/doa/doa-sunnah-penutup.json";
import dailyData from "@/data/doa/harian.json";
import seasonalData from "@/data/doa/musiman.json";
import thematicData from "@/data/doa/tematik.json";
import type { ClosingStyle, Doa, DzikirFlowStep } from "@/lib/types/doa";

export const dzikirAfterPrayer = dzikirAfterPrayerData as Doa[];
export const dzikirMorning = dzikirMorningData as Doa[];
export const dzikirEvening = dzikirEveningData as Doa[];
export const closingDoa = closingData as Doa[];
export const closingTraditionalDoa = closingTraditionalData as Doa[];
export const sunnahClosingDoa = sunnahClosingData as Doa[];
export const dailyDoa = dailyData as Doa[];
export const thematicDoa = thematicData as Doa[];
export const seasonalDoa = seasonalData as Doa[];
export const allDoa = [
  ...dzikirAfterPrayer,
  ...dzikirMorning,
  ...dzikirEvening,
  ...closingDoa,
  ...closingTraditionalDoa,
  ...sunnahClosingDoa,
  ...dailyDoa,
  ...thematicDoa,
  ...seasonalDoa
];

// Inti dzikir setelah sholat — ma'tsur, disepakati (Bukhari/Muslim).
// Dibaca pada kedua gaya penutup.
const coreDzikirFlow: DzikirFlowStep[] = [
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
  { doaId: "dzikir-setelah-sholat-allahumma-ainni", mode: "read" }
];

// Penutup ma'tsur: rangkaian doa Qur'ani yang sumbernya pasti.
const closingMatsurFlow: DzikirFlowStep[] = [
  { doaId: "quran-rabbana-atina", mode: "read" },
  { doaId: "doa-penutup-rabbana-hablana", mode: "read" },
  { doaId: "doa-penutup-rabbanaghfirli", mode: "read" },
  { doaId: "doa-penutup-rabbana-taqabbal", mode: "read" }
];

// Penutup tradisi: rangkaian doa panjang bersambung (jumhur/NU), berlabel.
const closingTraditionalFlow: DzikirFlowStep[] = [
  { doaId: "doa-tradisi-pembuka-hamdalah", mode: "read" },
  { doaId: "doa-tradisi-shalawat", mode: "read" },
  { doaId: "doa-tradisi-salamatan-fid-din", mode: "read" },
  { doaId: "doa-tradisi-doa-orang-tua", mode: "read" },
  { doaId: "quran-rabbana-atina", mode: "read" },
  { doaId: "doa-tradisi-penutup-shaffat", mode: "read" }
];

export const closingFlows: Record<ClosingStyle, DzikirFlowStep[]> = {
  matsur: closingMatsurFlow,
  tradisi: closingTraditionalFlow
};

// Doa sunnah ma'tsur tambahan (opsional) — semua shahih, diajarkan Nabi ﷺ
// untuk dibaca selepas sholat. Disisipkan antara inti dzikir dan penutup.
const sunnahClosingFlow: DzikirFlowStep[] = sunnahClosingDoa.map((doa) => ({
  doaId: doa.id,
  mode: "read"
}));

export const closingDoaIds = closingDoa.map((doa) => doa.id);
export const closingTraditionalDoaIds = closingTraditionalDoa.map((doa) => doa.id);

export function getDoaById(id: string) {
  return allDoa.find((doa) => doa.id === id);
}

export function getDzikirFlowItems(closingStyle: ClosingStyle = "matsur", includeSunnahDoa = false) {
  const flow = [
    ...coreDzikirFlow,
    ...(includeSunnahDoa ? sunnahClosingFlow : []),
    ...closingFlows[closingStyle]
  ];

  return flow.map((step) => {
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
