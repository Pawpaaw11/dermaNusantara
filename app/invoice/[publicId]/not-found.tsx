import Link from "next/link";

export default function InvoiceNotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-margin-mobile">
      <div className="ambient-shadow max-w-lg rounded-3xl border border-outline-variant/40 bg-surface p-8 text-center">
        <h1 className="font-headline-md text-headline-md text-primary">Invoice tidak ditemukan</h1>
        <p className="mt-4 font-body-md text-body-md text-on-surface-variant">
          Periksa kembali tautan invoice atau mulai donasi baru.
        </p>
        <Link className="mt-6 inline-flex rounded-full bg-primary px-6 py-3 font-label-md text-label-md text-on-primary" href="/#programs">
          Lihat Program
        </Link>
      </div>
    </main>
  );
}
