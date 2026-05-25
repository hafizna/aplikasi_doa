import { notFound } from "next/navigation";
import { ReflectionDetailClient } from "@/components/reflection-detail-client";
import { getReflectionById, reflections } from "@/lib/reflections";

export function generateStaticParams() {
  return reflections.map((reflection) => ({
    reflectionId: reflection.id
  }));
}

export function generateMetadata({ params }: { params: { reflectionId: string } }) {
  const reflection = getReflectionById(params.reflectionId);

  if (!reflection) {
    return {
      title: "Renungan Hati"
    };
  }

  return {
    title: reflection.title,
    description: reflection.summary
  };
}

export default function ReflectionPage({ params }: { params: { reflectionId: string } }) {
  const reflection = getReflectionById(params.reflectionId);

  if (!reflection) {
    notFound();
  }

  return <ReflectionDetailClient reflection={reflection} />;
}
