import { adminDownload, adminRequest, queryString } from "./client";
import type {
  Campaign,
  CampaignCategory,
  CampaignDonationConfig,
  CampaignDonationOption,
  CampaignStatBaseline,
  CampaignUpdate,
  Donation,
  ListParams,
  MediaAsset,
  Payment,
  PaymentMethodMaster,
} from "./types";

export function resourceApi<T>(resource: string) {
  return {
    list: (params: ListParams = {}) =>
      adminRequest<T[]>(`${resource}${queryString(params)}`),
    get: (id: string) => adminRequest<T>(`${resource}/${id}`),
    create: (input: unknown) =>
      adminRequest<T>(resource, {
        method: "POST",
        body: JSON.stringify(input),
      }),
    update: (id: string, input: unknown) =>
      adminRequest<T>(`${resource}/${id}`, {
        method: "PATCH",
        body: JSON.stringify(input),
      }),
    remove: (id: string) =>
      adminRequest<{ success: boolean }>(`${resource}/${id}`, {
        method: "DELETE",
      }),
    action: (id: string, action: string, input?: unknown) =>
      adminRequest<T>(`${resource}/${id}/${action}`, {
        method: "POST",
        body: JSON.stringify(input ?? {}),
      }),
  };
}

export const campaignsApi = {
  ...resourceApi<Campaign>("campaigns"),
  put: (id: string, path: string, input: unknown) =>
    adminRequest<Campaign>(`campaigns/${id}/${path}`, {
      method: "PUT",
      body: JSON.stringify(input),
    }),
  subList: <T>(id: string, path: string) =>
    adminRequest<T[]>(`campaigns/${id}/${path}`),
  categories: () => adminRequest<CampaignCategory[]>("campaign-categories?page=1&limit=100"),
  saveDonationConfig: (id: string, input: Omit<CampaignDonationConfig, "id" | "campaignId">) =>
    adminRequest<Campaign>(`campaigns/${id}/donation-config`, {
      method: "PUT",
      body: JSON.stringify(input),
    }),
  donationOptions: (id: string) =>
    adminRequest<CampaignDonationOption[]>(`campaigns/${id}/donation-options`),
  createDonationOption: (id: string, input: Omit<CampaignDonationOption, "id" | "campaignId">) =>
    adminRequest<CampaignDonationOption>(`campaigns/${id}/donation-options`, {
      method: "POST",
      body: JSON.stringify(input),
    }),
  updateDonationOption: (id: string, optionId: string, input: Omit<CampaignDonationOption, "id" | "campaignId">) =>
    adminRequest<CampaignDonationOption>(`campaigns/${id}/donation-options/${optionId}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    }),
  deleteDonationOption: (id: string, optionId: string) =>
    adminRequest<{ success: boolean }>(`campaigns/${id}/donation-options/${optionId}`, { method: "DELETE" }),
  paymentMethodMasters: () =>
    adminRequest<PaymentMethodMaster[]>("payment-methods?page=1&limit=100"),
  savePaymentMethods: (id: string, paymentMethodIds: string[]) =>
    adminRequest<Campaign>(`campaigns/${id}/payment-methods`, {
      method: "PUT",
      body: JSON.stringify({ paymentMethodIds }),
    }),
  updates: (id: string) => adminRequest<CampaignUpdate[]>(`campaigns/${id}/updates`),
  createUpdate: (id: string, input: Omit<CampaignUpdate, "id" | "campaignId">) =>
    adminRequest<CampaignUpdate>(`campaigns/${id}/updates`, {
      method: "POST",
      body: JSON.stringify(input),
    }),
  updateUpdate: (id: string, updateId: string, input: Omit<CampaignUpdate, "id" | "campaignId">) =>
    adminRequest<CampaignUpdate>(`campaigns/${id}/updates/${updateId}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    }),
  deleteUpdate: (id: string, updateId: string) =>
    adminRequest<{ success: boolean }>(`campaigns/${id}/updates/${updateId}`, { method: "DELETE" }),
  reorderUpdates: (id: string, ids: string[]) =>
    adminRequest<CampaignUpdate[]>(`campaigns/${id}/updates/reorder`, {
      method: "PUT",
      body: JSON.stringify({ ids }),
    }),
  baseline: (id: string) => adminRequest<CampaignStatBaseline | null>(`campaigns/${id}/stat-baseline`),
  saveBaseline: (id: string, input: CampaignStatBaseline & { reason: string }) =>
    adminRequest<CampaignStatBaseline>(`campaigns/${id}/stat-baseline`, {
      method: "PUT",
      body: JSON.stringify(input),
    }),
};
export const donationsApi = {
  ...resourceApi<Donation>("donations"),
  transition: (id: string, action: string, input: unknown) =>
    adminRequest<Donation>(`donations/${id}/${action}`, {
      method: "POST",
      body: JSON.stringify(input),
    }),
};
export const paymentsApi = resourceApi<Payment>("payments");
export const categoriesApi =
  resourceApi<Record<string, unknown>>("campaign-categories");
export const paymentMethodsApi =
  resourceApi<Record<string, unknown>>("payment-methods");
export const bankAccountsApi =
  resourceApi<Record<string, unknown>>("bank-accounts");
export const usersApi = resourceApi<Record<string, unknown>>("users");
export const auditApi = resourceApi<Record<string, unknown>>("audit-logs");
export const mediaApi = {
  ...resourceApi<MediaAsset>("media"),
  upload: (body: FormData) => {
    return adminRequest<MediaAsset>("media", {
      method: "POST",
      body,
    });
  },
};
export const settingsApi = {
  get: () => adminRequest<Record<string, unknown>>("settings"),
  update: (values: Record<string, unknown>) =>
    adminRequest<Record<string, unknown>>("settings", {
      method: "PATCH",
      body: JSON.stringify({ values }),
    }),
};
export const reportsApi = {
  campaigns: () => adminRequest<Record<string, unknown>[]>("reports/campaigns"),
  donations: (params: ListParams = {}) =>
    adminRequest<Donation[]>(`reports/donations${queryString(params)}`),
  attribution: () =>
    adminRequest<Record<string, unknown>[]>("reports/attribution"),
  paymentMethods: () =>
    adminRequest<Record<string, unknown>[]>("reports/payment-methods"),
  export: (kind: string, format: "csv" | "xlsx", params: ListParams = {}) =>
    adminDownload(
      `reports/${kind}/export${queryString({ ...params, format })}`,
    ),
};
