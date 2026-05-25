"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, BookOpen, Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getChapterVerses, type QuranVerse } from "@/lib/quran";
import { getContextLabel, getContextualReadings, getPassageById, quranPassages } from "@/lib/quran-context";
import { useMunajatStore } from "@/lib/store/munajat-store";

export function QuranReader() {
  const searchParams = useSearchParams();
  const settings = useMunajatStore((state) => state.settings);
  const initialId = searchParams.get("passage");
  const [selectedId, setSelectedId] = useState<string | null>(initialId);
  const [verses, setVerses] = useState<QuranVerse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const contextLabel = useMemo(() => getContextLabel(), []);
  const contextualIds = useMemo(() => new Set(getContextualReadings().map((passage) => passage.id)), []);
  const selected = selectedId ? getPassageById(selectedId) : undefined;

  useEffect(() => {
    if (!selected) {
      setVerses([]);
      return;
    }

    let active = true;
    setLoading(true);
    setError("");

    getChapterVerses(selected.surah)
      .then((data) => {
        if (active) {
          setVerses(data);
        }
      })
      .catch(() => {
        if (active) {
          setError("Gagal memuat surat. Pastikan ada koneksi internet saat pertama membuka, lalu tersimpan untuk offline.");
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [selected]);

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-5 py-5 sm:px-8">
      <header className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon" aria-label="Kembali">
          <Link href={selected ? "/quran" : "/"} onClick={() => selected && setSelectedId(null)}>
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <p className="text-sm font-medium text-muted-foreground">Bacaan Al-Qur&apos;an</p>
          <h1 className="text-2xl font-semibold">{selected ? `${selected.nama} (${selected.arti})` : "Tilawah pilihan"}</h1>
        </div>
      </header>

      {!selected ? (
        <section className="mt-7 space-y-4">
          {contextLabel ? (
            <Card className="border-primary/40 bg-accent/15 p-4">
              <p className="text-sm font-medium">{contextLabel}</p>
            </Card>
          ) : null}

          <p className="text-sm text-muted-foreground">
            Surat-surat pilihan dengan keutamaan dan waktu baca yang ma&apos;tsur. Teks dimuat dari Quran.com.
          </p>

          <div className="grid gap-3">
            {quranPassages.map((passage) => (
              <button
                key={passage.id}
                type="button"
                onClick={() => setSelectedId(passage.id)}
                className="rounded-lg border bg-background/70 p-4 text-left transition hover:border-primary/40 hover:bg-secondary"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-primary" />
                    <span className="font-semibold">
                      {passage.nama} · {passage.arti}
                    </span>
                  </div>
                  {contextualIds.has(passage.id) ? (
                    <span className="rounded-full bg-primary px-2.5 py-0.5 text-xs font-medium text-primary-foreground">
                      Disarankan kini
                    </span>
                  ) : null}
                </div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{passage.deskripsi}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {passage.ayatCount} ayat{passage.sumber ? ` · ${passage.sumber}` : ""}
                </p>
              </button>
            ))}
          </div>
        </section>
      ) : (
        <section className="mt-7 space-y-4">
          {selected.sumber ? (
            <p className="rounded-md border border-accent/50 bg-accent/15 p-3 text-sm leading-6">
              {selected.deskripsi} <span className="text-muted-foreground">({selected.sumber})</span>
            </p>
          ) : (
            <p className="text-sm leading-6 text-muted-foreground">{selected.deskripsi}</p>
          )}

          {loading ? (
            <div className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Memuat {selected.nama}...
            </div>
          ) : null}

          {error ? <Card className="p-4 text-sm text-muted-foreground">{error}</Card> : null}

          {!loading && !error
            ? verses.map((verse) => (
                <Card key={verse.verseKey} className="p-5 sm:p-7">
                  <div className="mb-3 flex justify-end">
                    <span className="flex h-7 min-w-7 items-center justify-center rounded-full bg-secondary px-2 text-xs font-medium text-secondary-foreground tabular-nums">
                      {verse.ayah}
                    </span>
                  </div>
                  <p
                    className="arabic-text font-arabic text-card-foreground"
                    style={{ fontSize: `${settings.arabicFontSize}px` }}
                  >
                    {verse.arab}
                  </p>
                  {settings.showTranslation && verse.terjemah ? (
                    <p className="mt-4 text-sm leading-7 text-muted-foreground">{verse.terjemah}</p>
                  ) : null}
                </Card>
              ))
            : null}
        </section>
      )}
    </main>
  );
}
