"use client";

import Link from "next/link";
import { BookOpenCheck } from "lucide-react";
import type { Doa } from "@/lib/types/doa";
import { AudioPlayer } from "@/components/audio-player";
import { SourceLine } from "@/components/source-line";
import { Button } from "@/components/ui/button";
import { memorizationCandidates } from "@/lib/memorization";
import { useMunajatStore } from "@/lib/store/munajat-store";

const memorizationIds = new Set(memorizationCandidates.map((doa) => doa.id));

export function DoaContent({ doa, compact = false }: { doa: Doa; compact?: boolean }) {
  const settings = useMunajatStore((state) => state.settings);
  const canMemorize = memorizationIds.has(doa.id);

  return (
    <article className="soft-enter space-y-5">
      <div>
        <h2 className={compact ? "text-xl font-semibold" : "text-2xl font-semibold"}>{doa.judul}</h2>
        {doa.konteks ? <p className="mt-2 text-sm leading-6 text-muted-foreground">{doa.konteks}</p> : null}
      </div>

      <p
        className="arabic-text font-arabic text-card-foreground"
        style={{ fontSize: `${settings.arabicFontSize}px` }}
      >
        {doa.arab}
      </p>

      {settings.showLatin ? (
        <p className="rounded-md bg-secondary/60 p-4 text-sm leading-7 text-secondary-foreground">{doa.latin}</p>
      ) : null}

      {settings.showTranslation ? <p className="text-sm leading-7 text-muted-foreground">{doa.terjemah}</p> : null}

      {doa.keutamaan ? (
        <p className="rounded-md border border-accent/50 bg-accent/15 p-3 text-sm leading-6">{doa.keutamaan}</p>
      ) : null}

      <SourceLine doa={doa} />
      {canMemorize ? (
        <Button asChild variant="outline" size="sm" className="w-fit">
          <Link href={`/hafalan/${doa.id}`}>
            <BookOpenCheck className="h-4 w-4" />
            Latih hafalan
          </Link>
        </Button>
      ) : null}
      <AudioPlayer doa={doa} />
    </article>
  );
}
