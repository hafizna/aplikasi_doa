import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PageHeading({
  eyebrow,
  title,
  backHref = "/",
  action,
  children
}: {
  eyebrow?: string;
  title: string;
  backHref?: string;
  action?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <header className="flex items-start gap-3 sm:gap-4">
      <Button asChild variant="ghost" size="icon" aria-label="Kembali" className="mt-0.5 shrink-0">
        <Link href={backHref}>
          <ArrowLeft className="h-5 w-5" />
        </Link>
      </Button>
      <div className="min-w-0 flex-1">
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-wide text-primary/80">{eyebrow}</p>
        ) : null}
        <h1 className="text-2xl font-semibold leading-tight sm:text-3xl">{title}</h1>
        {children ? <div className="mt-2 text-sm leading-6 text-muted-foreground">{children}</div> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </header>
  );
}
