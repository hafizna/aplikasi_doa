import { toHijri } from "hijri-converter";
import { getSeasonalEvent, type SeasonalEvent, type SeasonalEventId } from "@/lib/seasonal-events";

export type HijriDate = {
  year: number;
  month: number;
  day: number;
};

export type SeasonalSignal = {
  event: SeasonalEvent;
  timing: "today" | "tomorrow" | "tonight" | "month";
  priority: number;
  hijri: HijriDate;
  label: string;
};

const hijriMonthNames = [
  "Muharram",
  "Safar",
  "Rabiul Awal",
  "Rabiul Akhir",
  "Jumadil Awal",
  "Jumadil Akhir",
  "Rajab",
  "Syaban",
  "Ramadan",
  "Syawal",
  "Dzulqa'dah",
  "Dzulhijjah"
];

function getHijriDate(date: Date): HijriDate {
  const converted = toHijri(date.getFullYear(), date.getMonth() + 1, date.getDate());

  return {
    year: converted.hy,
    month: converted.hm,
    day: converted.hd
  };
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function event(id: SeasonalEventId) {
  const found = getSeasonalEvent(id);

  if (!found) {
    throw new Error(`Missing seasonal event: ${id}`);
  }

  return found;
}

function buildSignal(id: SeasonalEventId, timing: SeasonalSignal["timing"], priority: number, hijri: HijriDate) {
  const monthName = hijriMonthNames[hijri.month - 1] ?? `Bulan ${hijri.month}`;
  const timingLabel =
    timing === "tomorrow" ? "Besok" : timing === "tonight" ? "Malam ini" : timing === "month" ? "Bulan ini" : "Hari ini";

  return {
    event: event(id),
    timing,
    priority,
    hijri,
    label: `${timingLabel}, ${hijri.day} ${monthName} ${hijri.year} H`
  };
}

function getSignalsForHijriDate(hijri: HijriDate, timing: SeasonalSignal["timing"], weekday: number, hour: number) {
  const signals: SeasonalSignal[] = [];

  if (hijri.month === 12 && hijri.day === 9) {
    signals.push(buildSignal("arafah", timing, timing === "tomorrow" ? 95 : 100, hijri));
  }

  if (hijri.month === 12 && hijri.day >= 10 && hijri.day <= 13) {
    signals.push(buildSignal("idul-adha-tasyrik", timing, 92, hijri));
  }

  if (hijri.month === 1 && hijri.day === 1) {
    signals.push(buildSignal("muharram", timing, 75, hijri));
  }

  if (hijri.month === 1 && hijri.day === 10) {
    signals.push(buildSignal("asyura", timing, timing === "tomorrow" ? 88 : 94, hijri));
  }

  if (hijri.month === 7) {
    signals.push(buildSignal("rajab", "month", 42, hijri));
  }

  if (hijri.month === 8 && hijri.day === 15) {
    signals.push(buildSignal("nisfu-syaban", timing, 68, hijri));
  }

  if (hijri.month === 9) {
    signals.push(buildSignal("ramadan", "month", 84, hijri));
  }

  if (hijri.month === 9 && hijri.day >= 21) {
    signals.push(buildSignal("lailatul-qadar", timing, 96, hijri));
  }

  if (hijri.day >= 13 && hijri.day <= 15) {
    signals.push(buildSignal("ayyamul-bidh", timing, 55, hijri));
  }

  if (weekday === 1 || weekday === 4) {
    signals.push(buildSignal("senin-kamis", timing, 50, hijri));
  }

  if (weekday === 5 || (weekday === 4 && hour >= 18)) {
    signals.push(buildSignal("jumat", weekday === 4 ? "tonight" : timing, 60, hijri));
  }

  return signals;
}

export function getHijriDisplay(date = new Date()) {
  const hijri = getHijriDate(date);
  const monthName = hijriMonthNames[hijri.month - 1] ?? `Bulan ${hijri.month}`;
  return `${hijri.day} ${monthName} ${hijri.year} H`;
}

export function getSeasonalSignals(date = new Date()) {
  const todayHijri = getHijriDate(date);
  const tomorrow = addDays(date, 1);
  const tomorrowHijri = getHijriDate(tomorrow);
  const todaySignals = getSignalsForHijriDate(todayHijri, "today", date.getDay(), date.getHours());
  const tomorrowSignals = getSignalsForHijriDate(tomorrowHijri, "tomorrow", tomorrow.getDay(), 12).filter(
    (signal) => signal.priority >= 80
  );

  return [...todaySignals, ...tomorrowSignals].sort((a, b) => b.priority - a.priority);
}

export function getPrimarySeasonalSignal(date = new Date()) {
  return getSeasonalSignals(date)[0] ?? null;
}
