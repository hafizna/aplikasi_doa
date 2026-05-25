import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PageHeading({
  eyebrow,
  title,
  children
}: {
  eyebrow?: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <header className="flex items-start gap-4">
      <Button asChild variant="ghost" size="icon" aria-label="Kembali ke beranda">
        <Link href="/">
          <ArrowLeft className="h-5 w-5" />
        </Link>
      </Button>
      <div className="min-w-0 flex-1">
        {eyebrow ? <p className="text-sm font-medium text-muted-foreground">{eyebrow}</p> : null}
        <h1 className="text-2xl font-semibold">{title}</h1>
        {children ? <div className="mt-2 text-sm leading-6 text-muted-foreground">{children}</div> : null}
      </div>
    </header>
  );
}
