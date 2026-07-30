"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { Download } from "lucide-react";
import { useMemo, useState } from "react";

import { reportsApi } from "@/lib/admin-api/resources";
import { dashboardApi } from "@/lib/admin-api/dashboard";
import { DataTable, ErrorState, PageHeader } from "./AdminUI";

type Row = Record<string, unknown>;
type ReportKind = "campaigns" | "donations" | "attribution" | "payment-methods";

const idr = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

const titles: Record<ReportKind, [string, string]> = {
  campaigns: ["Laporan Program", "Baseline dan transaksi paid aktual dipisahkan untuk rekonsiliasi."],
  donations: ["Laporan Donasi", "Analisis transaksi berdasarkan periode dan status pembayaran."],
  attribution: ["Laporan Attribution", "Performa sumber, medium, dan campaign UTM."],
  "payment-methods": ["Laporan Metode Pembayaran", "Distribusi dan performa metode pembayaran."],
};

export function ReportPage({ kind }: { kind: ReportKind }) {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const query = useQuery({
    queryKey: ["admin", "reports", kind, dateFrom, dateTo],
    queryFn: async () => {
      if (kind === "campaigns") return reportsApi.campaigns();
      if (kind === "donations") return reportsApi.donations({ dateFrom, dateTo });
      if (kind === "attribution") return reportsApi.attribution();
      return reportsApi.paymentMethods();
    },
  });
  const rows = useMemo(() => (query.data?.data ?? []) as Row[], [query.data?.data]);
  const columns = useMemo<ColumnDef<Row>[]>(() => {
    const keys = Array.from(new Set(rows.flatMap((row) => Object.keys(row)))).slice(0, 10);
    return keys.map((key) => ({
      accessorKey: key,
      header: humanize(key),
      cell: ({ getValue }) => formatCell(getValue()),
    }));
  }, [rows]);
  const download = useMutation({
    mutationFn: ({ format }: { format: "csv" | "xlsx" }) => reportsApi.export(kind, format, { dateFrom, dateTo }),
  });

  return (
    <section>
      <PageHeader title={titles[kind][0]} description={titles[kind][1]} actions={kind !== "payment-methods" ? <div className="flex gap-2"><button className="admin-button admin-button-secondary" disabled={download.isPending} onClick={() => download.mutate({ format: "csv" })}><Download size={16} /> CSV</button><button className="admin-button admin-button-primary" disabled={download.isPending} onClick={() => download.mutate({ format: "xlsx" })}><Download size={16} /> XLSX</button></div> : null} />
      <div className="mb-4 flex flex-wrap gap-3 rounded-xl border border-slate-200 bg-white p-3">
        <label className="admin-field"><span>Dari tanggal</span><input type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} /></label>
        <label className="admin-field"><span>Sampai tanggal</span><input type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} /></label>
      </div>
      {download.isError && <div className="mb-4"><ErrorState error={download.error} /></div>}
      {query.isError ? <ErrorState error={query.error} onRetry={() => query.refetch()} /> : <DataTable columns={columns} data={rows} loading={query.isLoading} empty="Belum ada data untuk filter ini." />}
    </section>
  );
}

export function ReportsSummaryPage() {
  const query = useQuery({
    queryKey: ["admin", "reports", "summary"],
    queryFn: () => dashboardApi.summary(),
  });

  if (query.isError) {
    return (
      <section>
        <PageHeader
          title="Ringkasan Laporan"
          description="Ringkasan operasional yang dapat diakses sesuai role Anda."
        />
        <ErrorState error={query.error} onRetry={() => query.refetch()} />
      </section>
    );
  }

  const summary = query.data?.data;
  const cards = [
    {
      label: "Donasi hari ini",
      value: summary ? idr.format(summary.paidToday.amount) : "—",
      note: summary ? `${summary.paidToday.count} transaksi terverifikasi` : "",
    },
    {
      label: "Donasi bulan ini",
      value: summary ? idr.format(summary.paidThisMonth.amount) : "—",
      note: summary ? `${summary.paidThisMonth.count} transaksi terverifikasi` : "",
    },
    {
      label: "Perlu verifikasi",
      value: summary ? String(summary.pendingReview) : "—",
      note: "Pending payment dan manual review",
    },
    {
      label: "Program aktif",
      value: summary ? String(summary.activeCampaigns) : "—",
      note: "Program berstatus published",
    },
  ];

  return (
    <section>
      <PageHeader
        title="Ringkasan Laporan"
        description="Ikhtisar donasi dan program Derma Nusantara."
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <article className="admin-card p-5" key={card.label}>
            <p className="text-sm font-semibold text-slate-500">{card.label}</p>
            <p className="mt-3 text-2xl font-extrabold text-primary">
              {query.isLoading ? (
                <span className="block h-8 w-32 animate-pulse rounded bg-slate-100 motion-reduce:animate-none" />
              ) : card.value}
            </p>
            <p className="mt-2 text-xs text-slate-400">{card.note}</p>
          </article>
        ))}
      </div>
      {summary && (
        <div className="admin-card mt-6 overflow-hidden">
          <div className="border-b border-slate-200 p-5">
            <h2 className="font-bold text-primary">Distribusi Status Transaksi</h2>
          </div>
          <div className="grid gap-3 p-5 md:grid-cols-2 xl:grid-cols-3">
            {summary.byStatus.map((item) => (
              <div className="rounded-xl bg-slate-50 p-4" key={item.status}>
                <div className="flex items-center justify-between gap-3">
                  <span className="font-semibold">{item.status.replaceAll("_", " ")}</span>
                  <span className="font-extrabold text-primary">{item.count}</span>
                </div>
                <p className="mt-2 text-sm text-slate-500">{idr.format(item.amount)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function humanize(value: string) {
  return value.replace(/([A-Z])/g, " $1").replaceAll("_", " ").replace(/^./, (character) => character.toUpperCase());
}

function formatCell(value: unknown) {
  if (value === null || value === undefined) return "—";
  if (typeof value === "object") return JSON.stringify(value);
  if (typeof value === "boolean") return value ? "Ya" : "Tidak";
  return String(value);
}
