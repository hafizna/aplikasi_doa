import { Suspense } from "react";
import { QuranReader } from "@/components/quran-reader";

export const metadata = {
  title: "Bacaan Al-Qur'an"
};

export default function QuranPage() {
  return (
    <Suspense>
      <QuranReader />
    </Suspense>
  );
}
