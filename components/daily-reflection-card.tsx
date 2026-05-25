"use client";

import { useEffect, useState } from "react";
import { ReflectionCard } from "@/components/reflection-card";
import { getDailyReflection, type Reflection } from "@/lib/reflections";

export function DailyReflectionCard() {
  const [reflection, setReflection] = useState<Reflection | null>(null);

  useEffect(() => {
    setReflection(getDailyReflection(new Date()));
  }, []);

  if (!reflection) {
    return null;
  }

  return <ReflectionCard reflection={reflection} daily />;
}
