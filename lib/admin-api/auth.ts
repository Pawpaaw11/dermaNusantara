import { adminRequest } from "./client";
import type { AdminProfile } from "./types";

export const authApi = {
  login: (input: { email: string; password: string }) =>
    adminRequest<AdminProfile>("auth/login", {
      method: "POST",
      body: JSON.stringify(input),
    }),
  me: () => adminRequest<AdminProfile>("auth/me"),
  logout: () => adminRequest<{ success: boolean }>("auth/logout", { method: "POST" }),
  logoutAll: () =>
    adminRequest<{ success: boolean }>("auth/logout-all", { method: "POST" }),
  changePassword: (input: {
    currentPassword: string;
    newPassword: string;
  }) =>
    adminRequest<{ success: boolean }>("auth/change-password", {
      method: "PATCH",
      body: JSON.stringify(input),
    }),
};
