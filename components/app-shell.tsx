import type { ReactNode } from "react";
import { StoreHydrator } from "@/components/store-hydrator";
import { ThemeEffect } from "@/components/theme-effect";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <>
      <StoreHydrator />
      <ThemeEffect />
      {children}
    </>
  );
}
