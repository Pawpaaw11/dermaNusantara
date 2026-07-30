"use client";

import { ResourcePage } from "./ResourcePage";
import {
  bankAccountsApi,
  categoriesApi,
  paymentMethodsApi,
  usersApi,
} from "@/lib/admin-api/resources";
import { StatusBadge } from "./AdminUI";

type Row = Record<string, unknown>;

export function CategoriesPage() {
  return <ResourcePage<Row> api={categoriesApi} description="Kelola pengelompokan program donasi." display={[{ key: "code", label: "Kode" }, { key: "name", label: "Nama" }, { key: "_count", label: "Digunakan" }]} fields={[{ key: "code", label: "Kode", required: true }, { key: "name", label: "Nama kategori", required: true }]} queryKey="categories" title="Kategori Program" />;
}
export function PaymentMethodsPage() {
  return <ResourcePage<Row> api={paymentMethodsApi} description="Atur metode, batas nominal, kode unik, dan masa berlaku." display={[{ key: "code", label: "Kode" }, { key: "name", label: "Nama" }, { key: "type", label: "Tipe" }, { key: "isActive", label: "Status", render: (r) => <StatusBadge status={r.isActive ? "AKTIF" : "NONAKTIF"} /> }]} fields={[{ key: "code", label: "Kode", required: true }, { key: "name", label: "Nama", required: true }, { key: "type", label: "Tipe", type: "select", required: true, options: [{ label: "Transfer Manual", value: "MANUAL_TRANSFER" }, { label: "Payment Gateway", value: "PAYMENT_GATEWAY" }] }, { key: "minimumAmount", label: "Nominal minimum", type: "number" }, { key: "maximumAmount", label: "Nominal maksimum", type: "number" }, { key: "uniqueCodeEnabled", label: "Aktifkan kode unik", type: "boolean" }, { key: "expiryMinutes", label: "Masa berlaku (menit)", type: "number", required: true }]} queryKey="payment-methods" title="Metode Pembayaran" />;
}
export function BankAccountsPage() {
  const api = {
    ...bankAccountsApi,
    create: (input: unknown) => {
      const value = input as Row;
      return bankAccountsApi.create({ ...value, instructions: String(value.instructions ?? "").split("\n").filter(Boolean) });
    },
    update: (id: string, input: unknown) => {
      const value = input as Row;
      return bankAccountsApi.update(id, { ...value, instructions: Array.isArray(value.instructions) ? value.instructions : String(value.instructions ?? "").split("\n").filter(Boolean) });
    },
  };
  return <ResourcePage<Row> api={api} description="Kelola rekening tujuan transfer manual." display={[{ key: "bankName", label: "Bank" }, { key: "accountNumber", label: "Nomor Rekening" }, { key: "accountHolderName", label: "Atas Nama" }, { key: "isActive", label: "Status", render: (r) => <StatusBadge status={r.isActive ? "AKTIF" : "NONAKTIF"} /> }]} fields={[{ key: "bankName", label: "Nama bank", required: true }, { key: "accountNumber", label: "Nomor rekening", required: true }, { key: "accountHolderName", label: "Atas nama", required: true }, { key: "instructions", label: "Instruksi (satu per baris)", type: "textarea", required: true }]} queryKey="bank-accounts" title="Rekening Bank" />;
}
export function UsersPage() {
  const api = {
    list: usersApi.list,
    get: usersApi.get,
    create: usersApi.create,
    update: (id: string, input: unknown) => {
      const safe = { ...(input as Row) };
      delete safe.password;
      return usersApi.update(id, safe);
    },
  };
  return <ResourcePage<Row> api={api} description="Kelola akun dan hak akses pengelola." display={[{ key: "name", label: "Nama" }, { key: "email", label: "Email" }, { key: "role", label: "Role" }, { key: "isActive", label: "Status", render: (r) => <StatusBadge status={r.isActive ? "AKTIF" : "NONAKTIF"} /> }]} fields={[{ key: "name", label: "Nama", required: true }, { key: "email", label: "Email", required: true }, { key: "role", label: "Role", type: "select", required: true, options: [{ label: "Super Admin", value: "SUPER_ADMIN" }, { label: "Campaign Manager", value: "CAMPAIGN_MANAGER" }, { label: "Verifier", value: "VERIFIER" }] }, { key: "password", label: "Password awal" }]} queryKey="users" title="Pengguna Admin" />;
}
