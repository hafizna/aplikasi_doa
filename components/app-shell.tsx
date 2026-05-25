import type { ReactNode } from "react";
import { NotificationSync } from "@/components/notification-sync";
import { StoreHydrator } from "@/components/store-hydrator";
import { ThemeEffect } from "@/components/theme-effect";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <>
      <StoreHydrator />
      <ThemeEffect />
      <NotificationSync />
      {children}
    </>
  );
}
