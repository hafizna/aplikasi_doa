"use client";

import Link from "next/link";
import { ArrowLeft, BookOpen, Check, ChevronRight, Heart, PenLine, RotateCcw } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { DoaContent } from "@/components/doa-content";
import { JournalPanel } from "@/components/journal-panel";
import { SettingsPanel } from "@/components/settings-panel";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  type CurationAnswers,
  type DurationKey,
  type HopeKey,
  type MoodKey,
  curateDoaPackage,
  durationOptions,
  getTagsForAnswers,
  hopeOptions,
  moodOptions
} from "@/lib/curation";
import { useMunajatStore } from "@/lib/store/munajat-store";

const initialAnswers: CurationAnswers = {
  mood: null,
  hope: null,
  duration: null,
  freeText: ""
};

type Stage = "mood" | "hope" | "duration" | "result";

function getMoodLabel(mood: MoodKey | null) {
  return moodOptions.find((option) => option.key === mood)?.label ?? "Munajat personal";
}

export function MoodCurationClient() {
  const hydrated = useMunajatStore((state) => state.hydrated);
  const addMunajat = useMunajatStore((state) => state.addMunajat);
  const [stage, setStage] = useState<Stage>("mood");
  const [answers, setAnswers] = useState<CurationAnswers>(initialAnswers);
  const [journalText, setJournalText] = useState("");
  const [saved, setSaved] = useState(false);
  const selectedDoa = useMemo(() => curateDoaPackage(answers), [answers]);
  const tags = useMemo(() => getTagsForAnswers(answers), [answers]);

  const chooseMood = (mood: MoodKey) => {
    setAnswers((current) => ({ ...current, mood, hope: mood === "berharap" ? current.hope : null }));
    setStage(mood === "berharap" ? "hope" : "duration");
  };

  const chooseHope = (hope: HopeKey) => {
    setAnswers((current) => ({ ...current, hope }));
    setStage("duration");
  };

  const chooseDuration = (duration: DurationKey) => {
    setAnswers((current) => ({ ...current, duration }));
    setStage("result");
  };

  const reset = () => {
    setAnswers(initialAnswers);
    setJournalText("");
    setSaved(false);
    setStage("mood");
  };

  const saveJournal = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const body = journalText.trim();

    if (!body) {
      return;
    }

    void addMunajat({
      title: getMoodLabel(answers.mood),
      body,
      mood: answers.mood ?? "lainnya",
      tags,
      ...(answers.hope ? { hopeKey: answers.hope } : {})
    }).then(() => {
      setSaved(true);
      setJournalText("");
    });
  };

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-5 py-5 sm:px-8">
      <header className="flex items-center justify-between gap-4">
        <Button asChild variant="ghost" size="icon" aria-label="Kembali ke beranda">
          <Link href="/">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground">Sesuai kondisi hati</p>
          <h1 className="text-2xl font-semibold">Doa Sesuai Hati</h1>
        </div>
        <Button variant="outline" size="sm" onClick={reset}>
          <RotateCcw className="h-4 w-4" />
          Ulang
        </Button>
      </header>

      <section className="mt-7">
        {stage === "mood" ? (
          <Card className="p-5 sm:p-7">
            <Heart className="h-5 w-5 text-primary" />
            <h2 className="mt-4 text-2xl font-semibold">Apa yang sedang kamu rasakan?</h2>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {moodOptions.map((option) => (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => chooseMood(option.key)}
                  className="rounded-lg border bg-background/70 p-4 text-left text-sm font-medium transition hover:bg-secondary"
                >
                  {option.label}
                </button>
              ))}
            </div>
            <label className="mt-6 block">
              <span className="text-sm font-medium">Catatan singkat</span>
              <textarea
                value={answers.freeText}
                onChange={(event) => setAnswers((current) => ({ ...current, freeText: event.target.value }))}
                className="mt-2 min-h-24 w-full rounded-md border bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                placeholder="Boleh kosong. Tulis dengan bahasa hati."
              />
            </label>
          </Card>
        ) : null}

        {stage === "hope" ? (
          <Card className="p-5 sm:p-7">
            <h2 className="text-2xl font-semibold">Hajat apa yang sedang diperjuangkan?</h2>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {hopeOptions.map((option) => (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => chooseHope(option.key)}
                  className="rounded-lg border bg-background/70 p-4 text-left text-sm font-medium transition hover:bg-secondary"
                >
                  {option.label}
                </button>
              ))}
            </div>
          </Card>
        ) : null}

        {stage === "duration" ? (
          <Card className="p-5 sm:p-7">
            <h2 className="text-2xl font-semibold">Berapa lama waktumu?</h2>
            <div className="mt-6 grid gap-3">
              {durationOptions.map((option) => (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => chooseDuration(option.key)}
                  className="flex items-center justify-between rounded-lg border bg-background/70 p-4 text-left text-sm font-medium transition hover:bg-secondary"
                >
                  {option.label}
                  <ChevronRight className="h-4 w-4" />
                </button>
              ))}
            </div>
          </Card>
        ) : null}

        {stage === "result" ? (
          <div className="space-y-5">
            <Card className="p-5 sm:p-7">
              <BookOpen className="h-5 w-5 text-primary" />
              <h2 className="mt-4 text-2xl font-semibold">Paket doa terkurasi</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Dirangkai dari koleksi doa sesuai kondisi yang kamu pilih.
              </p>
            </Card>

            {selectedDoa.map((doa) => (
              <Card key={doa.id} className="p-5 sm:p-7">
                <DoaContent doa={doa} compact />
              </Card>
            ))}

            <Card className="p-5 sm:p-7">
              <PenLine className="h-5 w-5 text-primary" />
              <h2 className="mt-4 text-xl font-semibold">Munajat personal</h2>
              <form className="mt-4" onSubmit={saveJournal}>
                <textarea
                  value={journalText}
                  onChange={(event) => {
                    setJournalText(event.target.value);
                    setSaved(false);
                  }}
                  className="min-h-32 w-full rounded-md border bg-background p-3 text-sm leading-6 outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Tulis hajat atau doa pribadi. Tidak dikirim ke mana pun."
                />
                <div className="mt-3 flex items-center justify-between gap-3">
                  <p className="text-xs text-muted-foreground">Tersimpan di perangkatmu saja.</p>
                  <Button type="submit" disabled={!journalText.trim()}>
                    {saved ? <Check className="h-4 w-4" /> : <PenLine className="h-4 w-4" />}
                    Simpan
                  </Button>
                </div>
              </form>
            </Card>

            {hydrated ? <JournalPanel /> : null}
            <SettingsPanel />
          </div>
        ) : null}
      </section>
    </main>
  );
}
