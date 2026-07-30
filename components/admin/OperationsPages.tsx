"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowLeft, CheckCircle2, CircleX, Eye, RotateCcw, Search } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

import { donationsApi, paymentsApi } from "@/lib/admin-api/resources";
import { Donation, Payment } from "@/lib/admin-api/types";

import { ConfirmActionDialog, DataTable, ErrorState, PageHeader, StatusBadge } from "./AdminUI";

const rupiah = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });

export function DonationListPage({ initialStatus }: { initialStatus?: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const [search, setSearch] = useState(params.get("search") ?? "");
  const status = params.get("status") ?? (initialStatus === "verification" ? "" : initialStatus) ?? "";
  const page = Number(params.get("page") ?? 1);

  const query = useQuery({
    queryKey: ["admin", "donations", Object.fromEntries(params.entries()), initialStatus],
    queryFn: async () => {
      const common = { page, limit: 20, search: params.get("search") || undefined };
      if (initialStatus !== "verification") return donationsApi.list({ ...common, status: status || undefined });
      const [pending, review] = await Promise.all([
        donationsApi.list({ ...common, status: "PENDING_PAYMENT" }),
        donationsApi.list({ ...common, status: "MANUAL_REVIEW" }),
      ]);
      return { data: [...pending.data, ...review.data], meta: pending.meta };
    },
  });

  const setParams = (values: Record<string, string>) => {
    const next = new URLSearchParams(params);
    Object.entries(values).forEach(([key, value]) => value ? next.set(key, value) : next.delete(key));
    next.set("page", "1");
    router.replace(`?${next.toString()}`);
  };

  const columns = useMemo<ColumnDef<Donation>[]>(
    () => [
      { accessorKey: "publicId", header: "Invoice", cell: ({ row }) => <Link className="font-semibold text-[var(--color-primary)] hover:underline" href={`/admin/operasional/donasi/${row.original.id}`}>{row.original.publicId}</Link> },
      { accessorKey: "donorDisplayName", header: "Donatur" },
      { accessorKey: "campaign.title", header: "Program", cell: ({ row }) => row.original.campaign?.title ?? row.original.campaignTitle ?? "—" },
      { accessorKey: "baseAmount", header: "Donasi", cell: ({ getValue }) => rupiah.format(Number(getValue())) },
      { accessorKey: "status", header: "Status", cell: ({ getValue }) => <StatusBadge status={String(getValue())} /> },
      { accessorKey: "createdAt", header: "Dibuat", cell: ({ getValue }) => new Date(String(getValue())).toLocaleString("id-ID") },
      { id: "action", header: "", cell: ({ row }) => <Link aria-label="Lihat detail" className="admin-icon-button" href={`/admin/operasional/donasi/${row.original.id}`}><Eye size={16} /></Link> },
    ],
    [],
  );

  return (
    <section>
      <PageHeader title={initialStatus ? "Perlu Verifikasi" : "Donasi"} description="Pantau transaksi dan jalankan workflow verifikasi dengan audit trail." />
      <div className="mb-4 flex flex-wrap gap-3 rounded-xl border border-slate-200 bg-white p-3">
        <form className="flex min-w-64 flex-1" onSubmit={(event) => { event.preventDefault(); setParams({ search }); }}>
          <div className="relative w-full"><Search className="absolute left-3 top-2.5 text-slate-400" size={17} /><input className="admin-input w-full pl-9" placeholder="Cari invoice atau donatur…" value={search} onChange={(event) => setSearch(event.target.value)} /></div>
        </form>
        {!initialStatus && (
          <select className="admin-input" value={status} onChange={(event) => setParams({ status: event.target.value })}>
            <option value="">Semua status</option>
            {["PENDING_PAYMENT", "MANUAL_REVIEW", "PAID", "REJECTED", "EXPIRED", "CANCELLED"].map((item) => <option value={item} key={item}>{item.replaceAll("_", " ")}</option>)}
          </select>
        )}
      </div>
      {query.isError ? <ErrorState error={query.error} onRetry={() => query.refetch()} /> : <DataTable columns={columns} data={query.data?.data ?? []} loading={query.isLoading} />}
    </section>
  );
}

export function DonationDetailPage({ id }: { id: string }) {
  const queryClient = useQueryClient();
  const [action, setAction] = useState<string>();
  const [note, setNote] = useState("");
  const [bankReference, setBankReference] = useState("");
  const query = useQuery({ queryKey: ["admin", "donation", id], queryFn: () => donationsApi.get(id) });
  const mutation = useMutation({
    mutationFn: () => donationsApi.transition(id, action!, { note, bankReference: bankReference || undefined }),
    onSuccess: async () => {
      setAction(undefined);
      setNote("");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["admin", "donation", id] }),
        queryClient.invalidateQueries({ queryKey: ["admin", "donations"] }),
        queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] }),
        queryClient.invalidateQueries({ queryKey: ["admin", "payments"] }),
      ]);
    },
  });
  if (query.isError) return <ErrorState error={query.error} onRetry={() => query.refetch()} />;
  const donation = query.data?.data;
  if (!donation) return <div className="h-96 animate-pulse rounded-2xl bg-slate-100 motion-reduce:animate-none" />;
  const available = donation.availableActions ?? actionsByStatus[donation.status] ?? [];

  return (
    <section>
      <PageHeader title={donation.publicId} description="Detail transaksi, snapshot pembayaran, attribution, dan riwayat status." actions={<Link className="admin-button admin-button-secondary" href="/admin/operasional/donasi"><ArrowLeft size={16} /> Kembali</Link>} />
      <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
        <div className="space-y-5">
          <DetailCard title="Informasi Transaksi" data={donation} />
          {donation.statusHistory && <DetailCard title="Riwayat Status" data={donation.statusHistory} />}
          {donation.auditLogs && <DetailCard title="Audit Terkait" data={donation.auditLogs} />}
        </div>
        <aside className="admin-card h-fit p-5">
          <div className="mb-4 flex items-center justify-between"><h2 className="font-bold">Tindakan</h2><StatusBadge status={donation.status} /></div>
          <div className="space-y-2">
            {available.map((item) => (
              <button key={item} className={item.includes("reject") || item === "cancel" ? "admin-button admin-button-danger w-full" : "admin-button admin-button-primary w-full"} onClick={() => setAction(item)}>
                {item === "verify-payment" ? <CheckCircle2 size={16} /> : item === "reopen-review" ? <RotateCcw size={16} /> : <CircleX size={16} />}
                {actionLabels[item] ?? item}
              </button>
            ))}
            {!available.length && <p className="text-sm text-slate-500">Tidak ada transisi status yang tersedia.</p>}
          </div>
        </aside>
      </div>
      <ConfirmActionDialog open={Boolean(action)} title={action ? actionLabels[action] ?? action : ""} description="Tindakan ini dicatat pada audit log dan tidak menggunakan optimistic update." confirmLabel="Konfirmasi tindakan" pending={mutation.isPending} onClose={() => setAction(undefined)} onConfirm={() => mutation.mutate()}>
        <label className="admin-field mt-4"><span>Catatan *</span><textarea rows={3} required value={note} onChange={(event) => setNote(event.target.value)} /></label>
        {action === "verify-payment" && <label className="admin-field mt-3"><span>Referensi mutasi</span><input value={bankReference} onChange={(event) => setBankReference(event.target.value)} /></label>}
        {mutation.isError && <p className="mt-3 text-sm text-red-600">{mutation.error.message}</p>}
      </ConfirmActionDialog>
    </section>
  );
}

