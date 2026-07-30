import type { Metadata } from "next";
import { AdminProviders } from "@/components/admin/AdminProviders";
import "./admin.css";

export const metadata: Metadata = {
  title: { default: "Admin Panel", template: "%s | Admin Derma Nusantara" },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminProviders>{children}</AdminProviders>;
}
