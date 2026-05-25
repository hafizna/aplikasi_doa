"use client";

import Link from "next/link";
import { Eye, EyeOff, RotateCcw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AudioPlayer } from "@/components/audio-player";
import { DoaContent } from "@/components/doa-content";
import { PageHeading } from "@/components/page-heading";
import { SourceLine } from "@/components/source-line";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getArabicPrompt, getMemorizationLabel, getMemorizationProgress } from "@/lib/memorization";
import { useMunajatStore } from "@/lib/store/munajat-store";
import type { Doa } from "@/lib/types/doa";

const helpModes = [
  { key: "full", label: "Teks penuh" },
  { key: "masked", label: "Kosong sebagian" },
  { key: "firstLetters", label: "Huruf awal" },
  { key: "hidden", label: "Tanpa bantuan" }
] as const;

type HelpMode = (typeof helpModes)[number]["key"];

export function MemorizationPracticeClient({ doa }: { doa: Doa }) {
  const settings = useMunajatStore((state) => state.settings);
  const memorization = useMunajatStore((state) => state.memorization);
  const startMemorization = useMunajatStore((state) => state.startMemorization);
  const reviewMemorization = useMunajatStore((state) => state.reviewMemorization);
  const removeMemorization = useMunajatStore((state) => state.removeMemorization);
  const progress = getMemorizationProgress(memorization, doa.id);
  const initialHelpMode = progress ? helpModes[Math.min(progress.helpLevel, helpModes.length - 1)].key : "full";
  const [helpMode, setHelpMode] = useState<HelpMode>(initialHelpMode);
  const [hasChosenMode, setHasChosenMode] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const prompt = useMemo(() => getArabicPrompt(doa, helpMode), [doa, helpMode]);

  useEffect(() => {
    if (!progress || hasChosenMode) {
      return;
    }

    setHelpMode(helpModes[Math.min(progress.helpLevel, helpModes.length - 1)].key);
  }, [hasChosenMode, progress]);

  const review = (result: "again" | "almost" | "good") => {
    void reviewMemorization(doa.id, result).then(() => setShowAnswer(false));
  };

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-5 py-5 sm:px-8">
      <PageHeading eyebrow="Hafalan Mode" title={doa.judul}>
        {getMemorizationLabel(progress)}
      </PageHeading>

      <section className="mt-6 grid gap-5">
        <Card className="p-5 sm:p-7">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold">Mode bantuan</p>
              <p className="mt-1 text-xs text-muted-foreground">Turunkan bantuan pelan-pelan sampai lancar tanpa melihat.</p>
            </div>
            <Button variant="outline" onClick={() => void startMemorization(doa.id)}>
              Mulai simpan progress
            </Button>
          </div>
          <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
            {helpModes.map((mode) => (
              <Button
                key={mode.key}
                variant={helpMode === mode.key ? "secondary" : "outline"}
                size="sm"
                onClick={() => {
                  setHasChosenMode(true);
                  setHelpMode(mode.key);
                }}
              >
                {mode.label}
              </Button>
            ))}
          </div>
        </Card>

        <Card className="p-5 sm:p-7">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold">Latihan</p>
            <Button variant="outline" size="sm" onClick={() => setShowAnswer((current) => !current)}>
              {showAnswer ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {showAnswer ? "Sembunyikan" : "Lihat jawaban"}
            </Button>
          </div>

          {prompt ? (
            <p
              className="arabic-text mt-6 font-arabic text-card-foreground"
              style={{ fontSize: `${settings.arabicFontSize}px` }}
            >
              {prompt}
            </p>
          ) : (
            <div className="mt-6 rounded-md border bg-background/60 p-8 text-center">
              <p className="text-sm text-muted-foreground">Coba baca dari hafalanmu dulu.</p>
            </div>
          )}

          {settings.showLatin && helpMode !== "hidden" ? (
            <p className="mt-5 rounded-md bg-secondary/60 p-4 text-sm leading-7 text-secondary-foreground">
              {doa.latin}
            </p>
          ) : null}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button variant="outline" onClick={() => review("again")}>
              Perlu ulang
            </Button>
            <Button variant="secondary" onClick={() => review("almost")}>
              Hampir lancar
            </Button>
            <Button onClick={() => review("good")}>Sudah lancar</Button>
          </div>
          <p className="mt-3 text-xs leading-5 text-muted-foreground">
            Self-check ini hanya untuk mengatur murajaah berikutnya, bukan nilai ibadah.
          </p>
        </Card>

        {showAnswer ? (
          <Card className="p-5 sm:p-7">
            <DoaContent doa={doa} compact />
          </Card>
        ) : (
          <Card className="p-5 sm:p-7">
            <SourceLine doa={doa} />
            <AudioPlayer doa={doa} />
          </Card>
        )}

        {progress ? (
          <Card className="p-5">
            <h2 className="font-semibold">Progress lokal</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-md border bg-background/60 p-3">
                <p className="text-2xl font-semibold tabular-nums">{progress.reviewCount}</p>
                <p className="text-xs text-muted-foreground">Review</p>
              </div>
              <div className="rounded-md border bg-background/60 p-3">
                <p className="text-sm font-semibold">{getMemorizationLabel(progress)}</p>
                <p className="text-xs text-muted-foreground">Status</p>
              </div>
              <div className="rounded-md border bg-background/60 p-3">
                <p className="text-sm font-semibold">{new Date(progress.dueAt).toLocaleDateString("id-ID")}</p>
                <p className="text-xs text-muted-foreground">Murajaah</p>
              </div>
            </div>
            <Button variant="ghost" className="mt-4" onClick={() => void removeMemorization(doa.id)}>
              <RotateCcw className="h-4 w-4" />
              Reset progress hafalan
            </Button>
          </Card>
        ) : null}

        <Button asChild variant="outline" className="w-fit">
          <Link href="/hafalan">Kembali ke daftar hafalan</Link>
        </Button>
      </section>
    </main>
  );
}
