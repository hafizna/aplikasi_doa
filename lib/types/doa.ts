export type KategoriDoa =
  | "dzikir-setelah-sholat"
  | "dzikir-pagi"
  | "dzikir-petang"
  | "doa-harian"
  | "doa-tematik"
  | "doa-musiman"
  | "munajat-personal";

export type SumberDoa = {
  jenis: "quran" | "hadis" | "atsar";
  referensi: string;
  derajat?: "shahih" | "hasan" | "dhaif";
  kitabSumber?: string;
};

export type DoaAudio =
  | {
      provider: "quran.com";
      recitationId: number;
      verseKeys: string[];
      reciter: string;
    }
  | {
      provider: "static";
      url: string;
      reciter?: string;
    };

export type Doa = {
  id: string;
  judul: string;
  kategori: KategoriDoa;
  arab: string;
  latin: string;
  terjemah: string;
  pengulangan: number | null;
  sumber: SumberDoa;
  audioUrl?: string;
  audio?: DoaAudio;
  tags: string[];
  keutamaan?: string;
  konteks?: string;
  catatanVerifikasi?: string;
};

export type DzikirStepMode = "counter" | "read";

export type DzikirFlowStep = {
  doaId: string;
  mode: DzikirStepMode;
  target?: number;
};

export type UserSettings = {
  id: "settings";
  arabicFontSize: number;
  showLatin: boolean;
  showTranslation: boolean;
  theme: "light" | "dark" | "auto";
  journalEncryption: {
    enabled: boolean;
    salt?: string;
  };
  notifications: {
    enabled: boolean;
    dzikirMorning: boolean;
    dzikirEvening: boolean;
    specialDays: boolean;
  };
};

export type DzikirProgress = {
  id: "dzikir-setelah-sholat";
  stepIndex: number;
  counts: Record<string, number>;
  completedAt?: string;
  updatedAt: string;
};

export type TasbihHistoryEntry = {
  id?: number;
  doaId: string;
  label: string;
  count: number;
  createdAt: string;
};

export type MunajatJournalStatus = "active" | "answered";

export type MunajatJournalEntry = {
  id?: number;
  title: string;
  body: string;
  mood: string;
  tags: string[];
  status: MunajatJournalStatus;
  createdAt: string;
  updatedAt: string;
  answeredAt?: string;
  encrypted?: boolean;
  iv?: string;
};

export type MunajatExportData = {
  version: 1;
  exportedAt: string;
  settings: UserSettings;
  progress: DzikirProgress[];
  tasbihHistory: TasbihHistoryEntry[];
  journal: MunajatJournalEntry[];
};
