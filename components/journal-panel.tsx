"use client";

import { Check, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { hopeOptions } from "@/lib/curation";
import type { HopeKey } from "@/lib/types/doa";
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

export function JournalPanel() {
  const journal = useMunajatStore((state) => state.journal);
  const journalLocked = useMunajatStore((state) => state.journalLocked);
  const markAnswered = useMunajatStore((state) => state.markMunajatAnswered);
  const deleteMunajat = useMunajatStore((state) => state.deleteMunajat);
  const [filter, setFilter] = useState<HopeKey | "semua">("semua");

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
            filteredActive.map((entry) => (
              <div key={entry.id} className="rounded-md border bg-background/60 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">{entry.title}</p>
                      <CategoryBadge hopeKey={entry.hopeKey} />
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">Mulai {formatDate(entry.createdAt)}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      aria-label="Tandai terkabul"
                      disabled={journalLocked && entry.encrypted}
                      onClick={() => entry.id && void markAnswered(entry.id)}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Hapus hajat"
                      disabled={journalLocked && entry.encrypted}
                      onClick={() => entry.id && void deleteMunajat(entry.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{entry.body}</p>
              </div>
            ))
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
              </div>
            ))}
          </div>
        </Card>
      ) : null}
    </section>
  );
}
