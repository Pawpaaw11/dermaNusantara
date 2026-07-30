"use client";

import * as Tabs from "@radix-ui/react-tabs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowLeft, Archive, CircleStop, Plus, Rocket, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";

import { campaignsApi } from "@/lib/admin-api/resources";
import { AdminError, Campaign } from "@/lib/admin-api/types";

import {
  DataTable,
  EmptyState,
  ErrorState,
  PageHeader,
  StatusBadge,
} from "./AdminUI";

const emptyForm = {
  categoryId: "",
  slug: "",
  title: "",
  shortDescription: "",
  description: "",
  coverImageUrl: "",
  coverImageAlt: "",
  location: "",
  story: "",
  highlights: "",
  featured: false,
  acceptingDonations: false,
  targetMetric: "AMOUNT",
  targetAmount: "",
  targetQuantity: "",
  startsAt: "",
  endsAt: "",
};

function dateInput(value?: string | null) {
  return value ? value.slice(0, 16) : "";
}

export function CampaignListPage() {
  const query = useQuery({
    queryKey: ["admin", "campaigns"],
    queryFn: () => campaignsApi.list({ page: 1, limit: 20, sortBy: "updatedAt", sortOrder: "desc" }),
  });

  const columns = useMemo<ColumnDef<Campaign>[]>(
    () => [
      {
        accessorKey: "title",
        header: "Program",
        cell: ({ row }) => (
          <div>
            <Link className="font-semibold text-[var(--color-primary)] hover:underline" href={`/admin/program/${row.original.id}`}>
              {row.original.title}
            </Link>
            <p className="text-xs text-slate-500">/{row.original.slug}</p>
          </div>
        ),
      },
      { accessorKey: "category.name", header: "Kategori", cell: ({ row }) => row.original.category?.name ?? "—" },
      { accessorKey: "status", header: "Status", cell: ({ row }) => <StatusBadge status={row.original.status} /> },
      {
        id: "accepting",
        header: "Donasi",
        cell: ({ row }) => (row.original.acceptingDonations ? "Dibuka" : "Ditutup"),
      },
      {
        accessorKey: "updatedAt",
        header: "Diperbarui",
        cell: ({ getValue }) => new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(new Date(getValue<string>())),
      },
    ],
    [],
  );

  return (
    <section>
      <PageHeader
        title="Semua Program"
        description="Kelola konten, status publikasi, konfigurasi donasi, dan target program."
        actions={
          <Link className="admin-button admin-button-primary" href="/admin/program/baru">
            <Plus size={17} /> Buat program
          </Link>
        }
      />
      {query.isError ? (
        <ErrorState error={query.error} onRetry={() => query.refetch()} />
      ) : query.data?.data.length === 0 ? (
        <EmptyState title="Belum ada program" description="Buat draft program pertama Anda." />
      ) : (
        <DataTable columns={columns} data={query.data?.data ?? []} loading={query.isLoading} />
      )}
    </section>
  );
}

