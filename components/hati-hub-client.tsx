"use client";

import Link from "next/link";
import { ChevronRight, Library, PenLine } from "lucide-react";
import { DailyReflectionCard } from "@/components/daily-reflection-card";
import { PageHeading } from "@/components/page-heading";
import { Card } from "@/components/ui/card";

const actions = [
  {
    href: "/doa-sesuai-hati",
    title: "Susun Doa Sesuai Hati",
    description: "Pilih suasana hati dan hajatmu, lalu terima rangkaian doa terkurasi dan ruang menulis munajat.",
    icon: PenLine
  },
  {
    href: "/renungan",
    title: "Semua renungan",
    description: "Jelajahi kisah harapan para nabi dan renungan untuk saat hati sedang berat.",
    icon: Library
  }
] as const;

export function HatiHubClient() {
  return (
    <main className="mx-auto min-h-screen max-w-3xl px-5 py-5 sm:px-8">
      <PageHeading eyebrow="Suasana hati" title="Suasana Hati">
        Mulai dari keadaan hatimu hari ini — baca renungan singkat, atau susun doa yang sesuai.
      </PageHeading>

      <section className="mt-6">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-primary/80">Renungan hari ini</h2>
        <DailyReflectionCard />
      </section>

      <section className="mt-6 grid gap-4">
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <Link key={action.href} href={action.href} className="group block">
              <Card className="flex items-center gap-4 p-5 transition group-hover:-translate-y-0.5 group-hover:border-primary/40 group-hover:shadow-calm">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold">{action.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">{action.description}</p>
                </div>
                <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" />
              </Card>
            </Link>
          );
        })}
      </section>
    </main>
  );
}
