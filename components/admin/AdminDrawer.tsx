"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Banknote,
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  CircleDollarSign,
  CreditCard,
  ExternalLink,
  FileBarChart,
  FolderHeart,
  Gauge,
  ImageIcon,
  Landmark,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Megaphone,
  ReceiptText,
  Settings,
  ShieldCheck,
  Tags,
  UserCog,
  Users,
  Newspaper,
  MessageSquareQuote,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AdminBrand } from "./AdminBrand";
import { useAdminSession } from "./AdminSession";
import { cn } from "@/lib/utils";
import { dashboardApi } from "@/lib/admin-api/dashboard";
import type { AdminRole } from "@/lib/admin-api/types";

type Item = {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
  roles: AdminRole[];
  badge?: "pending-payment";
};

const groups: Array<{ label: string; items: Item[] }> = [
  {
    label: "Utama",
    items: [
      {
        label: "Dashboard",
        href: "/admin",
        icon: LayoutDashboard,
        roles: ["SUPER_ADMIN", "CAMPAIGN_MANAGER", "VERIFIER"],
      },
    ],
  },
  {
    label: "Operasional",
    items: [
      { label: "Donasi", href: "/admin/operasional/donasi", icon: ReceiptText, roles: ["SUPER_ADMIN", "VERIFIER"], badge: "pending-payment" },
      { label: "Pembayaran", href: "/admin/operasional/pembayaran", icon: CircleDollarSign, roles: ["SUPER_ADMIN", "VERIFIER"] },
    ],
  },
  {
    label: "Program",
    items: [
      { label: "Semua Program", href: "/admin/program", icon: FolderHeart, roles: ["SUPER_ADMIN", "CAMPAIGN_MANAGER"] },
      { label: "Kategori Program", href: "/admin/program/kategori", icon: Tags, roles: ["SUPER_ADMIN", "CAMPAIGN_MANAGER"] },
      { label: "Media", href: "/admin/program/media", icon: ImageIcon, roles: ["SUPER_ADMIN", "CAMPAIGN_MANAGER"] },
      { label: "Buat Program Baru", href: "/admin/program/baru", icon: Megaphone, roles: ["SUPER_ADMIN", "CAMPAIGN_MANAGER"] },
    ],
  },
  {
    label: "Konten",
    items: [
      { label: "Artikel", href: "/admin/konten/artikel", icon: Newspaper, roles: ["SUPER_ADMIN", "CAMPAIGN_MANAGER"] },
      { label: "Kategori Artikel", href: "/admin/konten/kategori-artikel", icon: Tags, roles: ["SUPER_ADMIN", "CAMPAIGN_MANAGER"] },
      { label: "Hero Slider", href: "/admin/konten/slider", icon: ImageIcon, roles: ["SUPER_ADMIN", "CAMPAIGN_MANAGER"] },
      { label: "Testimoni", href: "/admin/konten/testimoni", icon: MessageSquareQuote, roles: ["SUPER_ADMIN", "CAMPAIGN_MANAGER"] },
    ],
  },
  {
    label: "Master Data",
    items: [
      { label: "Metode Pembayaran", href: "/admin/master/metode-pembayaran", icon: CreditCard, roles: ["SUPER_ADMIN", "CAMPAIGN_MANAGER"] },
      { label: "Rekening Bank", href: "/admin/master/rekening-bank", icon: Landmark, roles: ["SUPER_ADMIN", "CAMPAIGN_MANAGER"] },
    ],
  },
  {
    label: "Laporan",
    items: [
      { label: "Ringkasan", href: "/admin/laporan", icon: Gauge, roles: ["SUPER_ADMIN", "CAMPAIGN_MANAGER", "VERIFIER"] },
      { label: "Laporan Program", href: "/admin/laporan/program", icon: BarChart3, roles: ["SUPER_ADMIN", "CAMPAIGN_MANAGER"] },
      { label: "Laporan Donasi", href: "/admin/laporan/donasi", icon: FileBarChart, roles: ["SUPER_ADMIN", "VERIFIER"] },
      { label: "Attribution", href: "/admin/laporan/attribution", icon: ListChecks, roles: ["SUPER_ADMIN", "CAMPAIGN_MANAGER"] },
      { label: "Metode Pembayaran", href: "/admin/laporan/metode-pembayaran", icon: Banknote, roles: ["SUPER_ADMIN", "CAMPAIGN_MANAGER", "VERIFIER"] },
    ],
  },
  {
    label: "Sistem",
    items: [
      { label: "Pengguna Admin", href: "/admin/sistem/pengguna", icon: Users, roles: ["SUPER_ADMIN"] },
      { label: "Audit Log", href: "/admin/sistem/audit-log", icon: ShieldCheck, roles: ["SUPER_ADMIN"] },
      { label: "Pengaturan", href: "/admin/sistem/pengaturan", icon: Settings, roles: ["SUPER_ADMIN"] },
    ],
  },
];

