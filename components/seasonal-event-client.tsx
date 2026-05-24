"use client";

import Link from "next/link";
import { ArrowLeft, CalendarDays, Check, PenLine } from "lucide-react";
import { FormEvent, useState } from "react";
import { DoaContent } from "@/components/doa-content";
import { JournalPanel } from "@/components/journal-panel";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getSeasonalEventDoa, type SeasonalEvent } from "@/lib/seasonal-events";
import { useMunajatStore } from "@/lib/store/munajat-store";

export function SeasonalEventClient({ event }: { event: SeasonalEvent }) {
  const addMunajat = useMunajatStore((state) => state.addMunajat);
  const hydrated = useMunajatStore((state) => state.hydrated);
  const [journalText, setJournalText] = useState("");
  const [saved, setSaved] = useState(false);
  const relatedDoa = getSeasonalEventDoa(event);

  const saveJournal = (formEvent: FormEvent<HTMLFormElement>) => {
    formEvent.preventDefault();
    const body = journalText.trim();

    if (!body) {
      return;
    }

    void addMunajat({
      title: `Munajat ${event.shortTitle}`,
      body,
      mood: event.id,
      tags: [event.id, "musiman"]
    }).then(() => {
      setSaved(true);
      setJournalText("");
    });
  };

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-5 py-5 sm:px-8">
      <header className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon" aria-label="Kembali ke beranda">
          <Link href="/">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <p className="text-sm font-medium text-muted-foreground">Hari Ini</p>
          <h1 className="text-2xl font-semibold">{event.title}</h1>
        </div>
      </header>

      <section className="mt-7 space-y-5">
        <Card className="p-5 sm:p-7">
          <CalendarDays className="h-5 w-5 text-primary" />
          <p className="mt-4 text-sm font-medium text-muted-foreground">{event.dateLabel}</p>
          <h2 className="mt-1 text-2xl font-semibold">{event.summary}</h2>
          <p className="mt-4 text-sm leading-7 text-muted-foreground">{event.detail}</p>
          <p className="mt-4 text-xs leading-5 text-muted-foreground">Sumber: {event.source}</p>
          {event.note ? (
            <p className="mt-4 rounded-md border border-accent/50 bg-accent/15 p-3 text-sm leading-6">{event.note}</p>
          ) : null}
          <p className="mt-4 text-xs leading-5 text-muted-foreground">
            Deteksi tanggal Hijriah memakai konversi perhitungan offline. Rukyatul hilal setempat dapat berbeda satu hari.
          </p>
        </Card>

        <Card className="p-5 sm:p-7">
          <h2 className="text-xl font-semibold">Amalan utama</h2>
          <ul className="mt-4 space-y-3">
            {event.practices.map((practice) => (
              <li key={practice} className="flex gap-3 text-sm leading-6 text-muted-foreground">
                <Check className="mt-1 h-4 w-4 shrink-0 text-primary" />
                <span>{practice}</span>
              </li>
            ))}
          </ul>
          <p className="mt-5 rounded-md bg-secondary/70 p-4 text-sm leading-6 text-secondary-foreground">
            {event.suggestion}
          </p>
        </Card>

        {relatedDoa.map((doa) => (
          <Card key={doa.id} className="p-5 sm:p-7">
            <DoaContent doa={doa} compact />
          </Card>
        ))}

        <Card className="p-5 sm:p-7">
          <PenLine className="h-5 w-5 text-primary" />
          <h2 className="mt-4 text-xl font-semibold">Munajat personal {event.shortTitle}</h2>
          <form className="mt-4" onSubmit={saveJournal}>
            <textarea
              value={journalText}
              onChange={(changeEvent) => {
                setJournalText(changeEvent.target.value);
                setSaved(false);
              }}
              className="min-h-32 w-full rounded-md border bg-background p-3 text-sm leading-6 outline-none focus:ring-2 focus:ring-ring"
              placeholder="Tulis hajat yang ingin kamu bawa di momen ini. Tersimpan lokal saja."
            />
            <div className="mt-3 flex items-center justify-between gap-3">
              <p className="text-xs text-muted-foreground">Tidak ada cloud sync atau analytics.</p>
              <Button type="submit" disabled={!journalText.trim()}>
                {saved ? <Check className="h-4 w-4" /> : <PenLine className="h-4 w-4" />}
                Simpan
              </Button>
            </div>
          </form>
        </Card>

        {hydrated ? <JournalPanel /> : null}
      </section>
    </main>
  );
}
