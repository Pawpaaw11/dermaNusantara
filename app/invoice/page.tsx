import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  Copy,
  HelpCircle,
  Info,
  MessageCircle,
  Share2,
} from "lucide-react";
import { getProgramBySlug, programs } from "@/data/landing-page";

type InvoicePageProps = {
  searchParams: Promise<{
    amount?: string;
    donor?: string;
    method?: string;
    program?: string;
    quantity?: string;
  }>;
};

const paymentMethodLabels: Record<string, string> = {
  "bank-transfer": "Transfer Bank",
  qris: "QRIS",
};

const currencyFormatter = new Intl.NumberFormat("id-ID");

export const metadata: Metadata = {
  title: "Invoice Donasi | Derma Nusantara",
  description:
    "Detail invoice dan instruksi pembayaran donasi Derma Nusantara.",
};

function formatCurrency(value: number) {
  return `Rp ${currencyFormatter.format(value)}`;
}

function parsePositiveNumber(value: string | undefined, fallback: number) {
  const parsedValue = Number(value);

  if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
    return fallback;
  }

  return parsedValue;
}

function createInvoiceId(programSlug: string, amount: number) {
  const cleanSlug = programSlug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  return `DN-${cleanSlug || "DON"}-${amount.toString(36).toUpperCase()}-20260730`;
}

