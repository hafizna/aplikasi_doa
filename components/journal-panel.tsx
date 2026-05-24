"use client";

import { Check, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useMunajatStore } from "@/lib/store/munajat-store";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric"
  }).format(new Date(value));
}

export function JournalPanel() {
  const journal = useMunajatStore((state) => state.journal);
  const journalLocked = useMunajatStore((state) => state.journalLocked);
  const markAnswered = useMunajatStore((state) => state.markMunajatAnswered);
  const deleteMunajat = useMunajatStore((state) => state.deleteMunajat);
  const activeEntries = journal.filter((entry) => entry.status === "active");
  const answeredEntries = journal.filter((entry) => entry.status === "answered");

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
        <div className="mt-4 space-y-3">
          {activeEntries.length > 0 ? (
            activeEntries.map((entry) => (
              <div key={entry.id} className="rounded-md border bg-background/60 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{entry.title}</p>
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
            <p className="text-sm text-muted-foreground">Tidak ada hajat aktif saat ini.</p>
          )}
        </div>
      </Card>

      {answeredEntries.length > 0 ? (
        <Card className="p-5">
          <h2 className="font-semibold">Alhamdulillah, sudah dikabulkan</h2>
          <div className="mt-4 space-y-3">
            {answeredEntries.map((entry) => (
              <div key={entry.id} className="rounded-md border bg-background/60 p-4">
                <p className="font-medium">{entry.title}</p>
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
