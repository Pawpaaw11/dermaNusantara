"use client";

import { useMemo, useState } from "react";
import {
  Banknote,
  CheckCircle2,
  Landmark,
  MessageSquareHeart,
  Minus,
  Plus,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import type { Program } from "@/data/landing-page";

type DonationPaymentFormProps = {
  program: Program;
};

const paymentMethods = [
  {
    id: "qris",
    icon: Wallet,
    label: "QRIS",
    description: "Semua e-wallet dan mobile banking",
  },
  {
    id: "bank-transfer",
    icon: Landmark,
    label: "Transfer Bank",
    description: "BCA, Mandiri, BNI, dan bank lainnya",
  },
];

const currencyFormatter = new Intl.NumberFormat("id-ID");

function formatCurrency(value: number) {
  return `Rp ${currencyFormatter.format(value)}`;
}

function parseCurrencyInput(value: string) {
  const numericValue = Number(value.replace(/\D/g, ""));
  return Number.isFinite(numericValue) ? numericValue : 0;
}

export function DonationPaymentForm({
  program,
}: DonationPaymentFormProps) {
  const isQuantityMode = program.donationMode === "quantity";
  const quantityUnitPrice = program.quantityUnitPrice ?? program.minimumDonation;
  const defaultQuantity = program.quantityDefault ?? 1;
  const initialAmount =
    isQuantityMode
      ? quantityUnitPrice * defaultQuantity
      : (program.amountOptions[1] ??
          program.amountOptions[0] ??
          program.minimumDonation);

  const [selectedAmount, setSelectedAmount] = useState<number | null>(
    initialAmount,
  );
  const [customAmount, setCustomAmount] = useState("");
  const [quantity, setQuantity] = useState(defaultQuantity);
  const [selectedMethod, setSelectedMethod] = useState(paymentMethods[0].id);
  const [anonymous, setAnonymous] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  const donationAmount = useMemo(() => {
    if (isQuantityMode) {
      return quantity * quantityUnitPrice;
    }

    if (selectedAmount) {
      return selectedAmount;
    }

    return parseCurrencyInput(customAmount);
  }, [customAmount, isQuantityMode, quantity, quantityUnitPrice, selectedAmount]);

  const isAmountValid = isQuantityMode
    ? quantity >= 1
    : donationAmount >= program.minimumDonation;
  const selectedMethodLabel =
    paymentMethods.find((method) => method.id === selectedMethod)?.label ??
    paymentMethods[0].label;

  return (
    <div className="lg:sticky lg:top-28">
      <div className="ambient-shadow overflow-hidden rounded-[32px] border border-outline-variant/40 bg-surface-container-lowest">
        <div className="bg-primary px-8 py-7 text-on-primary">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-label-sm text-label-sm text-primary-fixed-dim">
                Donasi terkumpul
              </p>
              <p className="mt-2 font-headline-md text-headline-md">
                {program.collected}
              </p>
            </div>
            <div className="rounded-full bg-white/10 px-4 py-2 text-right">
              <p className="font-label-sm text-label-sm text-primary-fixed-dim">
                Target
              </p>
              <p className="mt-1 font-label-md text-label-md">{program.target}</p>
            </div>
          </div>

          <div className="mt-6 h-3 overflow-hidden rounded-full bg-white/15">
            <div
              className="h-full rounded-full bg-tertiary"
              style={{ width: `${program.progress}%` }}
            />
          </div>

          <div className="mt-3 flex items-center justify-between font-label-sm text-label-sm text-primary-fixed-dim">
            <span>{program.donorsLabel}</span>
            <span>{program.daysLeftLabel}</span>
          </div>
        </div>

        <form
          className="flex flex-col gap-7 px-8 py-8"
          onSubmit={(event) => {
            event.preventDefault();
            setShowSummary(true);
          }}
        >
          <div>
            <label className="mb-3 block font-label-md text-label-md text-primary">
              {isQuantityMode ? "Pilih jumlah Quran" : "Pilih nominal"}
            </label>

            {isQuantityMode ? (
              <div className="rounded-2xl border border-outline-variant bg-surface px-4 py-3">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-label-sm text-label-sm text-on-surface-variant">
                      Harga total
                    </p>
                    <p className="mt-1 truncate font-label-md text-label-md text-primary">
                      {formatCurrency(donationAmount)}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-3">
                    <button
                      aria-label={`Kurangi ${program.quantityLabel?.toLowerCase()}`}
                      className="flex size-9 items-center justify-center rounded-full border border-outline-variant bg-surface-container text-primary transition-colors hover:border-primary hover:bg-primary-fixed/30 disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={quantity <= 1}
                      onClick={() =>
                        setQuantity((currentQuantity) =>
                          Math.max(1, currentQuantity - 1),
                        )
                      }
                      type="button"
                    >
                      <Minus size={16} />
                    </button>

                    <div className="min-w-[88px] text-center">
                      <p className="font-label-md text-label-md text-primary">
                        {quantity} Quran
                      </p>
                    </div>

                    <button
                      aria-label={`Tambah ${program.quantityLabel?.toLowerCase()}`}
                      className="flex size-9 items-center justify-center rounded-full border border-outline-variant bg-surface-container text-primary transition-colors hover:border-primary hover:bg-primary-fixed/30"
                      onClick={() =>
                        setQuantity((currentQuantity) => currentQuantity + 1)
                      }
                      type="button"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3">
                  {program.amountOptions.map((amount) => {
                    const isActive = selectedAmount === amount;

                    return (
                      <button
                        className={`rounded-2xl border px-4 py-3 text-left font-label-md text-label-md transition-all ${
                          isActive
                            ? "border-primary bg-primary-fixed text-primary"
                            : "border-outline-variant bg-surface text-on-background hover:border-primary hover:bg-primary-fixed/40"
                        }`}
                        key={amount}
                        onClick={() => {
                          setSelectedAmount(amount);
                          setCustomAmount("");
                        }}
                        type="button"
                      >
                        {formatCurrency(amount)}
                      </button>
                    );
                  })}
                </div>

                <label className="mt-3 block">
                  <span className="sr-only">Nominal lain</span>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-label-md text-label-md text-on-surface-variant">
                      Rp
                    </span>
                    <input
                      className="w-full rounded-2xl border border-outline-variant bg-surface px-11 py-3 font-body-md text-body-md text-on-background outline-none transition-colors placeholder:text-outline focus:border-secondary"
                      inputMode="numeric"
                      onChange={(event) => {
                        const numericValue = event.target.value.replace(/\D/g, "");
                        setSelectedAmount(null);
                        setCustomAmount(numericValue);
                      }}
                      placeholder="Nominal lain"
                      value={
                        customAmount
                          ? currencyFormatter.format(Number(customAmount))
                          : ""
                      }
                    />
                  </div>
                </label>

                <p className="mt-2 font-label-sm text-label-sm text-on-surface-variant">
                  Minimal donasi {formatCurrency(program.minimumDonation)}
                </p>
              </>
            )}
          </div>

          <div className="space-y-4">
            <label className="block font-label-md text-label-md text-primary">
              Informasi donatur
            </label>

            <input
              className="w-full rounded-2xl border border-outline-variant bg-surface px-4 py-3 font-body-md text-body-md text-on-background outline-none transition-colors placeholder:text-outline focus:border-secondary"
              placeholder="Nama lengkap"
              type="text"
            />

            <label className="flex items-center gap-3 rounded-2xl border border-outline-variant/60 bg-surface-container px-4 py-3">
              <input
                checked={anonymous}
                className="size-4 rounded border-outline-variant text-primary focus:ring-secondary"
                onChange={(event) => setAnonymous(event.target.checked)}
                type="checkbox"
              />
              <span className="font-label-md text-label-md text-on-surface-variant">
                Sembunyikan nama saya
              </span>
            </label>

            <input
              className="w-full rounded-2xl border border-outline-variant bg-surface px-4 py-3 font-body-md text-body-md text-on-background outline-none transition-colors placeholder:text-outline focus:border-secondary"
              placeholder="Nomor WhatsApp"
              type="tel"
            />

            <textarea
              className="min-h-[112px] w-full rounded-2xl border border-outline-variant bg-surface px-4 py-3 font-body-md text-body-md text-on-background outline-none transition-colors placeholder:text-outline focus:border-secondary"
              placeholder="Doa atau pesan dukungan"
            />
          </div>

          <div>
            <label className="mb-3 block font-label-md text-label-md text-primary">
              Metode pembayaran
            </label>
            <div className="space-y-3">
              {paymentMethods.map((method) => {
                const Icon = method.icon;
                const isActive = selectedMethod === method.id;

                return (
                  <button
                    className={`flex w-full items-center justify-between rounded-2xl border px-4 py-4 text-left transition-all ${
                      isActive
                        ? "border-primary bg-primary-fixed/70"
                        : "border-outline-variant bg-surface hover:border-primary/50"
                    }`}
                    key={method.id}
                    onClick={() => setSelectedMethod(method.id)}
                    type="button"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex size-11 items-center justify-center rounded-full bg-secondary/20 text-secondary">
                        <Icon size={20} />
                      </div>
                      <div>
                        <p className="font-label-md text-label-md text-on-background">
                          {method.label}
                        </p>
                        <p className="mt-1 font-label-sm text-label-sm text-on-surface-variant">
                          {method.description}
                        </p>
                      </div>
                    </div>
                    {isActive ? (
                      <CheckCircle2 className="text-primary" size={20} />
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-[28px] bg-surface-container p-5">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex size-11 items-center justify-center rounded-full bg-secondary/20 text-secondary">
                <ShieldCheck size={20} />
              </div>
              <div className="space-y-2">
                <p className="font-label-md text-label-md text-primary">
                  Ringkasan amanah
                </p>
                <div className="space-y-1 font-body-md text-body-md text-on-surface-variant">
                  <p>Program: {program.title}</p>
                  <p>
                    {isQuantityMode ? "Total: " : "Nominal: "}
                    <span className="font-semibold text-primary">
                      {formatCurrency(Math.max(donationAmount, 0))}
                    </span>
                  </p>
                  {isQuantityMode ? (
                    <p>
                      {program.quantityLabel}: {quantity} Quran
                    </p>
                  ) : null}
                  <p>Metode: {selectedMethodLabel}</p>
                  <p>Nama tampil: {anonymous ? "Hamba Allah" : "Nama asli"}</p>
                </div>
              </div>
            </div>
          </div>

          <button
            className="hover-lift flex w-full items-center justify-center gap-2 rounded-full bg-primary px-8 py-4 font-label-md text-label-md text-on-primary transition-colors hover:bg-primary-container disabled:cursor-not-allowed disabled:bg-outline disabled:hover:transform-none"
            disabled={!isAmountValid}
            type="submit"
          >
            <Banknote size={18} />
            Lanjutkan Donasi
          </button>

          {!isAmountValid ? (
            <p className="text-center font-label-sm text-label-sm text-error">
              Nominal belum memenuhi batas minimal donasi.
            </p>
          ) : null}

          {showSummary ? (
            <div className="rounded-[28px] border border-secondary/30 bg-secondary/10 p-5">
              <div className="flex items-start gap-3">
                <div className="flex size-11 items-center justify-center rounded-full bg-secondary text-on-secondary">
                  <MessageSquareHeart size={18} />
                </div>
                <div>
                  <p className="font-label-md text-label-md text-primary">
                    Ringkasan pembayaran siap ditinjau
                  </p>
                  <p className="mt-2 font-body-md text-body-md text-on-surface-variant">
                    {isQuantityMode
                      ? `${quantity} Quran senilai ${formatCurrency(donationAmount)} untuk ${program.title} melalui ${selectedMethodLabel}.`
                      : `${formatCurrency(donationAmount)} untuk ${program.title} melalui ${selectedMethodLabel}.`}
                  </p>
                </div>
              </div>
            </div>
          ) : null}
        </form>
      </div>
    </div>
  );
}