export default async function InvoicePage({ searchParams }: InvoicePageProps) {
  const params = await searchParams;
  const program =
    getProgramBySlug(params.program ?? "") ?? programs[0];
  const isQuranProgram =
    "donationMode" in program && program.donationMode === "quantity";
  const quantityUnitPrice =
    "quantityUnitPrice" in program
      ? (program.quantityUnitPrice ?? program.minimumDonation)
      : program.minimumDonation;
  const fallbackQuantity =
    "quantityDefault" in program ? (program.quantityDefault ?? 1) : 1;
  const quantity = isQuranProgram
    ? parsePositiveNumber(params.quantity, fallbackQuantity)
    : undefined;
  const fallbackAmount = isQuranProgram
    ? quantityUnitPrice * (quantity ?? fallbackQuantity)
    : (program.amountOptions[1] ??
      program.amountOptions[0] ??
      program.minimumDonation);
  const amount = parsePositiveNumber(params.amount, fallbackAmount);
  const donorName =
    params.donor && params.donor.trim().length > 0
      ? params.donor.trim()
      : "Hamba Allah";
  const paymentMethod =
    paymentMethodLabels[params.method ?? ""] ?? "QRIS";
  const invoiceId = createInvoiceId(program.slug, amount);
  const donationDetail = quantity
    ? `${quantity} Quran`
    : formatCurrency(amount);
  const whatsappMessage = [
    "Assalamualaikum Derma Nusantara.",
    `Saya sudah melakukan pembayaran donasi untuk program ${program.title}.`,
    `Detail donasi: ${donationDetail}.`,
    "Mohon bantu konfirmasi pembayarannya. Terima kasih.",
  ].join("\n");
  const whatsappHref = `https://wa.me/6281357035751?text=${encodeURIComponent(
    whatsappMessage,
  )}`;

  return (
    <main className="relative min-h-screen overflow-hidden bg-surface px-margin-mobile pb-16 text-on-surface md:px-margin-desktop">
      <div
        aria-hidden
        className="fixed left-0 top-0 -z-10 h-[420px] w-full rounded-b-[70%] bg-primary-fixed-dim/35 blur-xl"
      />
      <div
        aria-hidden
        className="fixed bottom-[-18rem] right-[-12rem] -z-10 size-[34rem] rounded-full bg-secondary-container/55 blur-[110px]"
      />

      <header className="sticky top-0 z-40 -mx-margin-mobile border-b border-white/50 bg-surface/70 px-margin-mobile py-4 backdrop-blur-xl md:-mx-margin-desktop md:px-margin-desktop">
        <div className="mx-auto flex max-w-container-max items-center justify-between gap-4">
          <Link
            className="inline-flex items-center gap-2 font-label-md text-label-md text-primary transition-colors hover:text-secondary"
            href={`/donasi/${program.slug}`}
          >
            <ArrowLeft size={18} />
            Kembali
          </Link>

          <Link
            className="font-display-lg-mobile text-[1.1rem] font-extrabold uppercase leading-none md:text-[1.35rem]"
            href="/"
          >
            <span className="text-[#3FA18C]">Derma</span>{" "}
            <span className="text-[#217DA2]">Nusantara</span>
          </Link>

          <div className="flex items-center gap-2 text-primary">
            <button
              aria-label="Bantuan"
              className="flex size-9 items-center justify-center rounded-full bg-white/60 transition-colors hover:bg-primary-fixed"
              type="button"
            >
              <HelpCircle size={18} />
            </button>
            <button
              aria-label="Bagikan invoice"
              className="flex size-9 items-center justify-center rounded-full bg-white/60 transition-colors hover:bg-primary-fixed"
              type="button"
            >
              <Share2 size={18} />
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-xl flex-col gap-5 py-8 md:py-12">
        <section className="flex items-end justify-between gap-4 px-1">
          <div>
            <p className="mb-1 font-label-sm text-label-sm uppercase text-on-surface-variant">
              Detail Donatur
            </p>
            <h1 className="font-headline-md-mobile text-headline-md-mobile text-primary md:font-headline-md md:text-headline-md">
              {donorName}
            </h1>
          </div>
          <span className="rounded-full bg-tertiary-container px-4 py-2 font-label-sm text-label-sm text-on-tertiary-container">
            PENDING
          </span>
        </section>

        <section className="ambient-shadow space-y-6 rounded-2xl border border-white/70 bg-white/55 p-5 backdrop-blur-2xl md:p-7">
          <div>
            <p className="mb-3 font-label-sm text-label-sm uppercase text-on-surface-variant">
              Informasi Transaksi
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="mb-1 font-label-sm text-label-sm text-on-surface-variant">
                  ID Transaksi
                </p>
                <p className="break-all font-label-md text-label-md text-primary">
                  {invoiceId}
                </p>
              </div>
              <div>
                <p className="mb-1 font-label-sm text-label-sm text-on-surface-variant">
                  Tanggal
                </p>
                <p className="font-body-md text-body-md font-semibold text-primary">
                  Kamis, 30 Juli 2026
                  <br />
                  <span className="font-label-md text-label-md font-normal text-on-surface-variant">
                    pukul 09.00 WIB
                  </span>
                </p>
              </div>
            </div>
          </div>

          <div className="h-px w-full bg-white/70" />

          <div>
            <p className="mb-3 font-label-sm text-label-sm uppercase text-on-surface-variant">
              Program Pilihan
            </p>
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <p className="font-headline-sm text-headline-sm text-primary">
                  {program.title}
                </p>
                {quantity ? (
                  <p className="mt-2 font-body-md text-body-md text-on-surface-variant">
                    {quantity} Quran x{" "}
                    {formatCurrency(quantityUnitPrice)}
                  </p>
                ) : null}
              </div>
              <div className="md:text-right">
                <p className="mb-1 font-label-sm text-label-sm uppercase text-on-surface-variant">
                  Total Donasi
                </p>
                <p className="font-headline-md-mobile text-headline-md-mobile text-secondary md:font-headline-md md:text-headline-md">
                  {formatCurrency(amount)}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="ambient-shadow rounded-2xl border border-white/70 bg-white/55 p-5 backdrop-blur-2xl md:p-7">
          <div className="mb-5 flex items-center gap-2 text-primary">
            <Info size={18} />
            <h2 className="font-label-sm text-label-sm uppercase">
              Instruksi Pembayaran
            </h2>
          </div>

          <div className="mb-5 rounded-2xl border border-white/80 bg-white/60 p-4">
            <div className="mb-2 flex items-center justify-between gap-4">
              <span className="font-label-sm text-label-sm uppercase text-on-surface-variant">
                Metode
              </span>
              <span className="font-label-md text-label-md text-primary">
                {paymentMethod}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="font-label-sm text-label-sm uppercase text-on-surface-variant">
                Program
              </span>
              <span className="text-right font-label-md text-label-md text-secondary">
                {program.title}
              </span>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl bg-primary-container p-5 text-on-primary shadow-xl shadow-primary/20 md:p-6">
            <div
              aria-hidden
              className="absolute -right-12 -top-12 size-32 rounded-full bg-white/10 blur-2xl"
            />
            <div
              aria-hidden
              className="absolute -bottom-12 -left-12 size-28 rounded-full bg-secondary/20 blur-2xl"
            />

            <div className="relative z-10 mb-5 flex flex-col justify-between gap-3 border-b border-white/20 pb-5 md:flex-row md:items-center">
              <div>
                <p className="mb-1 font-label-sm text-label-sm uppercase text-primary-fixed-dim">
                  Bank Tujuan
                </p>
                <p className="font-label-md text-label-md text-on-primary">
                  Bank Syariah Indonesia (BSI)
                </p>
              </div>
              <div className="md:text-right">
                <p className="mb-1 font-label-sm text-label-sm uppercase text-primary-fixed-dim">
                  Atas Nama
                </p>
                <p className="font-label-md text-label-md text-on-primary">
                  SEDEKAH AL QURAN
                </p>
              </div>
            </div>

            <div className="relative z-10 mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="mb-1 font-label-sm text-label-sm uppercase text-primary-fixed-dim">
                  Nomor Rekening
                </p>
                <p className="font-headline-sm text-headline-sm text-on-primary">
                  7206215725
                </p>
              </div>
              <button
                className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 font-label-md text-label-md text-secondary-container transition-colors hover:bg-white/20"
                type="button"
              >
                Salin
                <Copy size={16} />
              </button>
            </div>

            <div className="relative z-10 flex items-center justify-between gap-4">
              <div>
                <p className="mb-1 font-label-sm text-label-sm uppercase text-primary-fixed-dim">
                  Jumlah Transfer
                </p>
                <p className="font-headline-sm text-headline-sm text-secondary-fixed">
                  {formatCurrency(amount)}
                </p>
              </div>
              <button
                className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 font-label-md text-label-md text-secondary-container transition-colors hover:bg-white/20"
                type="button"
              >
                Salin
                <Copy size={16} />
              </button>
            </div>
          </div>
        </section>

        <Link
          className="ambient-shadow inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-8 py-4 font-label-md text-label-md text-on-primary transition-colors hover:bg-primary-container"
          href={whatsappHref}
        >
          <MessageCircle size={20} />
          Konfirmasi Transfer via WA
        </Link>
      </div>
    </main>
  );
}
