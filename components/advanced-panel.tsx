"use client";

import { Bell, Check, Download, FileUp, KeyRound, Lock, Shield, Unlock } from "lucide-react";
import { ChangeEvent, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useMunajatStore } from "@/lib/store/munajat-store";

function isToday(value: string) {
  const date = new Date(value);
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

function triggerDownload(filename: string, content: string) {
  const blob = new Blob([content], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

async function showTestNotification() {
  if (!("Notification" in window)) {
    throw new Error("Notification API tidak tersedia.");
  }

  const permission = await Notification.requestPermission();

  if (permission !== "granted") {
    throw new Error("Izin notifikasi belum diberikan.");
  }

  const registration = await navigator.serviceWorker?.ready;

  if (registration?.showNotification) {
    await registration.showNotification("Munajat", {
      body: "Notifikasi siap. Pengingat terjadwal membutuhkan dukungan browser/PWA.",
      icon: "/icon.svg"
    });
    return;
  }

  new Notification("Munajat", {
    body: "Notifikasi siap.",
    icon: "/icon.svg"
  });
}

export function AdvancedPanel() {
  const settings = useMunajatStore((state) => state.settings);
  const journal = useMunajatStore((state) => state.journal);
  const journalLocked = useMunajatStore((state) => state.journalLocked);
  const tasbihHistory = useMunajatStore((state) => state.tasbihHistory);
  const updateSettings = useMunajatStore((state) => state.updateSettings);
  const enableEncryption = useMunajatStore((state) => state.enableJournalEncryption);
  const unlockJournal = useMunajatStore((state) => state.unlockJournal);
  const lockJournal = useMunajatStore((state) => state.lockJournal);
  const exportJson = useMunajatStore((state) => state.exportJson);
  const importJson = useMunajatStore((state) => state.importJson);
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const stats = useMemo(() => {
    const activeHajat = journal.filter((entry) => entry.status === "active").length;
    const answeredHajat = journal.filter((entry) => entry.status === "answered").length;
    const tasbihToday = tasbihHistory.filter((entry) => isToday(entry.createdAt));
    const beadsToday = tasbihToday.reduce((sum, entry) => sum + entry.count, 0);

    return {
      activeHajat,
      answeredHajat,
      tasbihToday: tasbihToday.length,
      beadsToday
    };
  }, [journal, tasbihHistory]);

  const runWithStatus = (message: string, action: () => Promise<void>) => {
    setStatus("");
    void action()
      .then(() => {
        setPassword("");
        setStatus(message);
      })
      .catch((error: unknown) => {
        setStatus(error instanceof Error ? error.message : "Terjadi kesalahan.");
      });
  };

  const handleExport = () => {
    runWithStatus("Export selesai.", async () => {
      const json = await exportJson();
      triggerDownload(`munajat-export-${new Date().toISOString().slice(0, 10)}.json`, json);
    });
  };

  const handleImport = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    runWithStatus("Import selesai.", async () => {
      const json = await file.text();
      await importJson(json);
    });
    event.target.value = "";
  };

  const updateNotificationSetting = (patch: Partial<typeof settings.notifications>) => {
    void updateSettings({
      notifications: {
        ...settings.notifications,
        ...patch
      }
    });
  };

  return (
    <section className="grid gap-4">
      <Card className="p-5">
        <div className="flex items-center gap-3">
          <Shield className="h-5 w-5 text-primary" />
          <div>
            <h2 className="font-semibold">Privasi journal</h2>
            <p className="text-xs text-muted-foreground">Password tidak disimpan. Kalau lupa, journal terenkripsi tidak bisa dibuka.</p>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            className="h-11 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            placeholder="Password journal"
          />
          {settings.journalEncryption.enabled ? (
            journalLocked ? (
              <Button onClick={() => runWithStatus("Journal terbuka.", () => unlockJournal(password))}>
                <Unlock className="h-4 w-4" />
                Buka
              </Button>
            ) : (
              <Button variant="outline" onClick={() => runWithStatus("Journal terkunci.", lockJournal)}>
                <Lock className="h-4 w-4" />
                Kunci
              </Button>
            )
          ) : (
            <Button onClick={() => runWithStatus("Enkripsi aktif.", () => enableEncryption(password))}>
              <KeyRound className="h-4 w-4" />
              Aktifkan
            </Button>
          )}
        </div>
      </Card>

      <Card className="p-5">
        <h2 className="font-semibold">Export / import lokal</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          File export membawa settings, progress, statistik, dan journal. Jika journal terenkripsi, ciphertext ikut terbawa.
        </p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4" />
            Export JSON
          </Button>
          <label className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-md border px-5 text-sm font-medium hover:bg-secondary">
            <FileUp className="h-4 w-4" />
            Import JSON
            <input type="file" accept="application/json,.json" className="sr-only" onChange={handleImport} />
          </label>
        </div>
      </Card>

      <Card className="p-5">
        <div className="flex items-center gap-3">
          <Bell className="h-5 w-5 text-primary" />
          <div>
            <h2 className="font-semibold">Notifikasi</h2>
            <p className="text-xs text-muted-foreground">Default mati. PWA/browser menentukan dukungan pengingat latar belakang.</p>
          </div>
        </div>
        <div className="mt-4 grid gap-3">
          <label className="flex items-center justify-between gap-4">
            <span className="text-sm">Aktifkan preferensi notifikasi</span>
            <Switch
              checked={settings.notifications.enabled}
              onCheckedChange={(checked) => updateNotificationSetting({ enabled: checked })}
            />
          </label>
          <label className="flex items-center justify-between gap-4">
            <span className="text-sm">Dzikir pagi</span>
            <Switch
              checked={settings.notifications.dzikirMorning}
              onCheckedChange={(checked) => updateNotificationSetting({ dzikirMorning: checked })}
            />
          </label>
          <label className="flex items-center justify-between gap-4">
            <span className="text-sm">Dzikir petang</span>
            <Switch
              checked={settings.notifications.dzikirEvening}
              onCheckedChange={(checked) => updateNotificationSetting({ dzikirEvening: checked })}
            />
          </label>
          <label className="flex items-center justify-between gap-4">
            <span className="text-sm">Hari istimewa H-1</span>
            <Switch
              checked={settings.notifications.specialDays}
              onCheckedChange={(checked) => updateNotificationSetting({ specialDays: checked })}
            />
          </label>
          <Button variant="outline" className="w-fit" onClick={() => runWithStatus("Notifikasi test dikirim.", showTestNotification)}>
            <Bell className="h-4 w-4" />
            Test notifikasi
          </Button>
        </div>
      </Card>

      <Card className="p-5">
        <h2 className="font-semibold">Statistik lembut</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-4">
          <div className="rounded-md border bg-background/60 p-3">
            <p className="text-2xl font-semibold tabular-nums">{stats.tasbihToday}</p>
            <p className="text-xs text-muted-foreground">Sesi tasbih hari ini</p>
          </div>
          <div className="rounded-md border bg-background/60 p-3">
            <p className="text-2xl font-semibold tabular-nums">{stats.beadsToday}</p>
            <p className="text-xs text-muted-foreground">Hitungan selesai hari ini</p>
          </div>
          <div className="rounded-md border bg-background/60 p-3">
            <p className="text-2xl font-semibold tabular-nums">{stats.activeHajat}</p>
            <p className="text-xs text-muted-foreground">Hajat aktif</p>
          </div>
          <div className="rounded-md border bg-background/60 p-3">
            <p className="text-2xl font-semibold tabular-nums">{stats.answeredHajat}</p>
            <p className="text-xs text-muted-foreground">Sudah dikabulkan</p>
          </div>
        </div>
        <p className="mt-3 text-xs leading-5 text-muted-foreground">
          Angka ini hanya pengingat syukur dan refleksi, bukan penilaian ibadah.
        </p>
      </Card>

      {status ? (
        <p className="flex items-center gap-2 rounded-md border bg-card p-3 text-sm text-muted-foreground">
          <Check className="h-4 w-4 text-primary" />
          {status}
        </p>
      ) : null}
    </section>
  );
}
