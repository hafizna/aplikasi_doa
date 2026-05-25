import Link from "next/link";
import { ChevronRight, HeartHandshake, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { Reflection } from "@/lib/reflections";

export function ReflectionCard({
  reflection,
  daily = false
}: {
  reflection: Reflection;
  daily?: boolean;
}) {
  const Icon = reflection.kind === "kisah-harapan" ? Sparkles : HeartHandshake;

  return (
    <Link href={`/renungan/${reflection.id}`} className="group block">
      <Card className="flex h-full flex-col justify-between p-5 transition group-hover:-translate-y-0.5 group-hover:border-primary/40 group-hover:shadow-calm">
        <div>
          <div className="flex items-start justify-between gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
              <Icon className="h-5 w-5" />
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" />
          </div>
          <p className="mt-5 text-xs font-medium uppercase text-muted-foreground">
            {daily ? "Renungan hari ini" : reflection.kind === "kisah-harapan" ? "Kisah harapan" : "Saat kamu merasa"}
          </p>
          <h3 className="mt-1 font-semibold">{reflection.title}</h3>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{reflection.summary}</p>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">Sumber: {reflection.source}</p>
      </Card>
    </Link>
  );
}
