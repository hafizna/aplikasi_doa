"use client";

import { useEffect } from "react";
import { useMunajatStore } from "@/lib/store/munajat-store";

export function StoreHydrator() {
  const hydrate = useMunajatStore((state) => state.hydrate);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  return null;
}
