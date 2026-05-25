"use client";

import { useEffect } from "react";
import { syncReminders } from "@/lib/notifications";
import { useMunajatStore } from "@/lib/store/munajat-store";

/**
 * Menjadwalkan ulang notifikasi native ketika settings/journal berubah.
 * Di web/PWA fungsi ini no-op (lihat lib/notifications.ts).
 */
export function NotificationSync() {
  const hydrated = useMunajatStore((state) => state.hydrated);
  const settings = useMunajatStore((state) => state.settings);
  const journal = useMunajatStore((state) => state.journal);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    void syncReminders(settings, journal);
  }, [hydrated, settings, journal]);

  return null;
}
