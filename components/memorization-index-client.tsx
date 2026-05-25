"use client";

import Link from "next/link";
import { BookOpenCheck, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import { PageHeading } from "@/components/page-heading";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  getDueMemorization,
  getMemorizationLabel,
  getMemorizationProgress,
  memorizationCandidates
} from "@/lib/memorization";
import { useMunajatStore } from "@/lib/store/munajat-store";

const filters = [
  { key: "semua", label: "Semua" },
  { key: "belajar", label: "Sedang dipelajari" },
  { key: "hari-ini", label: "Murajaah hari ini" }
] as const;

export function MemorizationIndexClient() {
  const memorization = useMunajatStore((state) => state.memorization);
  const [filter, setFilter] = useState<(typeof filters)[number]["key"]>("semua");
  const dueIds = useMemo(() => new Set(getDueMemorization(memorization).map((item) => item.doaId)), [memorization]);
  const filtered = useMemo(() => {
    if (filter === "belajar") {
      return memorizationCandidates.filter((doa) => getMemorizationProgress(memorization, doa.id));
    }

    if (filter === "hari-ini") {
      return memorizationCandidates.filter((doa) => dueIds.has(doa.id));
    }

    return memorizationCandidates;
  }, [dueIds, filter, memorization]);

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-5 py-5 sm:px-8">
      <PageHeading eyebrow="Latihan" title="Hafalan Mode">
        Latihan doa pelan-pelan: bantuan teks bertahap, self-check, dan murajaah lembut tanpa skor.
      </PageHeading>

      <section className="mt-6 flex gap-2 overflow-x-auto pb-1">
        {filters.map((item) => (
          <Button
            key={item.key}
            variant={filter === item.key ? "secondary" : "outline"}
            size="sm"
            onClick={() => setFilter(item.key)}
          >
            {item.label}
          </Button>
        ))}
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((doa) => {
          const progress = getMemorizationProgress(memorization, doa.id);

          return (
            <Link key={doa.id} href={`/hafalan/${doa.id}`} className="group">
              <Card className="flex min-h-44 flex-col justify-between p-5 transition group-hover:-translate-y-0.5 group-hover:border-primary/40 group-hover:shadow-calm">
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                      <BookOpenCheck className="h-5 w-5" />
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" />
                  </div>
                  <h2 className="mt-5 font-semibold">{doa.judul}</h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{doa.sumber.referensi}</p>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full bg-secondary px-3 py-1 text-xs text-secondary-foreground">
                    {getMemorizationLabel(progress)}
                  </span>
                  {dueIds.has(doa.id) ? (
                    <span className="rounded-full border px-3 py-1 text-xs text-muted-foreground">Murajaah</span>
                  ) : null}
                </div>
              </Card>
            </Link>
          );
        })}
      </section>
    </main>
  );
}
