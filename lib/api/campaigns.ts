import { cache } from "react";

type MoneyDonationConfig = {
  inputType: "MONEY";
  currency: string;
  minimumAmount: number;
  maximumAmount: number | null;
  allowCustomAmount: boolean;
  presetAmounts: number[];
};

type QuantityDonationConfig = {
  inputType: "QUANTITY";
  currency: string;
  unitName: string;
  unitLabel: string;
  unitPrice: number;
  minimumQuantity: number;
  maximumQuantity: number | null;
  quantityStep: number;
};

export type CampaignDetail = {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  description: string;
  coverImageUrl: string;
  coverImageAlt: string;
  location: string | null;
  category: {
    code: string;
    name: string;
  };
  inputType: "MONEY" | "QUANTITY";
  target: {
    metric: "AMOUNT" | "QUANTITY";
    value: number;
  } | null;
  progress: {
    collectedAmount: number;
    collectedQuantity: number | null;
    percentage: number;
    paidDonationCount: number;
  };
  endsAt: string | null;
  daysRemaining: number | null;
  isFeatured: boolean;
  acceptingDonations: boolean;
  story: string[];
  highlights: string[];
  updates: Array<{
    publishedAt: string;
    title: string;
    excerpt: string;
    content: string[];
  }>;
  recentDonors: Array<{
    donorDisplayName: string;
    amount: number;
    message: string | null;
    donatedAt: string;
  }>;
  donationConfig: MoneyDonationConfig | QuantityDonationConfig;
  paymentMethods: Array<{
    code: string;
    name: string;
    type: "MANUAL_TRANSFER" | "PAYMENT_GATEWAY";
    minimumAmount: number | null;
    maximumAmount: number | null;
  }>;
};

export type CampaignListItem = {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  coverImageUrl: string;
  coverImageAlt: string;
  category: {
    code: string;
    name: string;
  };
  inputType: "MONEY" | "QUANTITY";
  target: {
    metric: "AMOUNT" | "QUANTITY";
    value: number;
  } | null;
  progress: {
    collectedAmount: number;
    collectedQuantity: number | null;
    percentage: number;
    paidDonationCount: number;
  };
  endsAt: string | null;
  daysRemaining: number | null;
  isFeatured: boolean;
};

export type CampaignListMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

type CampaignListResponse = {
  data: CampaignListItem[];
  meta: CampaignListMeta;
};

type CampaignDetailResponse = {
  data: CampaignDetail;
};

const apiBaseUrl =
  process.env.API_BASE_URL ?? "http://localhost:3000/api/v1";

export async function getCampaigns(): Promise<CampaignListResponse> {
  const response = await fetch(`${apiBaseUrl}/campaigns?page=1&limit=3`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Campaign API returned ${response.status} for list.`);
  }

  const payload = (await response.json()) as CampaignListResponse;
  return {
    data: payload.data.slice(0, 3),
    meta: payload.meta,
  };
}

export const getCampaignBySlug = cache(
  async (slug: string): Promise<CampaignDetail | null> => {
    const response = await fetch(
      `${apiBaseUrl}/campaigns/${encodeURIComponent(slug)}`,
      { cache: "no-store" },
    );

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error(
        `Campaign API returned ${response.status} for slug "${slug}".`,
      );
    }

    const payload = (await response.json()) as CampaignDetailResponse;
    return payload.data;
  },
);
