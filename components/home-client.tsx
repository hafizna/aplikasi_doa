"use client";

import Link from "next/link";
import {
  BookOpen,
  CalendarDays,
  ChevronRight,
  Compass,
  Heart,
  Library,
  Moon,
  RotateCcw,
  Settings,
  ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SeasonalBanner } from "@/components/seasonal-banner";
import { dzikirAfterPrayer, seasonalDoa, thematicDoa } from "@/lib/data/doa";
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
    href: "/doa-sesuai-hati",
    title: "Doa Sesuai Hati",
    description: "Rangkaian doa terkurasi sesuai kondisi hatimu.",
    icon: Heart
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
  const progress = useMunajatStore((state) => state.progress);
  const resetProgress = useMunajatStore((state) => state.resetProgress);
  const hasProgress = hydrated && (progress.stepIndex > 0 || Object.keys(progress.counts).length > 0);
  const quranContext = getContextLabel();

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col px-5 py-6 sm:px-8 sm:py-10">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{getGreeting()}</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-normal sm:text-4xl">Munajat</h1>
        </div>
        <div className="rounded-full border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
          Offline-first
        </div>
      </header>

      <section className="mt-10 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <p className="text-lg leading-8 text-muted-foreground">
            Pemandu dzikir setelah sholat yang pelan, terarah, dan menyimpan progress hanya di perangkat ini.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
            <Button asChild size="lg" className="min-h-12 justify-between">
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
        </div>
        <SeasonalBanner compact />
      </section>

      {quranContext ? (
        <Link href="/quran" className="group mt-4 block">
          <Card className="flex items-center justify-between gap-3 border-primary/40 bg-accent/15 p-4 transition group-hover:border-primary/60">
            <span className="flex items-center gap-3 text-sm font-medium">
              <BookOpen className="h-5 w-5 text-primary" />
              {quranContext}
            </span>
            <ChevronRight className="h-5 w-5 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" />
          </Card>
        </Link>
      ) : null}

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
                      <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
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

      <section className="mt-10 grid gap-4 sm:grid-cols-2">
        <Card className="p-5">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <h2 className="mt-4 font-semibold">Sumber tercantum</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {dzikirAfterPrayer.length} bacaan dzikir setelah sholat disertai referensi Al-Qur&apos;an atau hadis.
          </p>
        </Card>
        <Card className="p-5">
          <BookOpen className="h-5 w-5 text-primary" />
          <h2 className="mt-4 font-semibold">Doa tematik</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {thematicDoa.length} doa pilihan untuk berbagai kebutuhan hati: tobat, rezeki, perlindungan, dan lainnya.
          </p>
        </Card>
        <Card className="p-5 sm:col-span-2">
          <BookOpen className="h-5 w-5 text-primary" />
          <h2 className="mt-4 font-semibold">Konten musiman</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {seasonalDoa.length} doa musiman tersedia untuk Ramadan, Arafah, Asyura, Jumat, dan puasa sunnah.
          </p>
        </Card>
      </section>

      <footer className="mt-auto pt-10 text-xs leading-5 text-muted-foreground">
        Hajat, preferensi, dan progresmu tersimpan di perangkat ini saja. Tanpa akun, tanpa pelacakan, tanpa server.
      </footer>
    </main>
  );
}
