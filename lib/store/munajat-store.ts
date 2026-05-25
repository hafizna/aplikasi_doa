"use client";

import { create } from "zustand";
import {
  addJournalEntry,
  addTasbihHistory,
  deleteJournalEntry,
  exportLocalData,
  getDzikirProgress,
  getJournalEntries,
  getSettings,
  getTasbihHistory,
  importLocalData,
  markJournalAnswered,
  putJournalEntries,
  resetDzikirProgress,
  saveDzikirProgress,
  saveSettings
} from "@/lib/db";
import { createSalt, decryptText, deriveJournalKey, encryptText } from "@/lib/crypto";
import type { DzikirProgress, MunajatExportData, MunajatJournalEntry, TasbihHistoryEntry, UserSettings } from "@/lib/types/doa";

type MunajatStore = {
  hydrated: boolean;
  settings: UserSettings;
  progress: DzikirProgress;
  journal: MunajatJournalEntry[];
  tasbihHistory: TasbihHistoryEntry[];
  journalLocked: boolean;
  cryptoKey: CryptoKey | null;
  hydrate: () => Promise<void>;
  updateSettings: (settings: Partial<Omit<UserSettings, "id">>) => Promise<void>;
  setStepIndex: (stepIndex: number) => Promise<void>;
  incrementCount: (doaId: string, label: string, target?: number) => Promise<number>;
  setCompleted: () => Promise<void>;
  resetProgress: () => Promise<void>;
  addMunajat: (entry: Omit<MunajatJournalEntry, "id" | "createdAt" | "updatedAt" | "status">) => Promise<void>;
  markMunajatAnswered: (id: number) => Promise<void>;
  deleteMunajat: (id: number) => Promise<void>;
  enableJournalEncryption: (password: string) => Promise<void>;
  unlockJournal: (password: string) => Promise<void>;
  lockJournal: () => Promise<void>;
  exportJson: () => Promise<string>;
  importJson: (json: string) => Promise<void>;
};

const fallbackSettings: UserSettings = {
  id: "settings",
  arabicFontSize: 30,
  showLatin: true,
  showTranslation: true,
  theme: "auto",
  closingStyle: "matsur",
  includeSunnahDoa: false,
  prayer: {
    calculationMethod: "singapore",
    madhab: "shafi"
  },
  journalEncryption: {
    enabled: false
  },
  notifications: {
    enabled: false,
    dzikirMorning: false,
    dzikirEvening: false,
    specialDays: false,
    adhan: false,
    adhanBeforeMinutes: 0
  }
};

const fallbackProgress: DzikirProgress = {
  id: "dzikir-setelah-sholat",
  stepIndex: 0,
  counts: {},
  updatedAt: new Date().toISOString()
};

function maskEncryptedJournal(entries: MunajatJournalEntry[]) {
  return entries.map((entry) =>
    entry.encrypted
      ? {
          ...entry,
          title: "Hajat terkunci",
          body: "Masukkan password journal untuk membuka isi munajat ini."
        }
      : entry
  );
}

async function encryptJournalEntry(entry: MunajatJournalEntry, key: CryptoKey) {
  if (entry.encrypted) {
    return entry;
  }

  const payload = JSON.stringify({
    title: entry.title,
    body: entry.body
  });
  const encrypted = await encryptText(payload, key);

  return {
    ...entry,
    title: encrypted.ciphertext,
    body: "",
    encrypted: true,
    iv: encrypted.iv
  };
}

async function decryptJournalEntry(entry: MunajatJournalEntry, key: CryptoKey) {
  if (!entry.encrypted) {
    return entry;
  }

  if (!entry.iv) {
    throw new Error("Encrypted journal entry is missing an IV.");
  }

  const decrypted = await decryptText(entry.title, entry.iv, key);
  const payload = JSON.parse(decrypted) as { title: string; body: string };

  return {
    ...entry,
    title: payload.title,
    body: payload.body
  };
}

async function loadJournalForState(settings: UserSettings, key: CryptoKey | null) {
  const rawJournal = await getJournalEntries();

  if (!settings.journalEncryption.enabled) {
    return {
      journal: rawJournal,
      locked: false
    };
  }

  if (!key) {
    return {
      journal: maskEncryptedJournal(rawJournal),
      locked: true
    };
  }

  return {
    journal: await Promise.all(rawJournal.map((entry) => decryptJournalEntry(entry, key))),
    locked: false
  };
}

