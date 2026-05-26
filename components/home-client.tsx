"use client";

import Link from "next/link";
import {
  BookOpen,
  BookOpenCheck,
  CalendarDays,
  ChevronRight,
  Clock,
  Compass,
  HeartHandshake,
  Library,
  Moon,
  RotateCcw,
  Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SeasonalBanner } from "@/components/seasonal-banner";
import { allDoa } from "@/lib/data/doa";
import { getHijriDisplay } from "@/lib/hijri-calendar";
import { formatPrayerTime, getNextPrayer } from "@/lib/prayer";
import { getContextLabel } from "@/lib/quran-context";
import { useMunajatStore } from "@/lib/store/munajat-store";

function getGreeting() {
  const hour = new Date().getHours();

  if (hour >= 3 && hour < 10) {
    return "Pagi yang tenang";
  }

  if (hour >= 10 && hour < 15) {
    return "Siang yang lapang";
  }

  if (hour >= 15 && hour < 18) {
    return "Sore yang teduh";
  }

  return "Malam yang hening";
}

const menuItems = [
  {
    href: "/dzikir-setelah-sholat",
    title: "Dzikir Setelah Sholat",
    description: "Dituntun langkah demi langkah, hitungan tersimpan otomatis.",
    icon: Moon
  },
  {
    href: "/hati",
    title: "Suasana Hati",
    description: "Renungan hari ini dan doa yang sesuai dengan kondisi hatimu.",
    icon: HeartHandshake
  },
  {
    href: "/hafalan",
    title: "Hafalan Mode",
    description: "Latih doa dengan bantuan bertahap dan murajaah lembut.",
    icon: BookOpenCheck
  },
  {
    href: "/jadwal",
    title: "Jadwal & Kiblat",
    description: "Waktu sholat, arah Ka'bah, lokasi, dan notifikasi adzan.",
    icon: Compass
  },
  {
    href: "/quran",
    title: "Bacaan Al-Qur'an",
    description: "Surat pilihan sesuai waktu: Al-Kahfi Jumat, Al-Mulk malam.",
    icon: BookOpen
  },
  {
    href: "/jelajah",
    title: "Jelajah Doa",
    description: "Cari doa berdasarkan kategori, kata kunci, atau sumber.",
    icon: Library
  },
  {
    href: "/hari-ini",
    title: "Hari Istimewa",
    description: "Arafah, Asyura, Ramadan, Jumat, dan momen Hijriah lain.",
    icon: CalendarDays
  },
  {
    href: "/pengaturan",
    title: "Pengaturan",
    description: "Tema, font Arab, privasi journal, export/import, notifikasi.",
    icon: Settings
  }
] as const;

export function HomeClient() {
  const hydrated = useMunajatStore((state) => state.hydrated);
  const settings = useMunajatStore((state) => state.settings);
  const progress = useMunajatStore((state) => state.progress);
  const resetProgress = useMunajatStore((state) => state.resetProgress);
  const hasProgress = hydrated && (progress.stepIndex > 0 || Object.keys(progress.counts).length > 0);
  const quranContext = getContextLabel();
  const hijriLabel = getHijriDisplay();
  const nextPrayer = settings.prayer.location ? getNextPrayer(settings) : null;

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col px-5 py-6 sm:px-8 sm:py-10">
      <header className="rounded-2xl border bg-card/60 p-5 shadow-calm sm:p-6">
        <p className="font-arabic text-3xl leading-none text-primary/60 sm:text-4xl" aria-hidden>
          مناجاة
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
          <h1 className="text-3xl font-semibold tracking-normal sm:text-4xl">Munajat</h1>
          <span className="rounded-full border bg-background/70 px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
            Offline-first
          </span>
        </div>
        <p className="mt-1 text-sm font-medium text-muted-foreground">{getGreeting()}</p>

        <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 border-t pt-4 text-sm">
          <span className="flex items-center gap-2 text-muted-foreground">
            <Moon className="h-4 w-4 text-primary" />
            {hijriLabel}
          </span>
          {nextPrayer ? (
            <span className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4 text-primary" />
              {nextPrayer.label} {formatPrayerTime(nextPrayer.date)}
              <span className="text-xs text-primary">· berikutnya</span>
            </span>
          ) : (
            <Link href="/jadwal" className="flex items-center gap-2 text-primary hover:underline">
              <Clock className="h-4 w-4" />
              Atur lokasi untuk jadwal sholat
            </Link>
          )}
        </div>
      </header>

      <section className="mt-6">
        <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
          Teman ibadah untuk dzikir setelah sholat, doa harian, dan munajat pribadi. Dituntun langkah
          demi langkah, dan semuanya tetap tersimpan di perangkatmu.
        </p>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg" className="min-h-12 justify-between sm:min-w-72">
            <Link href="/dzikir-setelah-sholat">
              {hasProgress ? "Lanjutkan Dzikir Setelah Sholat" : "Mulai Dzikir Setelah Sholat"}
              <ChevronRight className="h-5 w-5" />
            </Link>
          </Button>
          {hasProgress ? (
            <Button variant="outline" size="lg" onClick={() => void resetProgress()}>
              <RotateCcw className="h-4 w-4" />
              Mulai ulang
            </Button>
          ) : null}
        </div>
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-2">
        <SeasonalBanner compact />
        {quranContext ? (
          <Link href="/quran" className="group block">
            <Card className="flex h-full items-center justify-between gap-3 border-primary/40 bg-accent/15 p-4 transition group-hover:border-primary/60">
              <span className="flex items-center gap-3 text-sm font-medium">
                <BookOpen className="h-5 w-5 text-primary" />
                {quranContext}
              </span>
              <ChevronRight className="h-5 w-5 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" />
            </Card>
          </Link>
        ) : null}
      </section>

      <section className="mt-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">Menu</h2>
            <p className="mt-1 text-sm text-muted-foreground">Pilih fitur tanpa scroll panjang.</p>
          </div>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <Link key={item.href} href={item.href} className="group">
                <Card className="flex min-h-40 flex-col justify-between p-5 transition group-hover:-translate-y-0.5 group-hover:border-primary/40 group-hover:shadow-calm">
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
                        <Icon className="h-5 w-5" />
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" />
                    </div>
                    <h3 className="mt-5 font-semibold">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.description}</p>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      <footer className="mt-auto space-y-1 pt-10 text-xs leading-5 text-muted-foreground">
        <p>{allDoa.length} doa bersumber Al-Qur&apos;an &amp; hadis, setiap bacaan disertai rujukannya.</p>
        <p>Hajat, preferensi, dan progresmu tersimpan di perangkat ini saja — tanpa akun, iklan, atau pelacakan.</p>
      </footer>
    </main>
  );
}