export function CampaignEditorPage({ id }: { id?: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState<string>();

  const detail = useQuery({
    queryKey: ["admin", "campaign", id],
    queryFn: () => campaignsApi.get(id!),
    enabled: Boolean(id),
  });
  const categories = useQuery({
    queryKey: ["admin", "campaign-categories", "options"],
    queryFn: () => campaignsApi.categories(),
  });

  useEffect(() => {
    const item = detail.data?.data;
    if (!item) return;
    // React Query owns the remote snapshot; hydrate the editable draft once it arrives.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setForm({
      categoryId: item.categoryId,
      slug: item.slug,
      title: item.title,
      shortDescription: item.shortDescription,
      description: item.description,
      coverImageUrl: item.coverImageUrl,
      coverImageAlt: item.coverImageAlt,
      location: item.location ?? "",
      story: item.story.join("\n"),
      highlights: item.highlights.join("\n"),
      featured: item.featured ?? item.isFeatured,
      acceptingDonations: item.acceptingDonations,
      targetMetric: item.targetMetric ?? "AMOUNT",
      targetAmount: item.targetAmount?.toString() ?? "",
      targetQuantity: item.targetQuantity?.toString() ?? "",
      startsAt: dateInput(item.startsAt),
      endsAt: dateInput(item.endsAt),
    });
  }, [detail.data]);

  const save = useMutation({
    mutationFn: async () => {
      const payload = {
        categoryId: form.categoryId,
        slug: form.slug,
        title: form.title,
        shortDescription: form.shortDescription,
        description: form.description,
        coverImageUrl: form.coverImageUrl,
        coverImageAlt: form.coverImageAlt,
        location: form.location || undefined,
        story: form.story.split("\n").map((value) => value.trim()).filter(Boolean),
        highlights: form.highlights.split("\n").map((value) => value.trim()).filter(Boolean),
        isFeatured: form.featured,
        acceptingDonations: form.acceptingDonations,
        targetMetric: form.targetMetric,
        targetAmount: form.targetMetric === "AMOUNT" && form.targetAmount ? Number(form.targetAmount) : null,
        targetQuantity: form.targetMetric === "QUANTITY" && form.targetQuantity ? Number(form.targetQuantity) : null,
        startsAt: form.startsAt ? new Date(form.startsAt).toISOString() : null,
        endsAt: form.endsAt ? new Date(form.endsAt).toISOString() : null,
      };
      if (!id) return campaignsApi.create(payload);
      return campaignsApi.update(id, { ...payload, expectedUpdatedAt: detail.data?.data.updatedAt });
    },
    onSuccess: async (response) => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "campaigns"] });
      const item = response.data as Campaign;
      if (!id) router.replace(`/admin/program/${item.id}`);
      else {
        await queryClient.invalidateQueries({ queryKey: ["admin", "campaign", id] });
        setMessage("Perubahan program berhasil disimpan.");
      }
    },
  });

  const lifecycle = useMutation({
    mutationFn: (action: "publish" | "close" | "archive" | "restore-draft") => campaignsApi.action(id!, action),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["admin", "campaign", id] }),
        queryClient.invalidateQueries({ queryKey: ["admin", "campaigns"] }),
        queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] }),
      ]);
    },
  });

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setMessage(undefined);
    save.mutate();
  };

  if (detail.isError) return <ErrorState error={detail.error} onRetry={() => detail.refetch()} />;

  const campaign = detail.data?.data;

  return (
    <section>
      <PageHeader
        title={id ? campaign?.title ?? "Memuat program…" : "Buat Program Baru"}
        description={id ? "Kelola seluruh konfigurasi program dari satu tempat." : "Program baru selalu disimpan sebagai draft."}
        actions={
          <Link className="admin-button admin-button-secondary" href="/admin/program">
            <ArrowLeft size={16} /> Kembali
          </Link>
        }
      />

      {campaign && (
        <div className="mb-5 flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white p-4">
          <StatusBadge status={campaign.status} />
          <span className="mr-auto text-sm text-slate-500">Terakhir diperbarui {new Date(campaign.updatedAt).toLocaleString("id-ID")}</span>
          {campaign.status === "DRAFT" && (
            <button className="admin-button admin-button-primary" onClick={() => lifecycle.mutate("publish")} disabled={lifecycle.isPending}>
              <Rocket size={16} /> Publikasikan
            </button>
          )}
          {campaign.status === "PUBLISHED" && (
            <button className="admin-button admin-button-secondary" onClick={() => lifecycle.mutate("close")} disabled={lifecycle.isPending}>
              <CircleStop size={16} /> Tutup
            </button>
          )}
          {campaign.status !== "ARCHIVED" && (
            <button className="admin-button admin-button-danger" onClick={() => lifecycle.mutate("archive")} disabled={lifecycle.isPending}>
              <Archive size={16} /> Arsipkan
            </button>
          )}
          {campaign.status === "ARCHIVED" && (
            <button className="admin-button admin-button-secondary" onClick={() => lifecycle.mutate("restore-draft")} disabled={lifecycle.isPending}>
              Pulihkan ke draft
            </button>
          )}
        </div>
      )}

      <Tabs.Root defaultValue="information">
        <Tabs.List className="mb-5 flex gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-white p-1">
          {[
            ["information", "Informasi Program"],
            ["donation", "Konfigurasi Donasi"],
            ["presets", "Preset Nominal"],
            ["payments", "Metode Pembayaran"],
            ["updates", "Berita Program"],
            ["baseline", "Statistik Awal"],
          ].map(([value, label]) => (
            <Tabs.Trigger key={value} value={value} className="whitespace-nowrap rounded-lg px-4 py-2 text-sm font-semibold text-slate-500 data-[state=active]:bg-[var(--color-primary)] data-[state=active]:text-white">
              {label}
            </Tabs.Trigger>
          ))}
        </Tabs.List>

        <Tabs.Content value="information">
          <form onSubmit={submit} className="admin-card space-y-6 p-6">
            {(save.error || lifecycle.error) && <ErrorState error={(save.error ?? lifecycle.error) as AdminError} />}
            {message && <p className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</p>}
            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Judul" required value={form.title} onChange={(title) => setForm({ ...form, title })} />
              <Field label="Slug" required value={form.slug} onChange={(slug) => setForm({ ...form, slug })} />
              <label className="admin-field">
                <span>Kategori</span>
                <select required value={form.categoryId} onChange={(event) => setForm({ ...form, categoryId: event.target.value })}>
                  <option value="">Pilih kategori</option>
                  {categories.data?.data.map((category) => <option value={category.id} key={category.id}>{category.name}</option>)}
                </select>
              </label>
              <Field label="Lokasi" value={form.location} onChange={(location) => setForm({ ...form, location })} />
              <Field className="md:col-span-2" label="Deskripsi singkat" required value={form.shortDescription} onChange={(shortDescription) => setForm({ ...form, shortDescription })} />
              <TextArea className="md:col-span-2" label="Deskripsi lengkap" required value={form.description} onChange={(description) => setForm({ ...form, description })} />
              <Field label="URL gambar sampul" required value={form.coverImageUrl} onChange={(coverImageUrl) => setForm({ ...form, coverImageUrl })} />
              <Field label="Alt gambar" required value={form.coverImageAlt} onChange={(coverImageAlt) => setForm({ ...form, coverImageAlt })} />
              <TextArea label="Cerita (satu paragraf per baris)" value={form.story} onChange={(story) => setForm({ ...form, story })} />
              <TextArea label="Highlight (satu item per baris)" value={form.highlights} onChange={(highlights) => setForm({ ...form, highlights })} />
              <label className="admin-field">
                <span>Metrik target</span>
                <select value={form.targetMetric} onChange={(event) => setForm({ ...form, targetMetric: event.target.value })}>
                  <option value="AMOUNT">Nominal</option>
                  <option value="QUANTITY">Kuantitas</option>
                </select>
              </label>
              <Field label={form.targetMetric === "AMOUNT" ? "Target nominal" : "Target kuantitas"} type="number" value={form.targetMetric === "AMOUNT" ? form.targetAmount : form.targetQuantity} onChange={(value) => setForm(form.targetMetric === "AMOUNT" ? { ...form, targetAmount: value } : { ...form, targetQuantity: value })} />
              <Field label="Mulai" type="datetime-local" value={form.startsAt} onChange={(startsAt) => setForm({ ...form, startsAt })} />
              <Field label="Berakhir" type="datetime-local" value={form.endsAt} onChange={(endsAt) => setForm({ ...form, endsAt })} />
            </div>
            <div className="flex flex-wrap gap-5">
              <Check label="Program unggulan" checked={form.featured} onChange={(featured) => setForm({ ...form, featured })} />
              <Check label="Menerima donasi" checked={form.acceptingDonations} onChange={(acceptingDonations) => setForm({ ...form, acceptingDonations })} />
            </div>
            <div className="sticky bottom-4 flex justify-end rounded-xl border border-slate-200 bg-white/95 p-3 shadow-lg backdrop-blur">
              <button className="admin-button admin-button-primary" disabled={save.isPending}>
                <Save size={17} /> {save.isPending ? "Menyimpan…" : "Simpan program"}
              </button>
            </div>
          </form>
        </Tabs.Content>

        {["donation", "presets", "payments", "updates", "baseline"].map((tab) => (
          <Tabs.Content key={tab} value={tab}>
            <div className="admin-card p-6">
              {!id ? (
                <EmptyState title="Simpan program terlebih dahulu" description="Konfigurasi lanjutan tersedia setelah draft berhasil dibuat." />
              ) : (
                <CampaignSubresource campaignId={id} tab={tab} />
              )}
            </div>
          </Tabs.Content>
        ))}
      </Tabs.Root>
    </section>
  );
}

