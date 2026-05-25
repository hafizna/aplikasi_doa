import type { LocalNotificationSchema } from "@capacitor/local-notifications";
import { formatPrayerTime, getPrayerRows } from "@/lib/prayer";
import type { MunajatJournalEntry, UserSettings } from "@/lib/types/doa";

const SCHEDULE_DAYS = 3;
const HAJAT_REMINDER_HOUR = 20;

type CapacitorGlobal = { Capacitor?: { isNativePlatform?: () => boolean } };

// Capacitor menyuntikkan global `window.Capacitor` di runtime native. Memeriksanya
// langsung (tanpa import) memastikan @capacitor/* tidak pernah dimuat di web/PWA.
export function isNativePlatform(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  const cap = (window as CapacitorGlobal).Capacitor;
  return Boolean(cap?.isNativePlatform?.());
}

function addDays(base: Date, days: number) {
  const next = new Date(base);
  next.setDate(next.getDate() + days);
  next.setHours(0, 0, 0, 0);
  return next;
}

function setTime(base: Date, hour: number, minute = 0) {
  const next = new Date(base);
  next.setHours(hour, minute, 0, 0);
  return next;
}

/**
 * Bangun jadwal notifikasi lembut (adzan + dzikir pagi/petang + pengingat hajat)
 * untuk beberapa hari ke depan. Semua framing ajakan, bukan teguran.
 */
function buildSchedule(settings: UserSettings, journal: MunajatJournalEntry[]): LocalNotificationSchema[] {
  const now = Date.now();
  const items: LocalNotificationSchema[] = [];
  let id = 1;

  const hasReminderHajat = journal.some((entry) => entry.status === "active" && entry.reminderEnabled);

  for (let offset = 0; offset < SCHEDULE_DAYS; offset += 1) {
    const day = addDays(new Date(), offset);
    const rows = getPrayerRows(settings, day);

    if (settings.notifications.adhan) {
      rows
        .filter((row) => row.isPrayer)
        .forEach((row) => {
          const at = new Date(row.date.getTime() - settings.notifications.adhanBeforeMinutes * 60 * 1000);

          if (at.getTime() > now) {
            const prefix = settings.notifications.adhanBeforeMinutes > 0 ? "Menjelang" : "Waktunya";
            items.push({
              id: id++,
              title: `${prefix} ${row.label}`,
              body: `${row.label} pukul ${formatPrayerTime(row.date)}. Semoga Allah memudahkan.`,
              schedule: { at }
            });
          }
        });
    }

    if (settings.notifications.dzikirMorning) {
      const sunrise = rows.find((row) => row.key === "sunrise");
      const at = sunrise ? new Date(sunrise.date.getTime() - 20 * 60 * 1000) : setTime(day, 5, 30);

      if (at.getTime() > now) {
        items.push({
          id: id++,
          title: "Dzikir pagi",
          body: "Awali harimu dengan dzikir pagi yang menenangkan.",
          schedule: { at }
        });
      }
    }

    if (settings.notifications.dzikirEvening) {
      const asr = rows.find((row) => row.key === "asr");
      const at = asr ? asr.date : setTime(day, 16, 0);

      if (at.getTime() > now) {
        items.push({
          id: id++,
          title: "Dzikir petang",
          body: "Sempatkan dzikir petang sebelum hari berganti.",
          schedule: { at }
        });
      }
    }

    if (hasReminderHajat) {
      const at = setTime(day, HAJAT_REMINDER_HOUR, 0);

      if (at.getTime() > now) {
        items.push({
          id: id++,
          title: "Hajat dalam doamu",
          body: "Luangkan sejenak untuk memanjatkan hajat yang sedang kamu perjuangkan.",
          schedule: { at }
        });
      }
    }
  }

  return items;
}

/**
 * Sinkronkan notifikasi terjadwal di perangkat native. No-op di web/PWA
 * (notifikasi web terbatas; gunakan build native untuk pengingat andal).
 */
export async function syncReminders(settings: UserSettings, journal: MunajatJournalEntry[]): Promise<void> {
  if (!isNativePlatform()) {
    return;
  }

  const { LocalNotifications } = await import("@capacitor/local-notifications");

  const pending = await LocalNotifications.getPending();
  if (pending.notifications.length > 0) {
    await LocalNotifications.cancel({ notifications: pending.notifications.map((item) => ({ id: item.id })) });
  }

  if (!settings.notifications.enabled || !settings.prayer.location) {
    return;
  }

  const permission = await LocalNotifications.requestPermissions();
  if (permission.display !== "granted") {
    return;
  }

  const notifications = buildSchedule(settings, journal);
  if (notifications.length > 0) {
    await LocalNotifications.schedule({ notifications });
  }
}
