export type AdminRole = "SUPER_ADMIN" | "CAMPAIGN_MANAGER" | "VERIFIER";

export type AdminProfile = {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  permissions: string[];
};

export type ApiMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type ApiResponse<T> = { data: T; meta?: ApiMeta };

export type ApiErrorPayload = {
  error?: {
    code?: string;
    message?: string;
    details?: unknown;
    requestId?: string;
  };
};

export type DashboardSummary = {
  byStatus: Array<{ status: string; count: number; amount: number }>;
  pendingReview: number;
  activeCampaigns: number;
  paidToday: { count: number; amount: number };
  paidThisMonth: { count: number; amount: number };
  trend: Array<{ date: string; count: number; amount: number }>;
};

export type Campaign = {
  id: string;
  categoryId: string;
  slug: string;
  title: string;
  shortDescription: string;
  description: string;
  coverImageUrl: string;
  coverImageAlt: string;
  location: string | null;
  story: string[];
  highlights: string[];
  status: "DRAFT" | "PUBLISHED" | "CLOSED" | "ARCHIVED";
  isFeatured: boolean;
  featured: boolean;
  acceptingDonations: boolean;
  targetMetric: "AMOUNT" | "QUANTITY" | null;
  targetAmount: number | null;
  targetQuantity: number | null;
  startsAt: string | null;
  endsAt: string | null;
  updatedAt: string;
  category: { id: string; code: string; name: string };
  donationConfig?: CampaignDonationConfig | null;
  donationOptions?: CampaignDonationOption[];
  paymentMethods?: CampaignPaymentLink[];
  updates?: CampaignUpdate[];
  statBaseline?: CampaignStatBaseline | null;
  _count?: { donations?: number; updates?: number };
};

export type CampaignDonationConfig = {
  id?: string;
  campaignId?: string;
  inputType: "MONEY" | "QUANTITY";
  currency: string;
  minimumAmount: number | null;
  maximumAmount: number | null;
  allowCustomAmount: boolean | null;
  unitName: string | null;
  unitLabel: string | null;
  unitPrice: number | null;
  minimumQuantity: number | null;
  maximumQuantity: number | null;
  quantityStep: number | null;
};

export type CampaignDonationOption = {
  id: string;
  campaignId: string;
  amount: number;
  label: string | null;
  sortOrder: number;
  isActive: boolean;
};

export type PaymentMethodMaster = {
  id: string;
  code: string;
  name: string;
  type: string;
  isActive: boolean;
  minimumAmount: number | null;
  maximumAmount: number | null;
  uniqueCodeEnabled: boolean;
  expiryMinutes: number;
};

export type CampaignPaymentLink = {
  campaignId: string;
  paymentMethodId: string;
  isActive?: boolean;
  paymentMethod: PaymentMethodMaster;
};

export type CampaignUpdate = {
  id: string;
  campaignId: string;
  publishedAt: string;
  title: string;
  excerpt: string;
  content: string[];
  sortOrder: number;
};

export type CampaignStatBaseline = {
  id?: string;
  campaignId?: string;
  collectedAmount: number;
  collectedQuantity: number;
  paidDonationCount: number;
};

export type Donation = {
  id: string;
  publicId: string;
  invoiceNumber: string;
  campaignTitleSnapshot: string;
  donorName: string;
  donorDisplayName?: string;
  donorWhatsapp: string;
  isAnonymous: boolean;
  status: string;
  inputTypeSnapshot: string;
  quantity: number | null;
  baseAmount: number;
  expiresAt: string;
  paidAt: string | null;
  createdAt: string;
  payments: Payment[];
  statusHistories?: Array<Record<string, unknown>>;
  statusHistory?: Array<Record<string, unknown>>;
  auditLogs?: Array<Record<string, unknown>>;
  availableActions?: string[];
  campaign?: { id?: string; title?: string; slug?: string };
  campaignTitle?: string;
  [key: string]: unknown;
};

export type Payment = {
  id: string;
  status: string;
  baseAmount: number;
  payableAmount: number;
  uniqueCode: number;
  expiresAt: string;
  verifiedAt: string | null;
  bankNameSnapshot: string | null;
  accountNumberSnapshot: string | null;
  paymentMethod?: { name: string; code: string };
  paymentMethodName?: string;
  publicId?: string;
  donation?: Donation;
  verifiedByAdmin?: { id: string; name: string } | null;
  [key: string]: unknown;
};

export type CampaignCategory = {
  id: string;
  code: string;
  name: string;
};

export type MediaAsset = {
  id: string;
  fileName: string;
  storedName?: string;
  originalName?: string;
  url: string;
  mimeType: string;
  size: number;
};

export class AdminError extends Error {
  code?: string;
  details?: unknown;
  requestId?: string;
}

export type ListParams = Record<
  string,
  string | number | boolean | null | undefined
>;
