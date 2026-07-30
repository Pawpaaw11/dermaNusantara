import { AdminSessionProvider } from "@/components/admin/AdminSession";
import { AdminShell } from "@/components/admin/AdminShell";

export default function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminSessionProvider>
      <AdminShell>{children}</AdminShell>
    </AdminSessionProvider>
  );
}