export const useMunajatStore = create<MunajatStore>((set, get) => ({
  hydrated: false,
  settings: fallbackSettings,
  progress: fallbackProgress,
  journal: [],
  tasbihHistory: [],
  journalLocked: false,
  cryptoKey: null,
  hydrate: async () => {
    const [settings, progress, tasbihHistory] = await Promise.all([getSettings(), getDzikirProgress(), getTasbihHistory()]);
    const journalState = await loadJournalForState(settings, get().cryptoKey);
    set({ settings, progress, tasbihHistory, journal: journalState.journal, journalLocked: journalState.locked, hydrated: true });
  },
  updateSettings: async (settingsPatch) => {
    const nextSettings: UserSettings = {
      ...get().settings,
      ...settingsPatch,
      journalEncryption: {
        ...get().settings.journalEncryption,
        ...settingsPatch.journalEncryption
      },
      prayer: {
        ...get().settings.prayer,
        ...settingsPatch.prayer
      },
      notifications: {
        ...get().settings.notifications,
        ...settingsPatch.notifications
      }
    };

    await saveSettings(nextSettings);
    set({ settings: nextSettings });
  },
  setStepIndex: async (stepIndex) => {
    const nextProgress = await saveDzikirProgress({
      ...get().progress,
      stepIndex,
      completedAt: undefined
    });
    set({ progress: nextProgress });
  },
  incrementCount: async (doaId, label, target) => {
    const currentProgress = get().progress;
    const currentCount = currentProgress.counts[doaId] ?? 0;
    const nextCount = target ? Math.min(target, currentCount + 1) : currentCount + 1;
    const nextProgress = await saveDzikirProgress({
      ...currentProgress,
      counts: {
        ...currentProgress.counts,
        [doaId]: nextCount
      },
      completedAt: undefined
    });

    if (target && nextCount === target && currentCount < target) {
      await addTasbihHistory({ doaId, label, count: nextCount });
      const tasbihHistory = await getTasbihHistory();
      set({ tasbihHistory });
    }

    set({ progress: nextProgress });
    return nextCount;
  },
  setCompleted: async () => {
    const nextProgress = await saveDzikirProgress({
      ...get().progress,
      completedAt: new Date().toISOString()
    });
    set({ progress: nextProgress });
  },
  resetProgress: async () => {
    const nextProgress = await resetDzikirProgress();
    set({ progress: nextProgress });
  },
  addMunajat: async (entry) => {
    const state = get();
    const savedEntry = await addJournalEntry(entry);

    if (state.settings.journalEncryption.enabled) {
      if (!state.cryptoKey) {
        throw new Error("Journal is locked.");
      }

      await putJournalEntries([await encryptJournalEntry(savedEntry, state.cryptoKey)]);
    }

    const journalState = await loadJournalForState(state.settings, state.cryptoKey);
    set({ journal: journalState.journal, journalLocked: journalState.locked });
  },
  markMunajatAnswered: async (id) => {
    await markJournalAnswered(id);
    const journalState = await loadJournalForState(get().settings, get().cryptoKey);
    set({ journal: journalState.journal, journalLocked: journalState.locked });
  },
  deleteMunajat: async (id) => {
    await deleteJournalEntry(id);
    const journalState = await loadJournalForState(get().settings, get().cryptoKey);
    set({ journal: journalState.journal, journalLocked: journalState.locked });
  },
  enableJournalEncryption: async (password) => {
    const trimmedPassword = password.trim();

    if (trimmedPassword.length < 8) {
      throw new Error("Password minimal 8 karakter.");
    }

    const salt = createSalt();
    const key = await deriveJournalKey(trimmedPassword, salt);
    const rawJournal = await getJournalEntries();
    const encryptedJournal = await Promise.all(rawJournal.map((entry) => encryptJournalEntry(entry, key)));
    const nextSettings: UserSettings = {
      ...get().settings,
      journalEncryption: {
        enabled: true,
        salt
      }
    };

    await putJournalEntries(encryptedJournal);
    await saveSettings(nextSettings);
    const journalState = await loadJournalForState(nextSettings, key);
    set({
      settings: nextSettings,
      cryptoKey: key,
      journal: journalState.journal,
      journalLocked: journalState.locked
    });
  },
  unlockJournal: async (password) => {
    const salt = get().settings.journalEncryption.salt;

    if (!salt) {
      throw new Error("Salt enkripsi tidak ditemukan.");
    }

    const key = await deriveJournalKey(password, salt);
    const journalState = await loadJournalForState(get().settings, key);
    set({
      cryptoKey: key,
      journal: journalState.journal,
      journalLocked: journalState.locked
    });
  },
  lockJournal: async () => {
    const journalState = await loadJournalForState(get().settings, null);
    set({
      cryptoKey: null,
      journal: journalState.journal,
      journalLocked: journalState.locked
    });
  },
  exportJson: async () => {
    const data = await exportLocalData();
    return JSON.stringify(data, null, 2);
  },
  importJson: async (json) => {
    const parsed = JSON.parse(json) as MunajatExportData;

    if (parsed.version !== 1 || !parsed.settings || !Array.isArray(parsed.journal)) {
      throw new Error("Format import tidak dikenali.");
    }

    await importLocalData(parsed);
    set({ cryptoKey: null });
    await get().hydrate();
  }
}));