function CampaignSubresource({ campaignId, tab }: { campaignId: string; tab: string }) {
  const query = useQuery({
    queryKey: ["admin", "campaign", campaignId, tab],
    queryFn: () => campaignsApi.subresource(campaignId, tab),
  });
  if (query.isError) return <ErrorState error={query.error} onRetry={() => query.refetch()} />;
  if (query.isLoading) return <div className="h-40 animate-pulse rounded-xl bg-slate-100 motion-reduce:animate-none" />;
  return (
    <div>
      <h2 className="mb-2 text-lg font-bold text-slate-900">{subresourceLabels[tab]}</h2>
      <p className="mb-5 text-sm text-slate-500">Data berikut berasal langsung dari Admin API.</p>
      <pre className="max-h-[520px] overflow-auto rounded-xl bg-slate-950 p-4 text-xs text-slate-100">{JSON.stringify(query.data?.data ?? null, null, 2)}</pre>
    </div>
  );
}

const subresourceLabels: Record<string, string> = {
  donation: "Konfigurasi Donasi",
  presets: "Preset Nominal",
  payments: "Metode Pembayaran",
  updates: "Berita Program",
  baseline: "Statistik Awal",
};

function Field({ label, value, onChange, type = "text", required, className = "" }: { label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean; className?: string }) {
  return (
    <label className={`admin-field ${className}`}>
      <span>{label}</span>
      <input required={required} type={type} value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function TextArea({ label, value, onChange, required, className = "" }: { label: string; value: string; onChange: (value: string) => void; required?: boolean; className?: string }) {
  return (
    <label className={`admin-field ${className}`}>
      <span>{label}</span>
      <textarea required={required} rows={5} value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function Check({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return <label className="flex items-center gap-2 text-sm font-medium text-slate-700"><input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} /> {label}</label>;
}
