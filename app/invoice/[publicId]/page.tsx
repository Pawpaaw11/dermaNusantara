import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, HelpCircle, Info, MessageCircle } from "lucide-react";
import { CopyButton, ShareInvoiceButton } from "@/components/InvoiceActions";
import { getInvoice, type Invoice } from "@/lib/api/invoices";

type InvoicePageProps = {
  params: Promise<{ publicId: string }>;
};

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Invoice Donasi | Derma Nusantara",
  description: "Detail invoice dan instruksi pembayaran donasi.",
  robots: { index: false, follow: false },
};

const currencyFormatter = new Intl.NumberFormat("id-ID");
const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "full",
  timeZone: "Asia/Jakarta",
});
const timeFormatter = new Intl.DateTimeFormat("id-ID", {
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
  timeZone: "Asia/Jakarta",
});

const statusPresentation: Record<
  Invoice["status"],
  { label: string; className: string }
> = {
  PENDING_PAYMENT: {
    label: "MENUNGGU PEMBAYARAN",
    className: "bg-tertiary-container text-on-tertiary-container",
  },
  PAID: {
    label: "LUNAS",
    className: "bg-secondary-container text-on-secondary-container",
  },
  FAILED: {
    label: "GAGAL",
    className: "bg-error-container text-on-error-container",
  },
  EXPIRED: {
    label: "KEDALUWARSA",
    className: "bg-surface-container-high text-on-surface-variant",
  },
  CANCELLED: {
    label: "DIBATALKAN",
    className: "bg-surface-container-high text-on-surface-variant",
  },
};

function formatCurrency(value: number) {
  return `Rp ${currencyFormatter.format(value)}`;
}

