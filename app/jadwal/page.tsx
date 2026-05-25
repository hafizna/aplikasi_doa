import { PageHeading } from "@/components/page-heading";
import { PrayerPanel } from "@/components/prayer-panel";

export const metadata = {
  title: "Jadwal Sholat & Kiblat"
};

export default function JadwalPage() {
  return (
    <main className="mx-auto min-h-screen max-w-3xl px-5 py-5 sm:px-8">
      <PageHeading eyebrow="Lokasi" title="Jadwal Sholat & Kiblat">
        Simpan lokasi sekali, lalu jadwal dan arah Ka&apos;bah dihitung lokal di perangkat ini.
      </PageHeading>
      <section className="mt-6">
        <PrayerPanel />
      </section>
    </main>
  );
}
