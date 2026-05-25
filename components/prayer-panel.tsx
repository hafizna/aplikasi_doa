"use client";

import { Bell, Compass, Crosshair, LocateFixed, MapPin, Navigation, RotateCcw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  formatPrayerTime,
  getNextPrayer,
  getPrayerRows,
  getQiblaBearing,
  prayerCalculationOptions,
  prayerMadhabOptions,
  showPrayerNotification
} from "@/lib/prayer";
import { useMunajatStore } from "@/lib/store/munajat-store";
import type { PrayerCalculationMethod, PrayerMadhab, PrayerLocation } from "@/lib/types/doa";

type DeviceOrientationEventWithPermission = typeof DeviceOrientationEvent & {
  requestPermission?: () => Promise<PermissionState>;
};

type CompassEvent = DeviceOrientationEvent & {
  webkitCompassHeading?: number;
};

function formatCoordinate(value: number) {
  return new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 5
  }).format(value);
}

function normalizeDegree(value: number) {
  return ((value % 360) + 360) % 360;
}

function getManualLocation(latitude: string, longitude: string): PrayerLocation | null {
  const parsedLatitude = Number(latitude);
  const parsedLongitude = Number(longitude);

  if (
    Number.isNaN(parsedLatitude) ||
    Number.isNaN(parsedLongitude) ||
    parsedLatitude < -90 ||
    parsedLatitude > 90 ||
    parsedLongitude < -180 ||
    parsedLongitude > 180
  ) {
    return null;
  }

  return {
    latitude: parsedLatitude,
    longitude: parsedLongitude,
    label: "Lokasi manual",
    source: "manual",
    updatedAt: new Date().toISOString()
  };
}

