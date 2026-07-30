"use client";

export default function InvoiceError({ reset }: { reset: () => void }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-margin-mobile">
      <div className="ambient-shadow max-w-lg rounded-3xl border border-outline-variant/40 bg-surface p-8 text-center">
        <h1 className="font-headline-md text-headline-md text-primary">Invoice belum dapat dimuat</h1>
        <p className="mt-4 font-body-md text-body-md text-on-surface-variant">
          Pastikan API Derma Nusantara sedang berjalan, lalu coba kembali.
        </p>
        <button className="mt-6 rounded-full bg-primary px-6 py-3 font-label-md text-label-md text-on-primary" onClick={reset} type="button">
          Coba lagi
        </button>
      </div>
    </main>
  );
}
