"use server";

import { randomUUID } from "node:crypto";

type CreateDonationInput = {
  campaignId: string;
  contribution: { amount?: number; quantity?: number };
  donor: {
    name: string;
    whatsapp: string;
    isAnonymous: boolean;
    message?: string;
  };
  paymentMethodCode: string;
};

type CreateDonationApiResponse = { data: { publicId: string } };
type ApiErrorResponse = { error?: { message?: string } };

export type CreateDonationResult =
  | { ok: true; publicId: string }
  | { ok: false; message: string };

const apiBaseUrl =
  process.env.API_BASE_URL ?? "http://localhost:3000/api/v1";

export async function createDonation(
  input: CreateDonationInput,
): Promise<CreateDonationResult> {
  try {
    const response = await fetch(`${apiBaseUrl}/donations`, {
      method: "POST",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        "Idempotency-Key": randomUUID(),
      },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as
        | ApiErrorResponse
        | null;
      return {
        ok: false,
        message:
          payload?.error?.message ??
          "Donasi belum dapat diproses. Silakan coba kembali.",
      };
    }

    const payload = (await response.json()) as CreateDonationApiResponse;
    if (!payload.data.publicId) {
      return { ok: false, message: "API tidak mengembalikan ID invoice." };
    }

    return { ok: true, publicId: payload.data.publicId };
  } catch {
    return {
      ok: false,
      message: "API donasi tidak dapat dihubungi. Silakan coba kembali.",
    };
  }
}
