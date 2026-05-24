"use client";

import type { Doa } from "@/lib/types/doa";
import { AudioPlayer } from "@/components/audio-player";
import { SourceLine } from "@/components/source-line";
import { useMunajatStore } from "@/lib/store/munajat-store";

export function DoaContent({ doa, compact = false }: { doa: Doa; compact?: boolean }) {
  const settings = useMunajatStore((state) => state.settings);

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
      <AudioPlayer doa={doa} />
    </article>
  );
}
