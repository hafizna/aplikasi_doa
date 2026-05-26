"use client";

import Link from "next/link";
import { ArrowLeft, Check, ChevronRight, RotateCcw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { DoaContent } from "@/components/doa-content";
import { SettingsPanel } from "@/components/settings-panel";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getDzikirFlowItems } from "@/lib/data/doa";
import { useMunajatStore } from "@/lib/store/munajat-store";
import { formatPercent } from "@/lib/utils";

function vibrate() {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate(12);
  }
}

function isMuawwidzatStep(doaId: string) {
  return doaId === "quran-al-ikhlas" || doaId === "quran-al-falaq" || doaId === "quran-an-nas";
}

export function GuidedDzikir() {
  const hydrated = useMunajatStore((state) => state.hydrated);
  const settings = useMunajatStore((state) => state.settings);
  const updateSettings = useMunajatStore((state) => state.updateSettings);
  const progress = useMunajatStore((state) => state.progress);
  const incrementCount = useMunajatStore((state) => state.incrementCount);
  const setStepIndex = useMunajatStore((state) => state.setStepIndex);
  const resetProgress = useMunajatStore((state) => state.resetProgress);
  const setCompleted = useMunajatStore((state) => state.setCompleted);
  const [surahRepeat, setSurahRepeat] = useState<1 | 3>(1);

  const closingStyle = settings.closingStyle ?? "matsur";
  const includeSunnahDoa = settings.includeSunnahDoa ?? false;
  const flow = useMemo(
    () => getDzikirFlowItems(closingStyle, includeSunnahDoa),
    [closingStyle, includeSunnahDoa]
  );

  const stepIndex = Math.min(progress.stepIndex, flow.length - 1);
  const current = flow[stepIndex];
  const storedCount = current ? progress.counts[current.doa.id] ?? 0 : 0;
  const effectiveTarget = current && isMuawwidzatStep(current.doa.id) ? surahRepeat : current?.target;
  const isCounter = current?.mode === "counter" || Boolean(effectiveTarget && effectiveTarget > 1);
  const currentCount = effectiveTarget ? Math.min(storedCount, effectiveTarget) : storedCount;
  const stepProgress = effectiveTarget ? formatPercent(currentCount, effectiveTarget) : 0;
  const totalProgress = formatPercent(stepIndex, flow.length);
  const isComplete = Boolean(progress.completedAt) || progress.stepIndex >= flow.length;

  useEffect(() => {
    if (!current || !effectiveTarget || currentCount < effectiveTarget) {
      return;
    }

    const timeout = window.setTimeout(() => {
      if (stepIndex < flow.length - 1) {
        void setStepIndex(stepIndex + 1);
      }
    }, 450);

    return () => window.clearTimeout(timeout);
  }, [current, currentCount, effectiveTarget, flow.length, setStepIndex, stepIndex]);

  if (!hydrated) {
    return (
      <main className="mx-auto flex min-h-screen max-w-2xl items-center justify-center px-5">
        <p className="text-sm text-muted-foreground">Menyiapkan dzikir...</p>
      </main>
    );
  }

  if (isComplete) {
    return (
      <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-5 py-8">
        <Card className="p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Check className="h-6 w-6" />
          </div>
          <h1 className="mt-6 text-3xl font-semibold">Alhamdulillah, selesai.</h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Semoga Allah menerima dzikir dan doa kita. Ada hajat yang ingin kamu panjatkan? Lanjutkan ke Doa Sesuai Hati.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Button onClick={() => void resetProgress()}>
              <RotateCcw className="h-4 w-4" />
              Mulai lagi
            </Button>
            <Button asChild variant="outline">
              <Link href="/">Kembali ke beranda</Link>
            </Button>
          </div>
        </Card>
      </main>
    );
  }

  const goNext = () => {
    if (stepIndex >= flow.length - 1) {
      void setCompleted();
      return;
    }

    void setStepIndex(stepIndex + 1);
  };

  const goBack = () => {
    if (stepIndex > 0) {
      void setStepIndex(stepIndex - 1);
    }
  };

  const tapCounter = () => {
    if (!current || (effectiveTarget && currentCount >= effectiveTarget)) {
      return;
    }

    vibrate();
    void incrementCount(current.doa.id, current.doa.judul, effectiveTarget);
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col px-5 pb-28 pt-5 sm:px-8">
      <header className="sticky top-0 z-10 -mx-5 border-b bg-background/90 px-5 py-4 backdrop-blur sm:-mx-8 sm:px-8">
        <div className="flex items-center justify-between gap-3">
          <Button asChild variant="ghost" size="icon" aria-label="Kembali ke beranda">
            <Link href="/">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="flex-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                Langkah {stepIndex + 1}/{flow.length}
              </span>
              <span>{totalProgress}%</span>
            </div>
            <Progress value={totalProgress} className="mt-2" />
          </div>
        </div>
      </header>

      <section className="py-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Dzikir setelah sholat</p>
            <h1 className="mt-1 text-2xl font-semibold">{current.doa.judul}</h1>
          </div>
          <Button variant="outline" size="sm" onClick={() => void resetProgress()}>
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-2 rounded-lg border bg-card p-3 text-sm">
          <span className="text-muted-foreground">Doa penutup:</span>
          <Button
            variant={closingStyle === "matsur" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => void updateSettings({ closingStyle: "matsur" })}
          >
            Ma&apos;tsur (sunnah)
          </Button>
          <Button
            variant={closingStyle === "tradisi" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => void updateSettings({ closingStyle: "tradisi" })}
          >
            Tradisi (rangkaian)
          </Button>
          <span className="mx-1 h-5 w-px bg-border" aria-hidden />
          <Button
            variant={includeSunnahDoa ? "secondary" : "ghost"}
            size="sm"
            onClick={() => void updateSettings({ includeSunnahDoa: !includeSunnahDoa })}
            aria-pressed={includeSunnahDoa}
          >
            {includeSunnahDoa ? "✓ " : "+ "}Doa sunnah
          </Button>
        </div>

        {current.doa.tags?.includes("rangkaian-tradisi") ? (
          <p className="mb-4 rounded-md border border-accent/50 bg-accent/15 p-3 text-xs leading-5 text-muted-foreground">
            Bagian dari rangkaian doa penutup tradisi (jumhur/NU) — kompilasi wirid, bukan satu riwayat
            tunggal. Sumber tiap bagian tercantum di bawah.
          </p>
        ) : null}

        {isMuawwidzatStep(current.doa.id) ? (
          <div className="mb-4 flex flex-wrap items-center gap-2 rounded-lg border bg-card p-3 text-sm">
            <span className="text-muted-foreground">Pengulangan surat:</span>
            <Button
              variant={surahRepeat === 1 ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setSurahRepeat(1)}
            >
              1x
            </Button>
            <Button
              variant={surahRepeat === 3 ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setSurahRepeat(3)}
            >
              3x Subuh/Maghrib
            </Button>
          </div>
        ) : null}

        <Card className="p-5 sm:p-7">
          <DoaContent doa={current.doa} />
        </Card>
      </section>

      {isCounter && effectiveTarget ? (
        <section className="pb-6">
          <button
            type="button"
            onClick={tapCounter}
            className="flex min-h-56 w-full flex-col items-center justify-center rounded-lg border bg-primary p-6 text-primary-foreground shadow-calm transition active:scale-[0.99]"
          >
            <span className="text-sm font-medium opacity-80">Ketuk untuk menghitung</span>
            <span className="mt-3 text-7xl font-semibold tabular-nums">{currentCount}</span>
            <span className="mt-2 text-sm opacity-80">dari {effectiveTarget}</span>
          </button>
          <Progress value={stepProgress} className="mt-4 h-3" />
        </section>
      ) : null}

      <section className="mb-6">
        <SettingsPanel />
      </section>

      <nav
        className="fixed inset-x-0 bottom-0 z-20 border-t bg-background/95 px-5 py-4 shadow-calm backdrop-blur"
        style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
      >
        <div className="mx-auto flex max-w-3xl gap-3">
          <Button variant="outline" className="flex-1" onClick={goBack} disabled={stepIndex === 0}>
            Sebelumnya
          </Button>
          <Button className="flex-1" onClick={goNext}>
            {stepIndex === flow.length - 1 ? "Selesai" : "Lanjut"}
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </nav>
    </main>
  );
}
