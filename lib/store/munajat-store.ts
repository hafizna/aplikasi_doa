"use client";

import { create } from "zustand";
import {
  addJournalEntry,
  addTasbihHistory,
  deleteJournalEntry,
  deleteMemorizationProgress,
  exportLocalData,
  getDzikirProgress,
  getJournalEntries,
  getMemorizationProgress,
  getSettings,
  getTasbihHistory,
  importLocalData,
  incrementPrayedCount,
  markJournalAnswered,
  putJournalEntries,
  resetDzikirProgress,
  saveDzikirProgress,
  saveSettings,
  setJournalGratitude,
  setJournalReminder,
  upsertMemorizationProgress
} from "@/lib/db";
import { createSalt, decryptText, deriveJournalKey, encryptText } from "@/lib/crypto";
import type {
  DzikirProgress,
  MemorizationProgress,
  MemorizationStatus,
  MunajatExportData,
  MunajatJournalEntry,
  TasbihHistoryEntry,
  UserSettings
} from "@/lib/types/doa";

type MunajatStore = {
  hydrated: boolean;
  settings: UserSettings;
  progress: DzikirProgress;
  journal: MunajatJournalEntry[];
  tasbihHistory: TasbihHistoryEntry[];
  memorization: MemorizationProgress[];
  journalLocked: boolean;
  cryptoKey: CryptoKey | null;
  hydrate: () => Promise<void>;
  updateSettings: (settings: Partial<Omit<UserSettings, "id">>) => Promise<void>;
  setStepIndex: (stepIndex: number) => Promise<void>;
  incrementCount: (doaId: string, label: string, target?: number) => Promise<number>;
  setCompleted: () => Promise<void>;
  resetProgress: () => Promise<void>;
  addMunajat: (entry: Omit<MunajatJournalEntry, "id" | "createdAt" | "updatedAt" | "status">) => Promise<void>;
  markMunajatAnswered: (id: number, gratitudeNote?: string) => Promise<void>;
  prayMunajatAgain: (id: number) => Promise<void>;
  setMunajatReminder: (id: number, enabled: boolean) => Promise<void>;
  deleteMunajat: (id: number) => Promise<void>;
  enableJournalEncryption: (password: string) => Promise<void>;
  unlockJournal: (password: string) => Promise<void>;
  lockJournal: () => Promise<void>;
  startMemorization: (doaId: string) => Promise<void>;
  reviewMemorization: (doaId: string, result: "again" | "almost" | "good") => Promise<void>;
  removeMemorization: (doaId: string) => Promise<void>;
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
          body: "Masukkan password journal untuk membuka isi munajat ini.",
          gratitudeNote: undefined
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
    body: entry.body,
    gratitudeNote: entry.gratitudeNote ?? ""
  });
  const encrypted = await encryptText(payload, key);

  return {
    ...entry,
    title: encrypted.ciphertext,
    body: "",
    gratitudeNote: undefined,
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
  const payload = JSON.parse(decrypted) as { title: string; body: string; gratitudeNote?: string };

  return {
    ...entry,
    title: payload.title,
    body: payload.body,
    gratitudeNote: payload.gratitudeNote || undefined
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
  memorization: [],
  journalLocked: false,
  cryptoKey: null,
  hydrate: async () => {
    const [settings, progress, tasbihHistory, memorization] = await Promise.all([
      getSettings(),
      getDzikirProgress(),
      getTasbihHistory(),
      getMemorizationProgress()
    ]);
    const journalState = await loadJournalForState(settings, get().cryptoKey);
    set({
      settings,
      progress,
      tasbihHistory,
      memorization,
      journal: journalState.journal,
      journalLocked: journalState.locked,
      hydrated: true
    });
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
  markMunajatAnswered: async (id, gratitudeNote) => {
    const state = get();
    const note = gratitudeNote?.trim();

    if (note && state.settings.journalEncryption.enabled) {
      if (!state.cryptoKey) {
        throw new Error("Journal terkunci. Buka kunci untuk menyimpan catatan syukur.");
      }

      const entry = state.journal.find((item) => item.id === id);

      if (!entry) {
        throw new Error("Hajat tidak ditemukan.");
      }

      const now = new Date().toISOString();
      const updated: MunajatJournalEntry = {
        ...entry,
        status: "answered",
        answeredAt: now,
        updatedAt: now,
        gratitudeNote: note,
        encrypted: false,
        iv: undefined
      };

      await putJournalEntries([await encryptJournalEntry(updated, state.cryptoKey)]);
    } else {
      await markJournalAnswered(id);

      if (note) {
        await setJournalGratitude(id, note);
      }
    }

    const journalState = await loadJournalForState(get().settings, get().cryptoKey);
    set({ journal: journalState.journal, journalLocked: journalState.locked });
  },
  prayMunajatAgain: async (id) => {
    await incrementPrayedCount(id);
    const journalState = await loadJournalForState(get().settings, get().cryptoKey);
    set({ journal: journalState.journal, journalLocked: journalState.locked });
  },
  setMunajatReminder: async (id, enabled) => {
    await setJournalReminder(id, enabled);
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
  startMemorization: async (doaId) => {
    const now = new Date().toISOString();
    const existing = get().memorization.find((item) => item.doaId === doaId);
    const nextProgress: MemorizationProgress = existing ?? {
      doaId,
      status: "learning",
      helpLevel: 0,
      reviewCount: 0,
      ease: 1,
      dueAt: now,
      createdAt: now,
      updatedAt: now
    };
    const memorization = await upsertMemorizationProgress({
      ...nextProgress,
      updatedAt: now
    });

    set({ memorization });
  },
  reviewMemorization: async (doaId, result) => {
    const now = new Date();
    const current = get().memorization.find((item) => item.doaId === doaId);
    const reviewCount = (current?.reviewCount ?? 0) + 1;
    const nextDue = new Date(now);
    let helpLevel = current?.helpLevel ?? 0;
    let status: MemorizationStatus = current?.status ?? "learning";
    let ease = current?.ease ?? 1;

    if (result === "again") {
      helpLevel = Math.max(0, helpLevel - 1);
      status = "learning";
      ease = Math.max(1, ease - 0.2);
      nextDue.setDate(now.getDate() + 1);
    }

    if (result === "almost") {
      helpLevel = Math.max(0, helpLevel);
      status = "reviewing";
      ease = Math.max(1, ease);
      nextDue.setDate(now.getDate() + Math.max(2, Math.round(2 * ease)));
    }

    if (result === "good") {
      helpLevel = Math.min(3, helpLevel + 1);
      status = reviewCount >= 3 ? "memorized" : "reviewing";
      ease = ease + 0.25;
      nextDue.setDate(now.getDate() + Math.max(3, Math.round(4 * ease)));
    }

    const memorization = await upsertMemorizationProgress({
      doaId,
      status,
      helpLevel,
      reviewCount,
      ease,
      dueAt: nextDue.toISOString(),
      lastReviewedAt: now.toISOString(),
      createdAt: current?.createdAt ?? now.toISOString(),
      updatedAt: now.toISOString()
    });

    set({ memorization });
  },
  removeMemorization: async (doaId) => {
    const memorization = await deleteMemorizationProgress(doaId);
    set({ memorization });
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