export default async function InvoicePage({ params }: InvoicePageProps) {
  const { publicId } = await params;
  const invoice = await getInvoice(publicId);
  if (!invoice) notFound();

  const createdAt = new Date(invoice.createdAt);
  const expiresAt = new Date(invoice.expiresAt);
  const status =
    statusPresentation[invoice.status] ?? statusPresentation.PENDING_PAYMENT;
  const contribution =
    invoice.contribution.inputType === "QUANTITY"
      ? `${invoice.contribution.quantity} ${invoice.contribution.unitLabel} × ${formatCurrency(invoice.contribution.unitPrice)}`
      : formatCurrency(invoice.baseAmount);

  return (
    <main className="relative min-h-screen overflow-hidden bg-surface px-margin-mobile pb-16 text-on-surface md:px-margin-desktop">
      <div aria-hidden className="fixed left-0 top-0 -z-10 h-[420px] w-full rounded-b-[70%] bg-primary-fixed-dim/35 blur-xl" />
      <div aria-hidden className="fixed bottom-[-18rem] right-[-12rem] -z-10 size-[34rem] rounded-full bg-secondary-container/55 blur-[110px]" />

      <header className="sticky top-0 z-40 -mx-margin-mobile border-b border-white/50 bg-surface/70 px-margin-mobile py-4 backdrop-blur-xl md:-mx-margin-desktop md:px-margin-desktop">
        <div className="mx-auto flex max-w-container-max items-center justify-between gap-4">
          <Link className="inline-flex items-center gap-2 font-label-md text-label-md text-primary transition-colors hover:text-secondary" href={`/donasi/${invoice.campaign.slug}`}>
            <ArrowLeft size={18} />
            Kembali
          </Link>
          <Link className="font-display-lg-mobile text-[1.1rem] font-extrabold uppercase leading-none md:text-[1.35rem]" href="/">
            <span className="text-[#3FA18C]">Derma</span>{" "}
            <span className="text-[#217DA2]">Nusantara</span>
          </Link>
          <div className="flex items-center gap-2 text-primary">
            <Link aria-label="Bantuan" className="flex size-9 items-center justify-center rounded-full bg-white/60 transition-colors hover:bg-primary-fixed" href="/">
              <HelpCircle size={18} />
            </Link>
            <ShareInvoiceButton />
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-xl flex-col gap-5 py-8 md:py-12">
        <section className="flex items-end justify-between gap-4 px-1">
          <div>
            <p className="mb-1 font-label-sm text-label-sm uppercase text-on-surface-variant">Detail Donatur</p>
            <h1 className="font-headline-md-mobile text-headline-md-mobile text-primary md:font-headline-md md:text-headline-md">
              {invoice.donorDisplayName}
            </h1>
          </div>
          <span className={`rounded-full px-4 py-2 font-label-sm text-label-sm ${status.className}`}>
            {status.label}
          </span>
        </section>

        <section className="ambient-shadow space-y-6 rounded-2xl border border-white/70 bg-white/55 p-5 backdrop-blur-2xl md:p-7">
          <div>
            <p className="mb-3 font-label-sm text-label-sm uppercase text-on-surface-variant">Informasi Transaksi</p>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="mb-1 font-label-sm text-label-sm text-on-surface-variant">Invoice Donasi</p>
                <p className="break-all font-label-md text-label-md text-primary">{invoice.invoiceNumber}</p>
              </div>
              <div>
                <p className="mb-1 font-label-sm text-label-sm text-on-surface-variant">Tanggal</p>
                <p className="font-body-md text-body-md font-semibold text-primary">
                  {dateFormatter.format(createdAt)}
                  <br />
                  <span className="font-label-md text-label-md font-normal text-on-surface-variant">
                    pukul {timeFormatter.format(createdAt)} WIB
                  </span>
                </p>
              </div>
            </div>
          </div>
          <div className="h-px w-full bg-white/70" />
          <div>
            <p className="mb-3 font-label-sm text-label-sm uppercase text-on-surface-variant">Program Pilihan</p>
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <p className="font-headline-sm text-headline-sm text-primary">{invoice.campaign.title}</p>
                <p className="mt-2 font-body-md text-body-md text-on-surface-variant">{contribution}</p>
              </div>
              <div className="md:text-right">
                <p className="mb-1 font-label-sm text-label-sm uppercase text-on-surface-variant">Total Donasi</p>
                <p className="font-headline-md-mobile text-headline-md-mobile text-secondary md:font-headline-md md:text-headline-md">
                  {formatCurrency(invoice.baseAmount)}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="ambient-shadow rounded-2xl border border-white/70 bg-white/55 p-5 backdrop-blur-2xl md:p-7">
          <div className="mb-5 flex items-center gap-2 text-primary">
            <Info size={18} />
            <h2 className="font-label-sm text-label-sm uppercase">Instruksi Pembayaran</h2>
          </div>
          <div className="mb-5 rounded-2xl border border-white/80 bg-white/60 p-4">
            <div className="mb-2 flex items-center justify-between gap-4">
              <span className="font-label-sm text-label-sm uppercase text-on-surface-variant">Metode</span>
              <span className="font-label-md text-label-md text-primary">{invoice.payment.methodName}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="font-label-sm text-label-sm uppercase text-on-surface-variant">Batas Pembayaran</span>
              <span className="text-right font-label-md text-label-md text-secondary">
                {dateFormatter.format(expiresAt)}, {timeFormatter.format(expiresAt)} WIB
              </span>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl bg-primary-container p-5 text-on-primary shadow-xl shadow-primary/20 md:p-6">
            <div aria-hidden className="absolute -right-12 -top-12 size-32 rounded-full bg-white/10 blur-2xl" />
            <div aria-hidden className="absolute -bottom-12 -left-12 size-28 rounded-full bg-secondary/20 blur-2xl" />
            <div className="relative z-10 mb-5 flex flex-col justify-between gap-3 border-b border-white/20 pb-5 md:flex-row md:items-center">
              <div>
                <p className="mb-1 font-label-sm text-label-sm uppercase text-primary-fixed-dim">Bank Tujuan</p>
                <p className="font-label-md text-label-md text-on-primary">{invoice.payment.bankName ?? "-"}</p>
              </div>
              <div className="md:text-right">
                <p className="mb-1 font-label-sm text-label-sm uppercase text-primary-fixed-dim">Atas Nama</p>
                <p className="font-label-md text-label-md text-on-primary">{invoice.payment.accountHolderName ?? "-"}</p>
              </div>
            </div>
            <div className="relative z-10 mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="mb-1 font-label-sm text-label-sm uppercase text-primary-fixed-dim">Nomor Rekening</p>
                <p className="font-headline-sm text-headline-sm text-on-primary">{invoice.payment.accountNumber ?? "-"}</p>
              </div>
              {invoice.payment.accountNumber ? <CopyButton label="Salin nomor rekening" value={invoice.payment.accountNumber} /> : null}
            </div>
            <div className="relative z-10 flex items-center justify-between gap-4">
              <div>
                <p className="mb-1 font-label-sm text-label-sm uppercase text-primary-fixed-dim">Jumlah Transfer</p>
                <p className="font-headline-sm text-headline-sm text-secondary-fixed">{formatCurrency(invoice.payableAmount)}</p>
                {invoice.uniqueCode > 0 ? (
                  <p className="mt-1 font-label-sm text-label-sm text-primary-fixed-dim">
                    Termasuk kode unik {currencyFormatter.format(invoice.uniqueCode)}
                  </p>
                ) : null}
              </div>
              <CopyButton label="Salin jumlah transfer" value={String(invoice.payableAmount)} />
            </div>
          </div>

          {invoice.payment.instructions.length > 0 ? (
            <ol className="mt-5 list-decimal space-y-2 pl-5 font-body-md text-body-md text-on-surface-variant">
              {invoice.payment.instructions.map((instruction) => <li key={instruction}>{instruction}</li>)}
            </ol>
          ) : null}
        </section>

        <Link className="ambient-shadow inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-8 py-4 font-label-md text-label-md text-on-primary transition-colors hover:bg-primary-container" href={invoice.confirmation.whatsappUrl}>
          <MessageCircle size={20} />
          Konfirmasi Transfer via WA
        </Link>
      </div>
    </main>
  );
}
