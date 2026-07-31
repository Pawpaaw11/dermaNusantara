"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import {
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  CircleX,
  Copy,
  Eye,
  HeartHandshake,
  MapPin,
  MessageSquareText,
  Phone,
  ReceiptText,
  RotateCcw,
  Search,
  ShieldCheck,
  UserRound,
  WalletCards,
} from "lucide-react";
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
  const payment = donation.payments?.[0] as DonationPayment | undefined;
  const histories = donation.statusHistories ?? donation.statusHistory ?? [];
  const donorDisplayName = donation.isAnonymous ? "Hamba Allah" : donation.donorName;
  const contribution =
    donation.inputTypeSnapshot === "QUANTITY"
      ? `${donation.quantity ?? 0} ${donation.unitLabelSnapshot ?? donation.unitNameSnapshot ?? "unit"}`
      : rupiah.format(Number(donation.baseAmount));

  return (
    <section>
      <PageHeader
        title="Detail Donasi"
        description={`Invoice ${donation.invoiceNumber}`}
        actions={<Link className="admin-button admin-button-secondary" href="/admin/operasional/donasi"><ArrowLeft size={16} /> Kembali ke daftar</Link>}
      />

      <div className="admin-card mb-5 overflow-hidden">
        <div className="bg-gradient-to-r from-primary via-[#24349c] to-[#217da2] p-6 text-white md:p-7">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
            <div>
              <div className="mb-3 flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold tracking-wide">
                  {donation.invoiceNumber}
                </span>
                <StatusBadge status={donation.status} />
              </div>
              <p className="text-sm text-white/65">Total donasi</p>
              <p className="mt-1 text-3xl font-extrabold tracking-tight md:text-4xl">
                {rupiah.format(Number(donation.baseAmount))}
              </p>
              {payment && Number(payment.payableAmount) !== Number(donation.baseAmount) && (
                <p className="mt-2 text-sm text-white/70">
                  Total transfer {rupiah.format(Number(payment.payableAmount))}, termasuk kode unik {payment.uniqueCode}
                </p>
              )}
            </div>
            <div className="grid min-w-0 gap-3 sm:grid-cols-2 lg:min-w-[430px]">
              <HeroInfo label="Donatur" value={donorDisplayName} />
              <HeroInfo label="Program" value={donation.campaignTitleSnapshot} />
              <HeroInfo label="Dibuat" value={formatDateTime(donation.createdAt)} />
              <HeroInfo label="Kedaluwarsa" value={formatDateTime(donation.expiresAt)} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-5">
          <div className="grid gap-5 lg:grid-cols-2">
            <SectionCard icon={UserRound} title="Informasi Donatur" description="Identitas yang diberikan saat berdonasi.">
              <InfoRows rows={[
                ["Nama", donation.donorName],
                ["Nama tampil", donorDisplayName],
                ["WhatsApp", donation.donorWhatsapp],
                ["Donasi anonim", donation.isAnonymous ? "Ya" : "Tidak"],
              ]} />
              {Boolean(donation.publicMessage) && (
                <div className="mt-4 rounded-xl border border-secondary/20 bg-secondary-container/30 p-4">
                  <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-primary"><MessageSquareText size={15} /> Pesan donatur</div>
                  <p className="text-sm leading-6 text-slate-700">{String(donation.publicMessage)}</p>
                </div>
              )}
            </SectionCard>

            <SectionCard icon={HeartHandshake} title="Program & Kontribusi" description="Snapshot program ketika transaksi dibuat.">
              <InfoRows rows={[
                ["Program", donation.campaignTitleSnapshot],
                ["Tipe kontribusi", donation.inputTypeSnapshot],
                ["Kontribusi", contribution],
                ["Nominal dasar", rupiah.format(Number(donation.baseAmount))],
              ]} />
              <Link className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline" href={`/donasi/${String(donation.campaignSlugSnapshot)}`} target="_blank">
                Lihat halaman program
              </Link>
            </SectionCard>
          </div>

          <SectionCard icon={WalletCards} title="Informasi Pembayaran" description="Snapshot metode dan rekening tujuan transaksi.">
            {payment ? (
              <div className="grid gap-5 lg:grid-cols-[1fr_1.15fr]">
                <InfoRows rows={[
                  ["Metode", payment.paymentMethod?.name ?? payment.provider ?? "—"],
                  ["Status pembayaran", payment.status],
                  ["Nominal transfer", rupiah.format(Number(payment.payableAmount))],
                  ["Kode unik", String(payment.uniqueCode ?? 0)],
                  ["Batas pembayaran", formatDateTime(payment.expiresAt)],
                  ["Referensi bank", payment.bankReference ?? "—"],
                ]} />
                <div className="rounded-2xl bg-primary p-5 text-white">
                  <p className="text-xs font-bold uppercase tracking-wider text-white/55">Rekening tujuan</p>
                  <p className="mt-3 text-lg font-bold">{payment.bankNameSnapshot ?? payment.bankAccount?.bankName ?? "Bank"}</p>
                  <CopyValue label="Nomor rekening" value={payment.accountNumberSnapshot ?? payment.bankAccount?.accountNumber ?? "—"} />
                  <p className="mt-3 text-xs text-white/55">Atas nama</p>
                  <p className="font-semibold">{payment.accountHolderSnapshot ?? payment.bankAccount?.accountHolderName ?? "—"}</p>
                </div>
              </div>
            ) : <p className="text-sm text-slate-500">Payment belum tersedia.</p>}
          </SectionCard>

          <div className="grid gap-5 lg:grid-cols-2">
            <SectionCard icon={MapPin} title="Attribution & Perangkat" description="Sumber kunjungan dan metadata teknis.">
              <InfoRows rows={[
                ["UTM source", donation.utmSource ?? "Direct"],
                ["UTM medium", donation.utmMedium ?? "—"],
                ["UTM campaign", donation.utmCampaign ?? "—"],
                ["Referrer", donation.referrer ?? "—"],
                ["Lokasi", [donation.geoCity, donation.geoProvince, donation.geoCountry].filter(Boolean).join(", ") || "—"],
                ["IP address", donation.ipAddress ?? "—"],
              ]} />
            </SectionCard>

            <SectionCard icon={CalendarClock} title="Riwayat Status" description="Timeline perubahan status transaksi.">
              {histories.length ? (
                <ol className="space-y-4">
                  {histories.map((history, index) => (
                    <li className="relative flex gap-3" key={String(history.id ?? index)}>
                      <div className="mt-1 flex size-7 shrink-0 items-center justify-center rounded-full bg-secondary-container text-primary">
                        <CheckCircle2 size={15} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{String(history.toStatus ?? history.status ?? "Status diperbarui").replaceAll("_", " ")}</p>
                        <p className="text-xs text-slate-500">{history.createdAt ? formatDateTime(String(history.createdAt)) : "—"}</p>
                        {Boolean(history.reason) && <p className="mt-1 text-sm text-slate-600">{String(history.reason)}</p>}
                      </div>
                    </li>
                  ))}
                </ol>
              ) : <p className="text-sm text-slate-500">Belum ada perubahan status tambahan.</p>}
            </SectionCard>
          </div>

          {donation.auditLogs?.length ? (
            <details className="admin-card group p-5">
              <summary className="flex cursor-pointer list-none items-center gap-3 font-bold text-slate-900">
                <span className="flex size-9 items-center justify-center rounded-xl bg-slate-100 text-primary"><ShieldCheck size={18} /></span>
                Audit teknis
                <span className="ml-auto text-xs font-normal text-slate-500">{donation.auditLogs.length} aktivitas</span>
              </summary>
              <pre className="mt-4 max-h-96 overflow-auto rounded-xl bg-slate-950 p-4 text-xs leading-6 text-slate-100">{JSON.stringify(donation.auditLogs, null, 2)}</pre>
            </details>
          ) : null}
        </div>

        <aside className="admin-card sticky top-24 h-fit overflow-hidden">
          <div className="border-b border-slate-200 p-5">
            <div className="flex items-center justify-between"><h2 className="font-bold">Tindakan transaksi</h2><StatusBadge status={donation.status} /></div>
            <p className="mt-2 text-sm leading-5 text-slate-500">Pilih tindakan sesuai hasil pengecekan pembayaran.</p>
          </div>
          <div className="space-y-2 p-5">
          <div className="space-y-2">
            {available.map((item) => (
              <button key={item} className={item.includes("reject") || item === "cancel" ? "admin-button admin-button-danger w-full" : "admin-button admin-button-primary w-full"} onClick={() => setAction(item)}>
                {item === "verify-payment" ? <CheckCircle2 size={16} /> : item === "reopen-review" ? <RotateCcw size={16} /> : <CircleX size={16} />}
                {actionLabels[item] ?? item}
              </button>
            ))}
            {!available.length && <div className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-700"><CheckCircle2 className="mb-2" size={20} />Transaksi sudah berada pada status final.</div>}
          </div>
          </div>
          <div className="border-t border-slate-200 bg-slate-50 p-5">
            <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-400">Akses cepat</p>
            <a className="admin-button admin-button-secondary w-full" href={`https://wa.me/${String(donation.donorWhatsapp).replace(/\D/g, "")}`} target="_blank" rel="noreferrer"><Phone size={16} /> Hubungi donatur</a>
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

type DonationPayment = Payment & {
  provider?: string;
  bankReference?: string | null;
  bankAccount?: {
    bankName?: string;
    accountNumber?: string;
    accountHolderName?: string;
  } | null;
  accountHolderSnapshot?: string | null;
};

function HeroInfo({ label, value }: { label: string; value: string }) {
  return <div className="min-w-0 rounded-xl bg-white/10 px-4 py-3"><p className="text-[11px] font-bold uppercase tracking-wide text-white/50">{label}</p><p className="mt-1 truncate text-sm font-semibold">{value}</p></div>;
}

function SectionCard({ icon: Icon, title, description, children }: { icon: typeof ReceiptText; title: string; description: string; children: React.ReactNode }) {
  return <section className="admin-card p-5 md:p-6"><div className="mb-5 flex items-start gap-3"><span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-fixed text-primary"><Icon size={19} /></span><div><h2 className="font-bold text-slate-900">{title}</h2><p className="mt-0.5 text-xs leading-5 text-slate-500">{description}</p></div></div>{children}</section>;
}

function InfoRows({ rows }: { rows: Array<[string, unknown]> }) {
  return <dl className="divide-y divide-slate-100">{rows.map(([label, value]) => <div className="grid gap-1 py-3 first:pt-0 last:pb-0 sm:grid-cols-[145px_1fr]" key={label}><dt className="text-sm text-slate-500">{label}</dt><dd className="break-words text-sm font-semibold text-slate-800">{String(value ?? "—")}</dd></div>)}</dl>;
}

function CopyValue({ label, value }: { label: string; value: string }) {
  return <div className="mt-4"><p className="text-xs text-white/55">{label}</p><div className="mt-1 flex items-center justify-between gap-3"><p className="text-xl font-extrabold tracking-wider">{value}</p><button aria-label={`Salin ${label}`} className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/10 hover:bg-white/20" onClick={() => navigator.clipboard.writeText(value)}><Copy size={16} /></button></div></div>;
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Jakarta" }).format(new Date(value));
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
