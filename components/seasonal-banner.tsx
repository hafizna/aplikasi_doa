"use client";

import Link from "next/link";
import { CalendarDays, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getHijriDisplay, getPrimarySeasonalSignal, type SeasonalSignal } from "@/lib/hijri-calendar";

export function SeasonalBanner({ compact = false }: { compact?: boolean }) {
  const [signal, setSignal] = useState<SeasonalSignal | null>(null);
  const [hijriLabel, setHijriLabel] = useState("");

  useEffect(() => {
    const now = new Date();
    setSignal(getPrimarySeasonalSignal(now));
    setHijriLabel(getHijriDisplay(now));
  }, []);

  if (!signal) {
    return (
      <Card className={compact ? "p-4" : "mt-6 p-4"}>
        <div className="flex items-center gap-3">
          <CalendarDays className="h-5 w-5 text-primary" />
          <div>
            <p className="text-sm font-medium">Kalender Hijriah</p>
            <p className="text-xs text-muted-foreground">{hijriLabel || "Menghitung tanggal Hijriah..."}</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={compact ? "overflow-hidden p-0" : "mt-6 overflow-hidden p-0"}>
      <div className="border-l-4 border-accent p-5">
        <div className="flex items-start gap-3">
          <CalendarDays className="mt-1 h-5 w-5 text-primary" />
          <div className="flex-1">
            <p className="text-xs font-medium uppercase text-muted-foreground">{signal.label}</p>
            <h2 className={compact ? "mt-1 text-lg font-semibold" : "mt-1 text-xl font-semibold"}>
              {signal.event.title}
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{signal.event.summary}</p>
          </div>
        </div>
        <Button asChild variant="secondary" className="mt-4 w-full justify-between sm:w-auto">
          <Link href={`/hari-ini/${signal.event.id}`}>
            Pelajari amalan hari ini
            <ChevronRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </Card>
  );
}
