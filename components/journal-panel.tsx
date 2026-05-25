"use client";

import { Check, HandHeart, Repeat, Sparkles, Trash2, X } from "lucide-react";
import { useMemo, useState } from "react";
import { DoaContent } from "@/components/doa-content";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { curateDoaPackage, hopeOptions } from "@/lib/curation";
import type { HopeKey, MunajatJournalEntry } from "@/lib/types/doa";
import { useMunajatStore } from "@/lib/store/munajat-store";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric"
  }).format(new Date(value));
}

const hopeLabels: Record<HopeKey, string> = hopeOptions.reduce(
  (acc, option) => ({ ...acc, [option.key]: option.label }),
  {} as Record<HopeKey, string>
);

function CategoryBadge({ hopeKey }: { hopeKey?: HopeKey }) {
  if (!hopeKey) {
    return null;
  }

  return (
    <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
      {hopeLabels[hopeKey] ?? hopeKey}
    </span>
  );
}

function getRelatedDoa(entry: MunajatJournalEntry) {
  return curateDoaPackage({
    mood: null,
    hope: entry.hopeKey ?? null,
    duration: "singkat",
    freeText: ""
  });
}

export function JournalPanel() {
  const journal = useMunajatStore((state) => state.journal);
  const journalLocked = useMunajatStore((state) => state.journalLocked);
  const markAnswered = useMunajatStore((state) => state.markMunajatAnswered);
  const prayAgain = useMunajatStore((state) => state.prayMunajatAgain);
  const deleteMunajat = useMunajatStore((state) => state.deleteMunajat);
  const [filter, setFilter] = useState<HopeKey | "semua">("semua");
  const [prayingId, setPrayingId] = useState<number | null>(null);
  const [answeringId, setAnsweringId] = useState<number | null>(null);
  const [gratitudeText, setGratitudeText] = useState("");

  const activeEntries = journal.filter((entry) => entry.status === "active");
  const answeredEntries = journal.filter((entry) => entry.status === "answered");

  const availableCategories = useMemo(
    () =>
      hopeOptions
        .map((option) => option.key)
        .filter((key) => activeEntries.some((entry) => entry.hopeKey === key)),
    [activeEntries]
  );

  const filteredActive = useMemo(
    () => (filter === "semua" ? activeEntries : activeEntries.filter((entry) => entry.hopeKey === filter)),
    [activeEntries, filter]
  );

  const handlePrayAgain = (entry: MunajatJournalEntry) => {
    if (!entry.id) {
      return;
    }

    setPrayingId((current) => (current === entry.id ? null : entry.id ?? null));
    void prayAgain(entry.id);
  };

  const openAnswering = (id: number) => {
    setAnsweringId(id);
    setGratitudeText("");
  };

  const confirmAnswered = (id: number) => {
    void markAnswered(id, gratitudeText).then(() => {
      setAnsweringId(null);
      setGratitudeText("");
    });
  };

  if (journal.length === 0) {
    return (
      <Card className="p-5">
        <h2 className="font-semibold">Munajat personal</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Belum ada hajat tersimpan. Tulis dari flow Doa Sesuai Hati, dan semuanya tetap lokal di perangkat ini.
        </p>
      </Card>
    );
  }

  return (
    <section className="space-y-4">
      <Card className="p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-semibold">Hajat yang sedang didoakan</h2>
          {journalLocked ? (
            <span className="rounded-full bg-secondary px-3 py-1 text-xs text-secondary-foreground">Terkunci</span>
          ) : null}
        </div>

        {availableCategories.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              variant={filter === "semua" ? "secondary" : "outline"}
              size="sm"
              onClick={() => setFilter("semua")}
            >
              Semua
            </Button>
            {availableCategories.map((key) => (
              <Button
                key={key}
                variant={filter === key ? "secondary" : "outline"}
                size="sm"
                onClick={() => setFilter(key)}
              >
                {hopeLabels[key]}
              </Button>
            ))}
          </div>
        ) : null}

        <div className="mt-4 space-y-3">
          {filteredActive.length > 0 ? (
            filteredActive.map((entry) => {
              const relatedDoa = prayingId === entry.id ? getRelatedDoa(entry) : [];
              const isAnswering = answeringId === entry.id;
              const lockedEncrypted = journalLocked && entry.encrypted;

              return (
                <div key={entry.id} className="rounded-md border bg-background/60 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium">{entry.title}</p>
                        <CategoryBadge hopeKey={entry.hopeKey} />
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Mulai {formatDate(entry.createdAt)}
                        {entry.prayedCount ? ` · doa dipanjatkan ${entry.prayedCount}×` : ""}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        aria-label="Tandai terkabul"
                        disabled={lockedEncrypted}
                        onClick={() => entry.id && openAnswering(entry.id)}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Hapus hajat"
                        disabled={lockedEncrypted}
                        onClick={() => entry.id && void deleteMunajat(entry.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{entry.body}</p>

                  {isAnswering ? (
                    <div className="mt-4 rounded-md border border-accent/50 bg-accent/15 p-3">
                      <p className="flex items-center gap-2 text-sm font-medium">
                        <Sparkles className="h-4 w-4 text-primary" />
                        Alhamdulillah! Sujud syukur & ucapkan pujian kepada Allah.
                      </p>
                      <textarea
                        value={gratitudeText}
                        onChange={(event) => setGratitudeText(event.target.value)}
                        className="mt-3 min-h-20 w-full rounded-md border bg-background p-3 text-sm leading-6 outline-none focus:ring-2 focus:ring-ring"
                        placeholder="Catatan syukur (opsional). Tetap tersimpan lokal."
                      />
                      <div className="mt-3 flex gap-2">
                        <Button size="sm" onClick={() => entry.id && confirmAnswered(entry.id)}>
                          <Check className="h-4 w-4" />
                          Tandai terkabul
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setAnsweringId(null)}>
                          <X className="h-4 w-4" />
                          Batal
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      variant="secondary"
                      size="sm"
                      className="mt-3"
                      onClick={() => handlePrayAgain(entry)}
                    >
                      <Repeat className="h-4 w-4" />
                      Panjatkan doa
                    </Button>
                  )}

                  {relatedDoa.length > 0 ? (
                    <div className="mt-3 space-y-3 border-t pt-3">
                      <p className="text-xs font-medium text-muted-foreground">Doa ma&apos;tsur yang relevan:</p>
                      {relatedDoa.map((doa) => (
                        <div key={doa.id} className="rounded-md border bg-background/60 p-4">
                          <DoaContent doa={doa} compact />
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              );
            })
          ) : (
            <p className="text-sm text-muted-foreground">
              {activeEntries.length === 0
                ? "Tidak ada hajat aktif saat ini."
                : "Tidak ada hajat pada kategori ini."}
            </p>
          )}
        </div>
      </Card>

      {answeredEntries.length > 0 ? (
        <Card className="p-5">
          <h2 className="font-semibold">Alhamdulillah, sudah dikabulkan</h2>
          <div className="mt-4 space-y-3">
            {answeredEntries.map((entry) => (
              <div key={entry.id} className="rounded-md border bg-background/60 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium">{entry.title}</p>
                  <CategoryBadge hopeKey={entry.hopeKey} />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Ditandai {entry.answeredAt ? formatDate(entry.answeredAt) : formatDate(entry.updatedAt)}
                </p>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{entry.body}</p>
                {entry.gratitudeNote ? (
                  <p className="mt-3 flex gap-2 rounded-md border border-accent/50 bg-accent/15 p-3 text-sm leading-6">
                    <HandHeart className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span className="whitespace-pre-wrap">{entry.gratitudeNote}</span>
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        </Card>
      ) : null}
    </section>
  );
}
