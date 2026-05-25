import { AdvancedPanel } from "@/components/advanced-panel";
import { PageHeading } from "@/components/page-heading";
import { SettingsPanel } from "@/components/settings-panel";

export const metadata = {
  title: "Pengaturan"
};

export default function PengaturanPage() {
  return (
    <main className="mx-auto min-h-screen max-w-3xl px-5 py-5 sm:px-8">
      <PageHeading eyebrow="Preferensi" title="Pengaturan & Privasi">
        Atur tampilan bacaan, journal terenkripsi, export/import, notifikasi, dan statistik lembut.
      </PageHeading>
      <section className="mt-6 grid gap-5">
        <SettingsPanel />
        <AdvancedPanel />
      </section>
    </main>
  );
}
