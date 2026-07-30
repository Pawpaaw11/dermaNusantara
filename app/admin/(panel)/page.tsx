"use client";

import { useQuery } from "@tanstack/react-query";
import { Activity, CircleDollarSign, Clock3, FolderHeart, ReceiptText } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PageHeader, LoadingBlock, ErrorBlock, StatusBadge } from "@/components/admin/AdminUI";
import { useAdminSession } from "@/components/admin/AdminSession";
import { dashboardApi } from "@/lib/admin-api/dashboard";

const idr = new Intl.NumberFormat("id-ID");

export default function AdminDashboardPage() {
  const { admin } = useAdminSession();
  const query = useQuery({
    queryKey: ["admin", "dashboard"],
    queryFn: () => dashboardApi.summary().then((r) => r.data),
  });
  if (query.isPending) return <LoadingBlock label="Memuat dashboard" />;
  if (query.isError) return <ErrorBlock message="Dashboard belum dapat dimuat." retry={() => query.refetch()} />;
  const data = query.data;
  const cards = [
    { label: "Donasi hari ini", value: `Rp ${idr.format(data.paidToday.amount)}`, note: `${data.paidToday.count} transaksi`, icon: ReceiptText, color: "bg-secondary-container text-on-secondary-container" },
    { label: "Donasi bulan ini", value: `Rp ${idr.format(data.paidThisMonth.amount)}`, note: `${data.paidThisMonth.count} transaksi`, icon: CircleDollarSign, color: "bg-primary-fixed text-primary" },
    { label: "Perlu verifikasi", value: idr.format(data.pendingReview), note: "Butuh tindakan admin", icon: Clock3, color: "bg-tertiary-fixed text-on-tertiary-fixed-variant" },
    { label: "Program aktif", value: idr.format(data.activeCampaigns), note: "Sedang menerima donasi", icon: FolderHeart, color: "bg-[#E5F5EE] text-[#17643A]" },
  ];
  return (
    <>
      <PageHeader title={`Selamat datang, ${admin.name}`} description="Pantau amanah, transaksi, dan program Derma Nusantara dari satu tempat." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, note, icon: Icon, color }) => (
          <article className="rounded-2xl border border-outline-variant/50 bg-white p-5 shadow-sm" key={label}>
            <div className={`flex size-11 items-center justify-center rounded-xl ${color}`}><Icon size={21} /></div>
            <p className="mt-5 text-sm font-semibold text-on-surface-variant">{label}</p>
            <p className="mt-1 text-2xl font-extrabold text-primary">{value}</p>
            <p className="mt-2 text-xs text-outline">{note}</p>
          </article>
        ))}
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-[1.7fr_1fr]">
        <section className="rounded-2xl border border-outline-variant/50 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <div><h3 className="font-headline-sm text-xl text-primary">Tren Donasi</h3><p className="text-sm text-on-surface-variant">Transaksi terverifikasi 30 hari terakhir</p></div>
            <Activity className="text-secondary" />
          </div>
          <div className="h-72">
            <ResponsiveContainer height="100%" width="100%">
              <AreaChart data={data.trend}>
                <defs><linearGradient id="adminTrend" x1="0" x2="0" y1="0" y2="1"><stop offset="5%" stopColor="#1A237E" stopOpacity={0.28}/><stop offset="95%" stopColor="#1A237E" stopOpacity={0}/></linearGradient></defs>
                <CartesianGrid stroke="#ebe8e2" strokeDasharray="3 3" />
                <XAxis dataKey="date" fontSize={11} tickLine={false} />
                <YAxis fontSize={11} tickFormatter={(v) => `${Math.round(v / 1_000_000)}jt`} tickLine={false} />
                <Tooltip formatter={(value) => `Rp ${idr.format(Number(value))}`} />
                <Area dataKey="amount" fill="url(#adminTrend)" stroke="#1A237E" strokeWidth={2.5} type="monotone" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>
        <section className="rounded-2xl border border-outline-variant/50 bg-white p-6 shadow-sm">
          <h3 className="font-headline-sm text-xl text-primary">Status Transaksi</h3>
          <p className="mb-5 text-sm text-on-surface-variant">Distribusi seluruh transaksi</p>
          <div className="space-y-3">
            {data.byStatus.map((status) => (
              <div className="flex items-center justify-between rounded-xl bg-surface-container-low p-3" key={status.status}>
                <div><StatusBadge status={status.status} /><p className="mt-1 text-xs text-outline">Rp {idr.format(status.amount)}</p></div>
                <span className="text-lg font-extrabold text-primary">{idr.format(status.count)}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
