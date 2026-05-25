"use client";

import Link from "next/link";
import { BookOpen, ChevronRight, Heart, Library, RotateCcw, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AdvancedPanel } from "@/components/advanced-panel";
import { PrayerPanel } from "@/components/prayer-panel";
import { SettingsPanel } from "@/components/settings-panel";
import { SeasonalBanner } from "@/components/seasonal-banner";
import { dzikirAfterPrayer, seasonalDoa, thematicDoa } from "@/lib/data/doa";
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

export function HomeClient() {
  const hydrated = useMunajatStore((state) => state.hydrated);
  const progress = useMunajatStore((state) => state.progress);
  const resetProgress = useMunajatStore((state) => state.resetProgress);
  const hasProgress = hydrated && (progress.stepIndex > 0 || Object.keys(progress.counts).length > 0);

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col px-5 py-6 sm:px-8 sm:py-10">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{getGreeting()}</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-normal sm:text-4xl">Munajat</h1>
        </div>
        <div className="rounded-full border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
          Offline-first
        </div>
      </header>

      <section className="mt-10">
        <div className="max-w-2xl">
          <p className="text-lg leading-8 text-muted-foreground">
            Pemandu dzikir setelah sholat yang pelan, terarah, dan menyimpan progress hanya di perangkat ini.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
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
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <Button asChild variant="secondary" size="lg" className="justify-between">
              <Link href="/doa-sesuai-hati">
                <span className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Doa Sesuai Hati
                </span>
                <ChevronRight className="h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="justify-between">
              <Link href="/jelajah">
                <span className="flex items-center gap-2">
                  <Library className="h-5 w-5" />
                  Jelajah Doa
                </span>
                <ChevronRight className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <SeasonalBanner />

      <section className="mt-5">
        <PrayerPanel />
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
          <h2 className="mt-4 font-semibold">Seed tematik</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {thematicDoa.length} doa tematik sudah tersedia sebagai fondasi Fase 2.
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

      <section className="mt-5">
        <SettingsPanel />
      </section>

      <section className="mt-5">
        <AdvancedPanel />
      </section>

      <footer className="mt-auto pt-10 text-xs leading-5 text-muted-foreground">
        Data hajat, settings, dan progress disimpan lokal via IndexedDB. Tidak ada akun, analytics, atau cloud sync.
      </footer>
    </main>
  );
}
