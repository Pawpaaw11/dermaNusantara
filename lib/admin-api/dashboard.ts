import { adminRequest } from "./client";
import type { DashboardSummary } from "./types";

export const dashboardApi = {
  summary: () => adminRequest<DashboardSummary>("dashboard/summary"),
};
