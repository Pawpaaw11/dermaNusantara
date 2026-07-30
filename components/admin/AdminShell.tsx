"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Menu, Search } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AdminDrawer } from "./AdminDrawer";
import { useAdminSession } from "./AdminSession";
import { authApi } from "@/lib/admin-api/auth";

const titleMap: Record<string, string> = {
  operasional: "Operasional",
  donasi: "Donasi",
  pembayaran: "Pembayaran",
  verifikasi: "Perlu Verifikasi",
  program: "Program",
  kategori: "Kategori Program",
  media: "Media",
  baru: "Program Baru",
  master: "Master Data",
  laporan: "Laporan",
  sistem: "Sistem",
  pengguna: "Pengguna Admin",
  "audit-log": "Audit Log",
  pengaturan: "Pengaturan",
  profil: "Profil",
};

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { admin } = useAdminSession();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    // Hydrate the persisted desktop preference after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCollapsed(localStorage.getItem("admin-drawer-collapsed") === "true");
  }, []);

  const segments = pathname.split("/").filter(Boolean).slice(1);
  const pageTitle =
    titleMap[segments.at(-1) ?? ""] ??
    (segments.at(-1) ? "Detail" : "Dashboard");

  async function logout() {
    try {
      await authApi.logout();
      router.replace("/admin/login");
      router.refresh();
    } catch {
      toast.error("Gagal keluar. Silakan coba kembali.");
    }
  }

  return (
    <div className="flex min-h-screen bg-surface-container-low text-on-surface">
      <div className="fixed inset-y-0 left-0 z-50 hidden md:block">
        <AdminDrawer
          collapsed={collapsed}
          onCollapse={() => {
            const value = !collapsed;
            setCollapsed(value);
            localStorage.setItem("admin-drawer-collapsed", String(value));
          }}
          onLogout={logout}
        />
      </div>

      <Dialog.Root onOpenChange={setMobileOpen} open={mobileOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-[70] bg-black/45 backdrop-blur-sm md:hidden" />
          <Dialog.Content className="fixed inset-y-0 left-0 z-[80] outline-none md:hidden">
            <Dialog.Title className="sr-only">Navigasi admin</Dialog.Title>
            <AdminDrawer
              collapsed={false}
              mobile
              onClose={() => setMobileOpen(false)}
              onCollapse={() => undefined}
              onLogout={logout}
            />
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <div
        className={`min-w-0 flex-1 transition-[margin] duration-300 ${
          collapsed ? "md:ml-20" : "md:ml-[280px]"
        }`}
      >
        <header className="sticky top-0 z-40 flex h-20 items-center justify-between border-b border-outline-variant/50 bg-white/90 px-4 backdrop-blur-xl md:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button className="flex size-10 items-center justify-center rounded-xl border border-outline-variant md:hidden" onClick={() => setMobileOpen(true)}>
              <Menu size={20} />
            </button>
            <div className="min-w-0">
              <p className="truncate text-[11px] font-semibold text-on-surface-variant">
                Panel Admin / {segments.map((x) => titleMap[x] ?? x).join(" / ") || "Dashboard"}
              </p>
              <h1 className="truncate font-headline-sm text-xl text-primary">{pageTitle}</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="hidden h-10 w-64 items-center gap-2 rounded-xl border border-outline-variant bg-surface px-3 text-left text-sm text-on-surface-variant lg:flex">
              <Search size={17} />
              Cari menu atau data...
              <kbd className="ml-auto rounded bg-surface-container px-1.5 py-0.5 text-[10px]">⌘K</kbd>
            </button>
            <div className="hidden items-center gap-2 rounded-full bg-secondary-container px-3 py-2 text-xs font-bold text-on-secondary-container sm:flex">
              <span className="size-2 rounded-full bg-[#2E9D64]" />
              API Aktif
            </div>
            <div className="flex size-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-white" title={admin.name}>
              {admin.name.slice(0, 1).toUpperCase()}
            </div>
          </div>
        </header>
        <main className="p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