export function AdminDrawer({
  collapsed,
  mobile,
  onCollapse,
  onClose,
  onLogout,
}: {
  collapsed: boolean;
  mobile?: boolean;
  onCollapse: () => void;
  onClose?: () => void;
  onLogout: () => void;
}) {
  const pathname = usePathname();
  const { admin } = useAdminSession();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(groups.map((group) => [group.label, true])),
  );
  useEffect(() => {
    const saved = localStorage.getItem("admin-drawer-groups");
    if (saved) {
      try {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setOpenGroups((current) => ({ ...current, ...JSON.parse(saved) }));
      } catch {
        localStorage.removeItem("admin-drawer-groups");
      }
    }
  }, []);
  const toggleGroup = (label: string) => {
    setOpenGroups((current) => {
      const next = { ...current, [label]: !current[label] };
      localStorage.setItem("admin-drawer-groups", JSON.stringify(next));
      return next;
    });
  };
  const summary = useQuery({
    queryKey: ["admin", "dashboard"],
    queryFn: () => dashboardApi.summary().then((r) => r.data),
    enabled: ["SUPER_ADMIN", "VERIFIER"].includes(admin.role),
  });
  const pendingPayment =
    summary.data?.byStatus.find((item) => item.status === "PENDING_PAYMENT")
      ?.count ?? 0;

  return (
    <aside
      className={cn(
        "flex h-full flex-col bg-primary text-white transition-[width] duration-300",
        collapsed && !mobile ? "w-20" : "w-[280px]",
      )}
    >
      <div className="flex h-20 items-center justify-between border-b border-white/10 px-5">
        <AdminBrand compact={collapsed && !mobile} />
        {mobile ? (
          <button aria-label="Tutup menu" onClick={onClose}><X size={20} /></button>
        ) : (
          <button
            aria-label={collapsed ? "Perluas menu" : "Perkecil menu"}
            className="flex size-8 items-center justify-center rounded-lg bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
            onClick={onCollapse}
          >
            {collapsed ? <ChevronRight size={17} /> : <ChevronLeft size={17} />}
          </button>
        )}
      </div>

      <nav className="admin-scrollbar flex-1 space-y-6 overflow-y-auto px-3 py-5">
        {groups.map((group) => {
          const items = group.items.filter((item) =>
            item.roles.includes(admin.role),
          );
          if (!items.length) return null;
          return (
            <div key={group.label}>
              {!collapsed || mobile ? (
                <button className="mb-2 flex w-full items-center justify-between px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-white/35 hover:text-white/70" onClick={() => toggleGroup(group.label)}>
                  {group.label}
                  <ChevronDown className={cn("transition-transform", !openGroups[group.label] && "-rotate-90")} size={13} />
                </button>
              ) : (
                <div className="mx-auto mb-2 h-px w-7 bg-white/15" />
              )}
              <div className={cn("space-y-1", !collapsed && !mobile && !openGroups[group.label] && "hidden", mobile && !openGroups[group.label] && "hidden")}>
                {items.map((item) => {
                  const active =
                    item.href === "/admin"
                      ? pathname === "/admin"
                      : pathname.startsWith(item.href);
                  const Icon = item.icon;
                  return (
                    <Link
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "group relative flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition-colors",
                        active
                          ? "bg-secondary/20 text-white"
                          : "text-white/65 hover:bg-white/10 hover:text-white",
                      )}
                      href={item.href}
                      key={item.href}
                      onClick={onClose}
                      title={collapsed && !mobile ? item.label : undefined}
                    >
                      {active ? (
                        <span className="absolute -left-3 h-6 w-1 rounded-r-full bg-secondary" />
                      ) : null}
                      <Icon className="shrink-0" size={19} />
                      <span className={cn("truncate", collapsed && !mobile && "sr-only")}>
                        {item.label}
                      </span>
                      {item.badge === "pending-payment" && pendingPayment > 0 ? (
                        <span className={cn("ml-auto rounded-full bg-tertiary px-2 py-0.5 text-[10px] font-bold text-on-tertiary", collapsed && !mobile && "absolute right-1 top-1 size-2 p-0 text-transparent")}>
                          {pendingPayment > 99 ? "99+" : pendingPayment}
                        </span>
                      ) : null}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-3">
        <Link className="flex h-10 items-center gap-3 rounded-xl px-3 text-sm text-white/60 hover:bg-white/10 hover:text-white" href="/" target="_blank">
          <ExternalLink size={18} />
          <span className={cn(collapsed && !mobile && "sr-only")}>Lihat Website Publik</span>
        </Link>
        <Link className="mt-1 flex h-12 items-center gap-3 rounded-xl bg-white/5 px-3 hover:bg-white/10" href="/admin/profil">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary font-bold text-primary">
            {admin.name.slice(0, 1).toUpperCase()}
          </span>
          <span className={cn("min-w-0 flex-1", collapsed && !mobile && "sr-only")}>
            <span className="block truncate text-xs font-bold">{admin.name}</span>
            <span className="block truncate text-[10px] text-white/45">{admin.role.replaceAll("_", " ")}</span>
          </span>
          {(!collapsed || mobile) && <UserCog className="text-white/40" size={16} />}
        </Link>
        <button className="mt-1 flex h-10 w-full items-center gap-3 rounded-xl px-3 text-sm text-white/60 hover:bg-error/20 hover:text-white" onClick={onLogout}>
          <LogOut size={18} />
          <span className={cn(collapsed && !mobile && "sr-only")}>Keluar</span>
        </button>
      </div>
    </aside>
  );
}
