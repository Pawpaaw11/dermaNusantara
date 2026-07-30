"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Banknote,
  CheckCircle2,
  Landmark,
  Minus,
  Plus,
  ShieldCheck,
  X,
} from "lucide-react";
import type { CampaignDetail } from "@/lib/api/campaigns";
import { createDonation } from "@/lib/api/donations";

type DonationPaymentFormProps = {
  program: CampaignDetail;
};

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
  const router = useRouter();
  const donationConfig = program.donationConfig;
  const isQuantityMode = donationConfig.inputType === "QUANTITY";
  const quantityUnitPrice =
    donationConfig.inputType === "QUANTITY"
      ? donationConfig.unitPrice
      : donationConfig.minimumAmount;
  const defaultQuantity =
    donationConfig.inputType === "QUANTITY"
      ? donationConfig.minimumQuantity
      : 1;
  const quantityStep =
    donationConfig.inputType === "QUANTITY"
      ? donationConfig.quantityStep
      : 1;
  const maximumQuantity =
    donationConfig.inputType === "QUANTITY"
      ? donationConfig.maximumQuantity
      : null;
  const minimumDonation =
    donationConfig.inputType === "QUANTITY"
      ? quantityUnitPrice * defaultQuantity
      : donationConfig.minimumAmount;
  const amountOptions =
    donationConfig.inputType === "MONEY"
      ? donationConfig.presetAmounts
      : [];
  const quantityLabel =
    donationConfig.inputType === "QUANTITY"
      ? donationConfig.unitLabel
      : "unit";
  const paymentMethods = program.paymentMethods.map((method) => ({
    id: method.code,
    icon: Landmark,
    label: method.name,
    description:
      method.type === "MANUAL_TRANSFER"
        ? "Transfer ke rekening resmi Derma Nusantara"
        : "Payment gateway",
  }));
  const initialAmount =
    isQuantityMode
      ? quantityUnitPrice * defaultQuantity
      : (amountOptions[1] ?? amountOptions[0] ?? minimumDonation);

  const [selectedAmount, setSelectedAmount] = useState<number | null>(
    initialAmount,
  );
  const [customAmount, setCustomAmount] = useState("");
  const [quantity, setQuantity] = useState(defaultQuantity);
  const [selectedMethod, setSelectedMethod] = useState(
    paymentMethods[0]?.id ?? "",
  );
  const [donorName, setDonorName] = useState("");
  const [donorWhatsapp, setDonorWhatsapp] = useState("");
  const [donorMessage, setDonorMessage] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

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
    ? quantity >= defaultQuantity &&
      (maximumQuantity === null || quantity <= maximumQuantity) &&
      (quantity - defaultQuantity) % quantityStep === 0
    : donationAmount >= minimumDonation;
  const selectedMethodLabel =
    paymentMethods.find((method) => method.id === selectedMethod)?.label ??
    paymentMethods[0]?.label ??
    "Tidak tersedia";
  const targetLabel =
    program.target === null
      ? "-"
      : program.target.metric === "AMOUNT"
        ? formatCurrency(program.target.value)
        : `${currencyFormatter.format(program.target.value)} ${quantityLabel}`;
  const displayDonorName =
    anonymous || donorName.trim().length === 0
      ? "Hamba Allah"
      : donorName.trim();
  const isDonorValid = anonymous || donorName.trim().length > 0;
  const isWhatsappValid = /^[+\d][\d\s-]{7,19}$/.test(donorWhatsapp.trim());
  const canSubmit =
    isAmountValid &&
    isDonorValid &&
    isWhatsappValid &&
    selectedMethod.length > 0 &&
    !isSubmitting;

  async function handleCreateDonation() {
    if (!canSubmit) {
      setSubmitError("Lengkapi nama dan nomor WhatsApp yang valid.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    const result = await createDonation({
      campaignId: program.id,
      contribution: isQuantityMode
        ? { quantity }
        : { amount: donationAmount },
      donor: {
        name: anonymous ? "Hamba Allah" : donorName.trim(),
        whatsapp: donorWhatsapp.trim(),
        isAnonymous: anonymous,
        message: donorMessage.trim() || undefined,
      },
      paymentMethodCode: selectedMethod,
    });

    if (!result.ok) {
      setSubmitError(result.message);
      setIsSubmitting(false);
      return;
    }

    router.push(`/invoice/${encodeURIComponent(result.publicId)}`);
  }

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
                {formatCurrency(program.progress.collectedAmount)}
              </p>
            </div>
            <div className="rounded-full bg-white/10 px-4 py-2 text-right">
              <p className="font-label-sm text-label-sm text-primary-fixed-dim">
                Target
              </p>
              <p className="mt-1 font-label-md text-label-md">{targetLabel}</p>
            </div>
          </div>

          <div className="mt-6 h-3 overflow-hidden rounded-full bg-white/15">
            <div
              className="h-full rounded-full bg-tertiary"
              style={{
                width: `${Math.min(program.progress.percentage, 100)}%`,
              }}
            />
          </div>

          <div className="mt-3 flex items-center justify-between font-label-sm text-label-sm text-primary-fixed-dim">
            <span>
              {currencyFormatter.format(program.progress.paidDonationCount)}{" "}
              donatur
            </span>
            <span>
              {program.daysRemaining === null
                ? "Tanpa batas waktu"
                : `${program.daysRemaining} hari lagi`}
            </span>
          </div>
        </div>

        <form
          className="flex flex-col gap-7 px-8 py-8"
          onSubmit={(event) => {
            event.preventDefault();
            setSubmitError(null);
            if (!isDonorValid || !isWhatsappValid) {
              setSubmitError("Lengkapi nama dan nomor WhatsApp yang valid.");
              return;
            }
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
                        aria-label={`Kurangi ${quantityLabel.toLowerCase()}`}
                      className="flex size-9 items-center justify-center rounded-full border border-outline-variant bg-surface-container text-primary transition-colors hover:border-primary hover:bg-primary-fixed/30 disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={quantity <= defaultQuantity}
                      onClick={() =>
                        setQuantity((currentQuantity) =>
                          Math.max(
                            defaultQuantity,
                            currentQuantity - quantityStep,
                          ),
                        )
                      }
                      type="button"
                    >
                      <Minus size={16} />
                    </button>

                    <div className="min-w-[88px] text-center">
                      <p className="font-label-md text-label-md text-primary">
                        {quantity} {quantityLabel}
                      </p>
                    </div>

                    <button
                      aria-label={`Tambah ${quantityLabel.toLowerCase()}`}
                      className="flex size-9 items-center justify-center rounded-full border border-outline-variant bg-surface-container text-primary transition-colors hover:border-primary hover:bg-primary-fixed/30"
                      disabled={
                        maximumQuantity !== null &&
                        quantity + quantityStep > maximumQuantity
                      }
                      onClick={() =>
                        setQuantity(
                          (currentQuantity) =>
                            currentQuantity + quantityStep,
                        )
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
                  {amountOptions.map((amount) => {
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
                  Minimal donasi {formatCurrency(minimumDonation)}
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
              onChange={(event) => setDonorName(event.target.value)}
              placeholder="Nama lengkap"
              required={!anonymous}
              type="text"
              value={donorName}
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
              onChange={(event) => setDonorWhatsapp(event.target.value)}
              placeholder="Nomor WhatsApp"
              required
              type="tel"
              value={donorWhatsapp}
            />

            <textarea
              className="min-h-[112px] w-full rounded-2xl border border-outline-variant bg-surface px-4 py-3 font-body-md text-body-md text-on-background outline-none transition-colors placeholder:text-outline focus:border-secondary"
              onChange={(event) => setDonorMessage(event.target.value)}
              placeholder="Doa atau pesan dukungan"
              value={donorMessage}
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

          <button
            className="hover-lift flex w-full items-center justify-center gap-2 rounded-full bg-primary px-8 py-4 font-label-md text-label-md text-on-primary transition-colors hover:bg-primary-container disabled:cursor-not-allowed disabled:bg-outline disabled:hover:transform-none"
            disabled={!isAmountValid || isSubmitting}
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
          {submitError ? (
            <p className="text-center font-label-sm text-label-sm text-error" role="alert">
              {submitError}
            </p>
          ) : null}
        </form>
      </div>

      {showSummary ? (
        <div
          aria-labelledby="donation-summary-title"
          aria-modal="true"
          className="fixed inset-0 z-[80] flex items-center justify-center bg-inverse-surface/45 px-margin-mobile backdrop-blur-sm"
          role="dialog"
        >
          <div className="ambient-shadow w-full max-w-md overflow-hidden rounded-[28px] border border-outline-variant/40 bg-surface">
            <div className="flex items-center justify-between gap-4 border-b border-outline-variant/40 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-full bg-secondary/20 text-secondary">
                  <ShieldCheck size={20} />
                </div>
                <p
                  className="font-label-md text-label-md text-primary"
                  id="donation-summary-title"
                >
                  Ringkasan amanah
                </p>
              </div>
              <button
                aria-label="Tutup ringkasan amanah"
                className="flex size-9 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container hover:text-primary"
                onClick={() => setShowSummary(false)}
                type="button"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 px-6 py-6 font-body-md text-body-md text-on-surface-variant">
              <p>Program: {program.title}</p>
              <p>
                {isQuantityMode ? "Total: " : "Nominal: "}
                <span className="font-semibold text-primary">
                  {formatCurrency(Math.max(donationAmount, 0))}
                </span>
              </p>
              {isQuantityMode ? (
                <p>
                  {quantityLabel}: {quantity} {quantityLabel}
                </p>
              ) : null}
              <p>Metode: {selectedMethodLabel}</p>
              <p>Nama tampil: {displayDonorName}</p>
            </div>

            <div className="grid gap-3 bg-surface-container px-6 py-5 sm:grid-cols-2">
              <button
                className="rounded-full border border-outline-variant bg-surface px-6 py-3 font-label-md text-label-md text-primary transition-colors hover:bg-primary-fixed/30"
                onClick={() => setShowSummary(false)}
                type="button"
              >
                Periksa Lagi
              </button>
              <button
                className="rounded-full bg-primary px-6 py-3 text-center font-label-md text-label-md text-on-primary transition-colors hover:bg-primary-container focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-fixed-dim disabled:cursor-wait disabled:bg-outline"
                disabled={isSubmitting}
                onClick={handleCreateDonation}
                type="button"
              >
                {isSubmitting ? "Membuat invoice..." : "Lanjutkan"}
              </button>
            </div>
            {submitError ? (
              <p className="bg-surface-container px-6 pb-5 text-center font-label-sm text-label-sm text-error" role="alert">
                {submitError}
              </p>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
