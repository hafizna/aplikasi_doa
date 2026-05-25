"use client";

import Link from "next/link";
import { CalendarDays, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { PageHeading } from "@/components/page-heading";
import { Card } from "@/components/ui/card";
import { getPrimarySeasonalSignal, type SeasonalSignal } from "@/lib/hijri-calendar";
import { seasonalEvents } from "@/lib/seasonal-events";

export function SeasonalIndexClient() {
  const [signal, setSignal] = useState<SeasonalSignal | null>(null);

  useEffect(() => {
    setSignal(getPrimarySeasonalSignal(new Date()));
  }, []);

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-5 py-5 sm:px-8">
      <PageHeading eyebrow="Kalender" title="Hari Istimewa">
        Momen Hijriah, puasa sunnah, Jumat, Ramadan, dan catatan amalan dengan sumber.
      </PageHeading>

      {signal ? (
        <section className="mt-6">
          <Link href={`/hari-ini/${signal.event.id}`} className="group">
            <Card className="border-l-4 border-accent p-5 transition group-hover:border-primary/40 group-hover:shadow-calm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-medium uppercase text-muted-foreground">{signal.label}</p>
                  <h2 className="mt-1 text-xl font-semibold">{signal.event.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{signal.event.summary}</p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" />
              </div>
            </Card>
          </Link>
        </section>
      ) : null}

      <section className="mt-6 grid gap-4 sm:grid-cols-2">
        {seasonalEvents.map((event) => (
          <Link key={event.id} href={`/hari-ini/${event.id}`} className="group">
            <Card className="flex min-h-36 flex-col justify-between p-5 transition group-hover:-translate-y-0.5 group-hover:border-primary/40 group-hover:shadow-calm">
              <div className="flex items-start justify-between gap-3">
                <CalendarDays className="h-5 w-5 text-primary" />
                <ChevronRight className="h-5 w-5 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" />
              </div>
              <div>
                <p className="mt-5 text-xs text-muted-foreground">{event.dateLabel}</p>
                <h2 className="mt-1 font-semibold">{event.title}</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{event.summary}</p>
              </div>
            </Card>
          </Link>
        ))}
      </section>
    </main>
  );
}
