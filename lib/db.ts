"use client";

import Dexie, { type Table } from "dexie";
import type {
  DzikirProgress,
  MunajatJournalEntry,
  MunajatExportData,
  TasbihHistoryEntry,
  UserSettings
} from "@/lib/types/doa";

const defaultSettings: UserSettings = {
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

const defaultProgress: DzikirProgress = {
  id: "dzikir-setelah-sholat",
  stepIndex: 0,
  counts: {},
  updatedAt: new Date().toISOString()
};

class MunajatDatabase extends Dexie {
  settings!: Table<UserSettings, string>;
  progress!: Table<DzikirProgress, string>;
  tasbihHistory!: Table<TasbihHistoryEntry, number>;
  munajatJournal!: Table<MunajatJournalEntry, number>;

  constructor() {
    super("munajat");
    this.version(1).stores({
      settings: "id",
      progress: "id",
      tasbihHistory: "++id, doaId, createdAt"
    });
    this.version(2).stores({
      settings: "id",
      progress: "id",
      tasbihHistory: "++id, doaId, createdAt",
      munajatJournal: "++id, status, createdAt, updatedAt"
    });
    this.version(3).stores({
      settings: "id",
      progress: "id",
      tasbihHistory: "++id, doaId, createdAt",
      munajatJournal: "++id, status, createdAt, updatedAt, encrypted"
    });
  }
}

export const db = new MunajatDatabase();

export async function getSettings() {
  const settings = await db.settings.get("settings");

  return {
    ...defaultSettings,
    ...settings,
    journalEncryption: {
      ...defaultSettings.journalEncryption,
      ...settings?.journalEncryption
    },
    prayer: {
      ...defaultSettings.prayer,
      ...settings?.prayer
    },
    notifications: {
      ...defaultSettings.notifications,
      ...settings?.notifications
    }
  };
}

export async function saveSettings(settings: UserSettings) {
  await db.settings.put(settings);
  return settings;
}

export async function getDzikirProgress() {
  return (await db.progress.get("dzikir-setelah-sholat")) ?? defaultProgress;
}

export async function saveDzikirProgress(progress: DzikirProgress) {
  const nextProgress = {
    ...progress,
    updatedAt: new Date().toISOString()
  };

  await db.progress.put(nextProgress);
  return nextProgress;
}

export async function resetDzikirProgress() {
  const nextProgress = {
    ...defaultProgress,
    updatedAt: new Date().toISOString()
  };

  await db.progress.put(nextProgress);
  return nextProgress;
}

export async function addTasbihHistory(entry: Omit<TasbihHistoryEntry, "id" | "createdAt">) {
  await db.tasbihHistory.add({
    ...entry,
    createdAt: new Date().toISOString()
  });
}

export async function getJournalEntries() {
  return db.munajatJournal.orderBy("updatedAt").reverse().toArray();
}

export async function addJournalEntry(entry: Omit<MunajatJournalEntry, "id" | "createdAt" | "updatedAt" | "status">) {
  const now = new Date().toISOString();
  const id = await db.munajatJournal.add({
    ...entry,
    status: "active",
    createdAt: now,
    updatedAt: now
  });

  const savedEntry = await db.munajatJournal.get(id);

  if (!savedEntry) {
    throw new Error("Journal entry was not saved.");
  }

  return savedEntry;
}

export async function markJournalAnswered(id: number) {
  const now = new Date().toISOString();
  await db.munajatJournal.update(id, {
    status: "answered",
    updatedAt: now,
    answeredAt: now
  });

  return getJournalEntries();
}

export async function deleteJournalEntry(id: number) {
  await db.munajatJournal.delete(id);
  return getJournalEntries();
}

export async function putJournalEntries(entries: MunajatJournalEntry[]) {
  await db.munajatJournal.bulkPut(entries);
  return getJournalEntries();
}

export async function getTasbihHistory() {
  return db.tasbihHistory.orderBy("createdAt").reverse().toArray();
}

export async function exportLocalData(): Promise<MunajatExportData> {
  const [settings, progress, tasbihHistory, journal] = await Promise.all([
    getSettings(),
    db.progress.toArray(),
    db.tasbihHistory.toArray(),
    db.munajatJournal.toArray()
  ]);

  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    settings,
    progress,
    tasbihHistory,
    journal
  };
}

export async function importLocalData(data: MunajatExportData) {
  await db.transaction("rw", db.settings, db.progress, db.tasbihHistory, db.munajatJournal, async () => {
    await db.settings.put(data.settings);
    await db.progress.clear();
    await db.progress.bulkPut(data.progress);
    await db.tasbihHistory.clear();
    await db.tasbihHistory.bulkPut(data.tasbihHistory);
    await db.munajatJournal.clear();
    await db.munajatJournal.bulkPut(data.journal);
  });
}
