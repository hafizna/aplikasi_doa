"use client";

import { useEffect } from "react";
import { useMunajatStore } from "@/lib/store/munajat-store";

export function ThemeEffect() {
  const settings = useMunajatStore((state) => state.settings);

  useEffect(() => {
    const root = document.documentElement;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const shouldUseDark = settings.theme === "dark" || (settings.theme === "auto" && prefersDark);

    root.classList.toggle("dark", shouldUseDark);
  }, [settings.theme]);

  return null;
}
