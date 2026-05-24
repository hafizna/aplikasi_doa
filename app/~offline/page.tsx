import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function OfflinePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center px-6 py-12">
      <p className="text-sm font-medium text-muted-foreground">Munajat offline</p>
      <h1 className="mt-3 text-3xl font-semibold">Koneksi sedang tidak tersedia.</h1>
      <p className="mt-4 text-muted-foreground">
        Halaman utama dan flow dzikir yang sudah tersimpan tetap bisa dibuka saat offline.
      </p>
      <Button asChild className="mt-8 w-fit">
        <Link href="/">Kembali ke beranda</Link>
      </Button>
    </main>
  );
}
