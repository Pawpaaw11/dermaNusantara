import { cache } from "react";

type MoneyContribution = { inputType: "MONEY"; amount: number };
type QuantityContribution = {
  inputType: "QUANTITY";
  quantity: number;
  unitName: string;
  unitLabel: string;
  unitPrice: number;
};

export type Invoice = {
  invoiceNumber: string;
  status:
    | "PENDING_PAYMENT"
    | "PAID"
    | "FAILED"
    | "EXPIRED"
    | "CANCELLED";
  campaign: { slug: string; title: string };
  donorDisplayName: string;
  contribution: MoneyContribution | QuantityContribution;
  baseAmount: number;
  uniqueCode: number;
  payableAmount: number;
  currency: string;
  createdAt: string;
  expiresAt: string;
  payment: {
    methodCode: string;
    methodName: string;
    bankName: string | null;
    accountNumber: string | null;
    accountHolderName: string | null;
    instructions: string[];
  };
  confirmation: { whatsappUrl: string; message: string };
};

type InvoiceResponse = { data: Invoice };

const apiBaseUrl =
  process.env.API_BASE_URL ?? "http://localhost:3000/api/v1";

export const getInvoice = cache(
  async (publicId: string): Promise<Invoice | null> => {
    const response = await fetch(
      `${apiBaseUrl}/invoices/${encodeURIComponent(publicId)}`,
      { cache: "no-store" },
    );

    if (response.status === 404) return null;
    if (!response.ok) {
      throw new Error(`Invoice API returned ${response.status}.`);
    }

    const payload = (await response.json()) as InvoiceResponse;
    return payload.data;
  },
);
