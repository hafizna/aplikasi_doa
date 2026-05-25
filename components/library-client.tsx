"use client";

import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { DoaContent } from "@/components/doa-content";
import { SettingsPanel } from "@/components/settings-panel";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { allDoa } from "@/lib/data/doa";
import type { KategoriDoa } from "@/lib/types/doa";

const categoryLabels: Record<KategoriDoa | "semua", string> = {
  semua: "Semua",
  "dzikir-setelah-sholat": "Setelah sholat",
  "dzikir-pagi": "Dzikir pagi",
  "dzikir-petang": "Dzikir petang",
  "doa-harian": "Doa harian",
  "doa-tematik": "Tematik",
  "doa-musiman": "Musiman",
  "munajat-personal": "Munajat"
};

const categories = Array.from(new Set(allDoa.map((doa) => doa.kategori)));
const tags = Array.from(new Set(allDoa.flatMap((doa) => doa.tags))).sort((a, b) => a.localeCompare(b));

export function LibraryClient() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<KategoriDoa | "semua">("semua");
  const [tag, setTag] = useState<string>("semua");

  const filteredDoa = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return allDoa.filter((doa) => {
      const matchesCategory = category === "semua" || doa.kategori === category;
      const matchesTag = tag === "semua" || doa.tags.includes(tag);
      const haystack = [
        doa.judul,
        doa.latin,
        doa.terjemah,
        doa.sumber.referensi,
        doa.sumber.kitabSumber ?? "",
        doa.tags.join(" ")
      ]
        .join(" ")
        .toLowerCase();
      const matchesQuery = !normalizedQuery || haystack.includes(normalizedQuery);

      return matchesCategory && matchesTag && matchesQuery;
    });
  }, [category, query, tag]);

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-5 py-5 sm:px-8">
      <header className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon" aria-label="Kembali ke beranda">
          <Link href="/">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <p className="text-sm font-medium text-muted-foreground">Perpustakaan doa</p>
          <h1 className="text-2xl font-semibold">Jelajah Doa</h1>
        </div>
      </header>

      <section className="mt-7 space-y-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="h-12 w-full rounded-md border bg-background pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-ring"
            placeholder="Cari judul, tag, latin, terjemah, atau sumber"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          <Button
            variant={category === "semua" ? "secondary" : "outline"}
            size="sm"
            onClick={() => setCategory("semua")}
          >
            Semua
          </Button>
          {categories.map((item) => (
            <Button
              key={item}
              variant={category === item ? "secondary" : "outline"}
              size="sm"
              onClick={() => setCategory(item)}
            >
              {categoryLabels[item]}
            </Button>
          ))}
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          <Button variant={tag === "semua" ? "secondary" : "outline"} size="sm" onClick={() => setTag("semua")}>
            Semua tag
          </Button>
          {tags.map((item) => (
            <Button
              key={item}
              variant={tag === item ? "secondary" : "outline"}
              size="sm"
              onClick={() => setTag(item)}
            >
              {item}
            </Button>
          ))}
        </div>
      </section>

      <section className="mt-7 grid gap-4">
        <p className="text-sm text-muted-foreground">{filteredDoa.length} doa ditemukan</p>
        {filteredDoa.length > 0 ? (
          filteredDoa.map((doa) => (
            <Card key={doa.id} className="p-5 sm:p-7">
              <div className="mb-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-secondary px-3 py-1 text-xs text-secondary-foreground">
                  {categoryLabels[doa.kategori]}
                </span>
                {doa.tags.slice(0, 4).map((item) => (
                  <span key={item} className="rounded-full border px-3 py-1 text-xs text-muted-foreground">
                    {item}
                  </span>
                ))}
              </div>
              <DoaContent doa={doa} compact />
            </Card>
          ))
        ) : (
          <Card className="p-5">
            <p className="text-sm text-muted-foreground">Tidak ada doa yang cocok dengan filter saat ini.</p>
          </Card>
        )}
      </section>

      <section className="mt-6 pb-8">
        <SettingsPanel />
      </section>
    </main>
  );
}
