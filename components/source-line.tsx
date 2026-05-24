import type { Doa } from "@/lib/types/doa";

export function SourceLine({ doa }: { doa: Doa }) {
  return (
    <p className="text-xs leading-5 text-muted-foreground">
      Sumber: {doa.sumber.referensi}
      {doa.sumber.derajat ? ` (${doa.sumber.derajat})` : ""}
      {doa.sumber.kitabSumber ? ` - ${doa.sumber.kitabSumber}` : ""}
    </p>
  );
}