export function PrayerPanel() {
  const settings = useMunajatStore((state) => state.settings);
  const updateSettings = useMunajatStore((state) => state.updateSettings);
  const [status, setStatus] = useState("");
  const [manualLatitude, setManualLatitude] = useState(settings.prayer.location?.latitude.toString() ?? "");
  const [manualLongitude, setManualLongitude] = useState(settings.prayer.location?.longitude.toString() ?? "");
  const [heading, setHeading] = useState<number | null>(null);
  const [now, setNow] = useState(() => new Date());
  const rows = useMemo(() => getPrayerRows(settings, now), [now, settings]);
  const nextPrayer = useMemo(() => getNextPrayer(settings, now), [now, settings]);
  const qiblaBearing = useMemo(() => getQiblaBearing(settings.prayer.location), [settings.prayer.location]);
  const arrowRotation = qiblaBearing === null ? 0 : normalizeDegree(qiblaBearing - (heading ?? 0));

  useEffect(() => {
    const interval = window.setInterval(() => setNow(new Date()), 30000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!settings.notifications.enabled || !settings.notifications.adhan || !nextPrayer) {
      return;
    }

    const notificationAt = nextPrayer.date.getTime() - settings.notifications.adhanBeforeMinutes * 60 * 1000;
    const delay = notificationAt - Date.now();

    if (delay < 0 || delay > 24 * 60 * 60 * 1000) {
      return;
    }

    const timeout = window.setTimeout(() => {
      const prefix = settings.notifications.adhanBeforeMinutes > 0 ? "Menjelang" : "Waktu";
      void showPrayerNotification(`${prefix} ${nextPrayer.label}`, `${nextPrayer.label} ${formatPrayerTime(nextPrayer.date)}.`);
    }, delay);

    return () => window.clearTimeout(timeout);
  }, [nextPrayer, settings.notifications.adhan, settings.notifications.adhanBeforeMinutes, settings.notifications.enabled]);

  const savePrayerSettings = (patch: Partial<typeof settings.prayer>) => {
    void updateSettings({
      prayer: {
        ...settings.prayer,
        ...patch
      }
    });
  };

  const saveNotificationSettings = (patch: Partial<typeof settings.notifications>) => {
    void updateSettings({
      notifications: {
        ...settings.notifications,
        ...patch
      }
    });
  };

  const useGps = () => {
    setStatus("");

    if (!navigator.geolocation) {
      setStatus("GPS tidak tersedia di browser ini.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location: PrayerLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          label: "Lokasi GPS",
          source: "gps",
          updatedAt: new Date().toISOString()
        };

        setManualLatitude(location.latitude.toString());
        setManualLongitude(location.longitude.toString());
        savePrayerSettings({ location });
        setStatus("Lokasi tersimpan. Jadwal dihitung lokal dari koordinat ini.");
      },
      () => setStatus("Izin lokasi ditolak atau lokasi belum bisa dibaca."),
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 15 * 60 * 1000
      }
    );
  };

  const saveManualLocation = () => {
    const location = getManualLocation(manualLatitude, manualLongitude);

    if (!location) {
      setStatus("Koordinat belum valid. Latitude -90 sampai 90, longitude -180 sampai 180.");
      return;
    }

    savePrayerSettings({ location });
    setStatus("Lokasi manual tersimpan.");
  };

  const enableCompass = () => {
    const orientationEvent = DeviceOrientationEvent as DeviceOrientationEventWithPermission;

    const startListening = () => {
      window.addEventListener("deviceorientation", (event: CompassEvent) => {
        if (typeof event.webkitCompassHeading === "number") {
          setHeading(event.webkitCompassHeading);
          return;
        }

        if (typeof event.alpha === "number") {
          setHeading(360 - event.alpha);
        }
      });
      setStatus("Kompas aktif jika sensor perangkat mengizinkan.");
    };

    if (orientationEvent.requestPermission) {
      void orientationEvent
        .requestPermission()
        .then((permission) => {
          if (permission === "granted") {
            startListening();
            return;
          }

          setStatus("Izin kompas belum diberikan.");
        })
        .catch(() => setStatus("Kompas belum bisa diaktifkan."));
      return;
    }

    startListening();
  };

  const testAdhanNotification = () => {
    void showPrayerNotification("Munajat", "Notifikasi adzan siap. Browser yang menentukan suara/vibrasi.")
      .then(() => setStatus("Notifikasi test dikirim."))
      .catch((error: unknown) => {
        setStatus(error instanceof Error ? error.message : "Notifikasi belum bisa dikirim.");
      });
  };

  return (
    <Card className="p-5">
      <div className="flex items-center gap-3">
        <MapPin className="h-5 w-5 text-primary" />
        <div>
          <h2 className="font-semibold">Jadwal sholat & arah Ka&apos;bah</h2>
          <p className="text-xs text-muted-foreground">Dihitung lokal dari koordinat. Jadwal resmi setempat bisa berbeda beberapa menit.</p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto]">
        <Button variant="secondary" onClick={useGps}>
          <LocateFixed className="h-4 w-4" />
          Pakai lokasi GPS
        </Button>
        <Button variant="outline" onClick={testAdhanNotification}>
          <Bell className="h-4 w-4" />
          Test adzan
        </Button>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
        <input
          value={manualLatitude}
          onChange={(event) => setManualLatitude(event.target.value)}
          className="h-11 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          placeholder="Latitude, contoh -6.200"
        />
        <input
          value={manualLongitude}
          onChange={(event) => setManualLongitude(event.target.value)}
          className="h-11 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          placeholder="Longitude, contoh 106.816"
        />
        <Button variant="outline" onClick={saveManualLocation}>
          Simpan
        </Button>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="grid gap-2 text-sm">
          <span className="text-muted-foreground">Metode kalkulasi</span>
          <select
            value={settings.prayer.calculationMethod}
            onChange={(event) =>
              savePrayerSettings({ calculationMethod: event.target.value as PrayerCalculationMethod })
            }
            className="h-11 rounded-md border bg-background px-3 outline-none focus:ring-2 focus:ring-ring"
          >
            {prayerCalculationOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm">
          <span className="text-muted-foreground">Mazhab Ashar</span>
          <select
            value={settings.prayer.madhab}
            onChange={(event) => savePrayerSettings({ madhab: event.target.value as PrayerMadhab })}
            className="h-11 rounded-md border bg-background px-3 outline-none focus:ring-2 focus:ring-ring"
          >
            {prayerMadhabOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {settings.prayer.location ? (
        <div className="mt-5 rounded-md border bg-background/60 p-4">
          <p className="text-sm font-medium">{settings.prayer.location.label}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {formatCoordinate(settings.prayer.location.latitude)}, {formatCoordinate(settings.prayer.location.longitude)}
          </p>
        </div>
      ) : (
        <p className="mt-5 rounded-md border bg-background/60 p-4 text-sm text-muted-foreground">
          Simpan lokasi dulu untuk menampilkan jadwal sholat dan arah Ka&apos;bah.
        </p>
      )}

      {rows.length > 0 ? (
        <div className="mt-5 grid gap-2">
          {rows.map((row) => {
            const isNext = nextPrayer?.key === row.key && row.isPrayer;

            return (
              <div
                key={row.key}
                className="flex items-center justify-between rounded-md border bg-background/60 px-4 py-3"
              >
                <div>
                  <p className="font-medium">{row.label}</p>
                  {!row.isPrayer ? <p className="text-xs text-muted-foreground">Bukan waktu sholat</p> : null}
                </div>
                <div className="text-right">
                  <p className="font-semibold tabular-nums">{formatPrayerTime(row.date)}</p>
                  {isNext ? <p className="text-xs text-primary">Berikutnya</p> : null}
                </div>
              </div>
            );
          })}
        </div>
      ) : null}

      {qiblaBearing !== null ? (
        <div className="mt-5 grid gap-4 rounded-md border bg-background/60 p-4 sm:grid-cols-[auto_1fr]">
          <div className="relative flex h-28 w-28 items-center justify-center rounded-full border bg-card">
            <Navigation
              className="h-12 w-12 text-primary transition-transform"
              style={{ transform: `rotate(${arrowRotation}deg)` }}
            />
            <Crosshair className="absolute h-4 w-4 text-muted-foreground" />
          </div>
          <div>
            <p className="font-semibold">Arah Ka&apos;bah {Math.round(qiblaBearing)}° dari utara</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Panah akan menyesuaikan bila kompas perangkat aktif. Letakkan perangkat mendatar untuk hasil yang lebih stabil.
            </p>
            <Button variant="outline" className="mt-3" onClick={enableCompass}>
              <Compass className="h-4 w-4" />
              Aktifkan kompas
            </Button>
          </div>
        </div>
      ) : null}

      <div className="mt-5 grid gap-3">
        <label className="flex items-center justify-between gap-4">
          <span className="text-sm">Aktifkan notifikasi umum</span>
          <Switch
            checked={settings.notifications.enabled}
            onCheckedChange={(checked) => saveNotificationSettings({ enabled: checked })}
          />
        </label>
        <label className="flex items-center justify-between gap-4">
          <span className="text-sm">Notifikasi adzan</span>
          <Switch
            checked={settings.notifications.adhan}
            onCheckedChange={(checked) => saveNotificationSettings({ adhan: checked })}
          />
        </label>
        <label className="grid gap-2 text-sm">
          <span className="text-muted-foreground">Kirim sebelum waktu sholat</span>
          <select
            value={settings.notifications.adhanBeforeMinutes}
            onChange={(event) => saveNotificationSettings({ adhanBeforeMinutes: Number(event.target.value) })}
            className="h-11 rounded-md border bg-background px-3 outline-none focus:ring-2 focus:ring-ring"
          >
            <option value={0}>Tepat waktu</option>
            <option value={5}>5 menit sebelumnya</option>
            <option value={10}>10 menit sebelumnya</option>
            <option value={15}>15 menit sebelumnya</option>
          </select>
        </label>
        <p className="text-xs leading-5 text-muted-foreground">
          Notifikasi ini dijadwalkan selama app/PWA aktif. Browser mengatur suara notifikasi; adzan audio penuh butuh aset audio berlisensi dan dukungan background yang lebih kuat.
        </p>
      </div>

      {status ? (
        <p className="mt-4 flex items-center gap-2 rounded-md border bg-card p-3 text-sm text-muted-foreground">
          <RotateCcw className="h-4 w-4 text-primary" />
          {status}
        </p>
      ) : null}
    </Card>
  );
}
