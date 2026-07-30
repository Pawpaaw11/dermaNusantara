import { adminDownload, adminRequest, queryString } from "./client";
import type {
  Campaign,
  CampaignCategory,
  ApiResponse,
  Donation,
  ListParams,
  MediaAsset,
  Payment,
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
  subresource: async (id: string, path: string): Promise<ApiResponse<unknown>> => {
    const mapped: Record<string, string> = {
      donation: "donation-config",
      presets: "donation-options",
      payments: "payment-methods",
      updates: "updates",
      baseline: "stat-baseline",
    };
    if (path === "donation" || path === "payments") {
      const response = await adminRequest<Campaign>(`campaigns/${id}`);
      return {
        data: path === "donation"
          ? response.data.donationConfig
          : response.data.paymentMethods,
      };
    }
    return adminRequest<unknown>(`campaigns/${id}/${mapped[path] ?? path}`);
  },
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
