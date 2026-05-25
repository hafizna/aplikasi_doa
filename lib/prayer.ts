"use client";

import {
  CalculationMethod,
  Coordinates,
  Madhab,
  PrayerTimes,
  Qibla
} from "adhan";
import type { PrayerCalculationMethod, PrayerMadhab, PrayerLocation, UserSettings } from "@/lib/types/doa";

export type PrayerKey = "fajr" | "sunrise" | "dhuhr" | "asr" | "maghrib" | "isha";

export type PrayerRow = {
  key: PrayerKey;
  label: string;
  date: Date;
  isPrayer: boolean;
};

const methodLabels: Record<PrayerCalculationMethod, string> = {
  singapore: "Singapore / Asia Tenggara",
  muslimWorldLeague: "Muslim World League",
  ummAlQura: "Umm Al-Qura",
  egyptian: "Egyptian",
  karachi: "Karachi",
  dubai: "Dubai",
  qatar: "Qatar"
};

export const prayerCalculationOptions = Object.entries(methodLabels).map(([value, label]) => ({
  value: value as PrayerCalculationMethod,
  label
}));

export const prayerMadhabOptions: Array<{ value: PrayerMadhab; label: string }> = [
  { value: "shafi", label: "Syafi'i" },
  { value: "hanafi", label: "Hanafi" }
];

function getCalculationParameters(method: PrayerCalculationMethod) {
  const methodMap = {
    singapore: CalculationMethod.Singapore,
    muslimWorldLeague: CalculationMethod.MuslimWorldLeague,
    ummAlQura: CalculationMethod.UmmAlQura,
    egyptian: CalculationMethod.Egyptian,
    karachi: CalculationMethod.Karachi,
    dubai: CalculationMethod.Dubai,
    qatar: CalculationMethod.Qatar
  } satisfies Record<PrayerCalculationMethod, () => ReturnType<typeof CalculationMethod.Singapore>>;

  return methodMap[method]();
}

function getMadhab(madhab: PrayerMadhab) {
  return madhab === "hanafi" ? Madhab.Hanafi : Madhab.Shafi;
}

export function createPrayerTimes(settings: UserSettings, date = new Date()) {
  const location = settings.prayer.location;

  if (!location) {
    return null;
  }

  const coordinates = new Coordinates(location.latitude, location.longitude);
  const parameters = getCalculationParameters(settings.prayer.calculationMethod);
  parameters.madhab = getMadhab(settings.prayer.madhab);

  return new PrayerTimes(coordinates, date, parameters);
}

export function getPrayerRows(settings: UserSettings, date = new Date()): PrayerRow[] {
  const prayerTimes = createPrayerTimes(settings, date);

  if (!prayerTimes) {
    return [];
  }

  return [
    { key: "fajr", label: "Subuh", date: prayerTimes.fajr, isPrayer: true },
    { key: "sunrise", label: "Terbit", date: prayerTimes.sunrise, isPrayer: false },
    { key: "dhuhr", label: "Dzuhur", date: prayerTimes.dhuhr, isPrayer: true },
    { key: "asr", label: "Ashar", date: prayerTimes.asr, isPrayer: true },
    { key: "maghrib", label: "Maghrib", date: prayerTimes.maghrib, isPrayer: true },
    { key: "isha", label: "Isya", date: prayerTimes.isha, isPrayer: true }
  ];
}

export function getQiblaBearing(location?: PrayerLocation) {
  if (!location) {
    return null;
  }

  return Qibla(new Coordinates(location.latitude, location.longitude));
}

export function getNextPrayer(settings: UserSettings, now = new Date()) {
  const today = getPrayerRows(settings, now).filter((row) => row.isPrayer);
  const nextToday = today.find((row) => row.date.getTime() > now.getTime());

  if (nextToday) {
    return nextToday;
  }

  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return getPrayerRows(settings, tomorrow).filter((row) => row.isPrayer)[0] ?? null;
}

export function formatPrayerTime(date: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

export async function showPrayerNotification(title: string, body: string) {
  if (!("Notification" in window)) {
    throw new Error("Notification API tidak tersedia.");
  }

  const permission = await Notification.requestPermission();

  if (permission !== "granted") {
    throw new Error("Izin notifikasi belum diberikan.");
  }

  const registration = await navigator.serviceWorker?.ready;

  if (registration?.showNotification) {
    await registration.showNotification(title, {
      body,
      icon: "/icon.svg",
      tag: "munajat-prayer-time"
    });
    return;
  }

  new Notification(title, {
    body,
    icon: "/icon.svg"
  });
}
