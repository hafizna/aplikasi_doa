"use client";

import { useMemo, useState } from "react";
import { PageHeading } from "@/components/page-heading";
import { ReflectionCard } from "@/components/reflection-card";
import { Button } from "@/components/ui/button";
import { reflections } from "@/lib/reflections";

const filters = [
  { key: "semua", label: "Semua" },
  { key: "saat-merasa", label: "Saat Kamu Merasa" },
  { key: "kisah-harapan", label: "Kisah Harapan" }
] as const;

export function ReflectionsIndexClient() {
  const [filter, setFilter] = useState<(typeof filters)[number]["key"]>("semua");
  const filtered = useMemo(
    () => reflections.filter((reflection) => filter === "semua" || reflection.kind === filter),
    [filter]
  );

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-5 py-5 sm:px-8">
      <PageHeading eyebrow="Konteks hati" title="Renungan Hati">
        Refleksi singkat yang menghubungkan keadaan hati, kisah harapan, doa terkait, dan satu langkah kecil.
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
        {filtered.map((reflection) => (
          <ReflectionCard key={reflection.id} reflection={reflection} />
        ))}
      </section>
    </main>
  );
}
