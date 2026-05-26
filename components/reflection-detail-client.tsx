"use client";

import Link from "next/link";
import { BookOpen, Heart, PenLine } from "lucide-react";
import { DoaContent } from "@/components/doa-content";
import { PageHeading } from "@/components/page-heading";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getReflectionDoa, type Reflection } from "@/lib/reflections";

export function ReflectionDetailClient({ reflection }: { reflection: Reflection }) {
  const relatedDoa = getReflectionDoa(reflection);

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-5 py-5 sm:px-8">
      <PageHeading
        eyebrow={reflection.kind === "kisah-harapan" ? "Kisah Harapan" : "Saat Kamu Merasa"}
        title={reflection.title}
      >
        {reflection.mood}
      </PageHeading>

      <section className="mt-6 grid gap-5">
        <Card className="p-5 sm:p-7">
          <Heart className="h-5 w-5 text-primary" />
          <p className="mt-4 text-lg leading-8">{reflection.summary}</p>

          <div className="mt-5 space-y-4 border-t pt-5 text-sm leading-7 text-muted-foreground">
            <p>{reflection.story}</p>
            <p>{reflection.lesson}</p>
          </div>

          <div className="mt-5 rounded-md border border-accent/50 bg-accent/15 p-4">
            <h2 className="text-sm font-semibold">Satu langkah kecil</h2>
            <p className="mt-2 text-sm leading-7">{reflection.action}</p>
          </div>

          <p className="mt-5 text-xs leading-5 text-muted-foreground">
            Sumber: {reflection.source}
            {reflection.sourceNote ? ` — ${reflection.sourceNote}` : ""}
          </p>
        </Card>

        {relatedDoa.length > 0 ? (
          <Card className="p-5 sm:p-7">
            <BookOpen className="h-5 w-5 text-primary" />
            <h2 className="mt-4 text-xl font-semibold">Doa yang menyertai</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Bacaan ma&apos;tsur yang sejalan dengan keadaan ini — semuanya dari koleksi doa yang sumbernya tercantum.
            </p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <Button asChild>
                <Link href="/doa-sesuai-hati">
                  <PenLine className="h-4 w-4" />
                  Lanjut ke Doa Sesuai Hati
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/jelajah">Jelajah doa lain</Link>
              </Button>
            </div>
          </Card>
        ) : null}

        {relatedDoa.map((doa) => (
          <Card key={doa.id} className="p-5 sm:p-7">
            <DoaContent doa={doa} compact />
          </Card>
        ))}
      </section>
    </main>
  );
}