export function PaymentListPage() {
  const query = useQuery({ queryKey: ["admin", "payments"], queryFn: () => paymentsApi.list({ page: 1, limit: 20 }) });
  const columns = useMemo<ColumnDef<Payment>[]>(
    () => [
      { accessorKey: "donation.publicId", header: "Invoice", cell: ({ row }) => <Link className="font-semibold text-[var(--color-primary)] hover:underline" href={`/admin/operasional/pembayaran/${row.original.id}`}>{row.original.donation?.publicId ?? row.original.publicId ?? "—"}</Link> },
      { accessorKey: "payableAmount", header: "Harus dibayar", cell: ({ getValue }) => rupiah.format(Number(getValue())) },
      { accessorKey: "uniqueCode", header: "Kode unik" },
      { accessorKey: "paymentMethod.name", header: "Metode", cell: ({ row }) => row.original.paymentMethod?.name ?? row.original.paymentMethodName ?? "—" },
      { accessorKey: "status", header: "Status", cell: ({ getValue }) => <StatusBadge status={String(getValue())} /> },
      { accessorKey: "expiresAt", header: "Kedaluwarsa", cell: ({ getValue }) => new Date(String(getValue())).toLocaleString("id-ID") },
    ],
    [],
  );
  return <section><PageHeader title="Pembayaran" description="Daftar payment attempt dan snapshot rekening. Perubahan status dilakukan melalui detail donasi." />{query.isError ? <ErrorState error={query.error} onRetry={() => query.refetch()} /> : <DataTable columns={columns} data={query.data?.data ?? []} loading={query.isLoading} />}</section>;
}

export function PaymentDetailPage({ id }: { id: string }) {
  const query = useQuery({ queryKey: ["admin", "payment", id], queryFn: () => paymentsApi.get(id) });
  return <section><PageHeader title="Detail Pembayaran" description="Informasi payment bersifat read-only." actions={<Link className="admin-button admin-button-secondary" href="/admin/operasional/pembayaran"><ArrowLeft size={16} /> Kembali</Link>} />{query.isError ? <ErrorState error={query.error} onRetry={() => query.refetch()} /> : query.data ? <DetailCard title="Snapshot Pembayaran" data={query.data.data} /> : <div className="h-96 animate-pulse rounded-2xl bg-slate-100" />}</section>;
}

function DetailCard({ title, data }: { title: string; data: unknown }) {
  return <div className="admin-card p-5"><h2 className="mb-4 font-bold text-slate-900">{title}</h2><pre className="max-h-[620px] overflow-auto rounded-xl bg-slate-950 p-4 text-xs leading-6 text-slate-100">{JSON.stringify(data, null, 2)}</pre></div>;
}

const actionsByStatus: Record<string, string[]> = {
  PENDING_PAYMENT: ["manual-review", "verify-payment", "cancel"],
  MANUAL_REVIEW: ["verify-payment", "reject-payment"],
  EXPIRED: ["reopen-review"],
};
const actionLabels: Record<string, string> = {
  "manual-review": "Pindahkan ke review manual",
  "verify-payment": "Verifikasi pembayaran",
  "reject-payment": "Tolak pembayaran",
  cancel: "Batalkan donasi",
  "reopen-review": "Buka kembali review",
};
