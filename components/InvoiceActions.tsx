"use client";

import { useState } from "react";
import { Check, Copy, Share2 } from "lucide-react";

export function CopyButton({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);

  async function copyValue() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <button
      aria-label={`${label}: ${value}`}
      className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 font-label-md text-label-md text-secondary-container transition-colors hover:bg-white/20"
      onClick={copyValue}
      type="button"
    >
      {copied ? "Tersalin" : "Salin"}
      {copied ? <Check size={16} /> : <Copy size={16} />}
    </button>
  );
}

export function ShareInvoiceButton() {
  async function shareInvoice() {
    const data = {
      title: "Invoice Donasi Derma Nusantara",
      url: window.location.href,
    };
    if (navigator.share) await navigator.share(data);
    else await navigator.clipboard.writeText(window.location.href);
  }

  return (
    <button
      aria-label="Bagikan invoice"
      className="flex size-9 items-center justify-center rounded-full bg-white/60 transition-colors hover:bg-primary-fixed"
      onClick={shareInvoice}
      type="button"
    >
      <Share2 size={18} />
    </button>
  );
}
