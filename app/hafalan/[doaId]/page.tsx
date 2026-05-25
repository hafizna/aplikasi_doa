import { notFound } from "next/navigation";
import { MemorizationPracticeClient } from "@/components/memorization-practice-client";
import { getMemorizationDoa, memorizationCandidates } from "@/lib/memorization";

export function generateStaticParams() {
  return memorizationCandidates.map((doa) => ({
    doaId: doa.id
  }));
}

export function generateMetadata({ params }: { params: { doaId: string } }) {
  const doa = getMemorizationDoa(params.doaId);

  if (!doa) {
    return {
      title: "Hafalan Mode"
    };
  }

  return {
    title: `Hafalan ${doa.judul}`,
    description: doa.sumber.referensi
  };
}

export default function HafalanPracticePage({ params }: { params: { doaId: string } }) {
  const doa = getMemorizationDoa(params.doaId);

  if (!doa) {
    notFound();
  }

  return <MemorizationPracticeClient doa={doa} />;
}
