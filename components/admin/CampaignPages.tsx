"use client";

import * as Tabs from "@radix-ui/react-tabs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowLeft, Archive, CheckCircle2, CircleStop, ImagePlus, Link2, Plus, Rocket, Save, UploadCloud } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

import { campaignsApi, mediaApi } from "@/lib/admin-api/resources";
import { AdminError, Campaign } from "@/lib/admin-api/types";

import {
  DataTable,
  EmptyState,
  ErrorState,
  PageHeader,
  StatusBadge,
} from "./AdminUI";
import {
  CampaignBaselineEditor,
  CampaignUpdatesEditor,
  DonationConfigEditor,
  DonationOptionsEditor,
  PaymentMethodsEditor,
} from "./CampaignEditors";

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
        <Tabs.List
          aria-label="Bagian pengaturan program"
          className="mb-5 flex gap-1.5 overflow-x-auto rounded-2xl border border-slate-200 bg-slate-100/80 p-1.5 shadow-sm"
        >
          {[
            ["information", "Informasi Program"],
            ["donation", "Konfigurasi Donasi"],
            ["presets", "Preset Nominal"],
            ["payments", "Metode Pembayaran"],
            ["updates", "Berita Program"],
            ["baseline", "Statistik Awal"],
          ].map(([value, label]) => (
            <Tabs.Trigger
              key={value}
              value={value}
              className="min-h-10 flex-1 whitespace-nowrap rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 outline-none transition-colors hover:bg-white hover:text-primary focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:hover:bg-primary data-[state=active]:hover:text-white"
            >
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
              <CoverImageField
                className="md:col-span-2"
                alt={form.coverImageAlt}
                url={form.coverImageUrl}
                onAltChange={(coverImageAlt) => setForm((current) => ({ ...current, coverImageAlt }))}
                onUrlChange={(coverImageUrl) => setForm((current) => ({ ...current, coverImageUrl }))}
              />
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
              <button className="admin-button admin-button-primary" disabled={save.isPending || !form.coverImageUrl || !form.coverImageAlt}>
                <Save size={17} /> {save.isPending ? "Menyimpan…" : "Simpan program"}
              </button>
            </div>
          </form>
        </Tabs.Content>

        <Tabs.Content value="donation">
          <div className="admin-card p-6">
            {!id || !campaign ? <EmptyState title="Simpan program terlebih dahulu" description="Konfigurasi donasi tersedia setelah draft berhasil dibuat." /> : <DonationConfigEditor campaign={campaign} />}
          </div>
        </Tabs.Content>
        <Tabs.Content value="presets">
          <div className="admin-card p-6">
            {!id ? <EmptyState title="Simpan program terlebih dahulu" description="Preset nominal tersedia setelah draft berhasil dibuat." /> : <DonationOptionsEditor campaignId={id} />}
          </div>
        </Tabs.Content>
        <Tabs.Content value="payments">
          <div className="admin-card p-6">
            {!id || !campaign ? <EmptyState title="Simpan program terlebih dahulu" description="Metode pembayaran tersedia setelah draft berhasil dibuat." /> : <PaymentMethodsEditor campaign={campaign} />}
          </div>
        </Tabs.Content>
        <Tabs.Content value="updates">
          <div className="admin-card p-6">
            {!id ? <EmptyState title="Simpan program terlebih dahulu" description="Berita program tersedia setelah draft berhasil dibuat." /> : <CampaignUpdatesEditor campaignId={id} />}
          </div>
        </Tabs.Content>
        <Tabs.Content value="baseline">
          <div className="admin-card p-6">
            {!id ? <EmptyState title="Simpan program terlebih dahulu" description="Statistik awal tersedia setelah draft berhasil dibuat." /> : <CampaignBaselineEditor campaignId={id} />}
          </div>
        </Tabs.Content>
      </Tabs.Root>
    </section>
  );
}

function CoverImageField({
  url,
  alt,
  onUrlChange,
  onAltChange,
  className = "",
}: {
  url: string;
  alt: string;
  onUrlChange: (value: string) => void;
  onAltChange: (value: string) => void;
  className?: string;
}) {
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<"upload" | "url">("upload");
  const [file, setFile] = useState<File>();
  const [clientError, setClientError] = useState<string>();
  const [localPreview, setLocalPreview] = useState<string>();

  useEffect(() => {
    if (!file) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLocalPreview(undefined);
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setLocalPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  const upload = useMutation({
    mutationFn: async () => {
      const body = new FormData();
      body.append("file", file!);
      return mediaApi.upload(body);
    },
    onSuccess: async (response) => {
      onUrlChange(response.data.url);
      if (!alt.trim() && file) {
        onAltChange(file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " "));
      }
      setFile(undefined);
      if (fileRef.current) fileRef.current.value = "";
      await queryClient.invalidateQueries({ queryKey: ["admin", "media"] });
    },
  });

  const selectFile = (selected?: File) => {
    setClientError(undefined);
    upload.reset();
    if (!selected) {
      setFile(undefined);
      return;
    }
    if (!["image/jpeg", "image/png", "image/webp"].includes(selected.type)) {
      setFile(undefined);
      setClientError("Gunakan gambar JPEG, PNG, atau WebP.");
      return;
    }
    if (selected.size > 5 * 1024 * 1024) {
      setFile(undefined);
      setClientError("Ukuran gambar maksimum 5 MB.");
      return;
    }
    setFile(selected);
  };

  const preview = localPreview ?? url;

  return (
    <div className={`rounded-2xl border border-slate-200 bg-slate-50/70 p-5 ${className}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-slate-800">Gambar sampul <span className="text-red-600">*</span></h3>
          <p className="mt-1 text-xs text-slate-500">Unggah gambar baru atau gunakan URL gambar yang sudah tersedia.</p>
        </div>
        <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm" aria-label="Sumber gambar">
          <button
            type="button"
            onClick={() => setMode("upload")}
            className={`inline-flex min-h-9 items-center gap-2 rounded-lg px-3 text-sm font-semibold transition-colors ${mode === "upload" ? "bg-primary text-white shadow-sm" : "text-slate-600 hover:bg-slate-50"}`}
          >
            <UploadCloud size={15} /> Upload file
          </button>
          <button
            type="button"
            onClick={() => setMode("url")}
            className={`inline-flex min-h-9 items-center gap-2 rounded-lg px-3 text-sm font-semibold transition-colors ${mode === "url" ? "bg-primary text-white shadow-sm" : "text-slate-600 hover:bg-slate-50"}`}
          >
            <Link2 size={15} /> Gunakan URL
          </button>
        </div>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div>
          {mode === "upload" ? (
            <div className="rounded-xl border-2 border-dashed border-slate-300 bg-white p-5 text-center">
              <div className="mx-auto flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <ImagePlus size={22} />
              </div>
              <p className="mt-3 text-sm font-bold text-slate-800">{file ? file.name : "Pilih gambar program"}</p>
              <p className="mt-1 text-xs text-slate-500">
                {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : "JPEG, PNG, atau WebP · maksimum 5 MB"}
              </p>
              <input
                ref={fileRef}
                className="sr-only"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(event) => selectFile(event.target.files?.[0])}
              />
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <button type="button" className="admin-button admin-button-secondary" onClick={() => fileRef.current?.click()}>
                  Pilih file
                </button>
                <button
                  type="button"
                  className="admin-button admin-button-primary"
                  disabled={!file || upload.isPending}
                  onClick={() => upload.mutate()}
                >
                  <UploadCloud size={16} /> {upload.isPending ? "Mengunggah…" : "Upload & gunakan"}
                </button>
              </div>
            </div>
          ) : (
            <label className="admin-field">
              <span>URL gambar sampul</span>
              <input
                required
                type="url"
                placeholder="https://contoh.com/gambar-program.jpg"
                value={url}
                onChange={(event) => onUrlChange(event.target.value)}
              />
              <small className="font-normal text-slate-500">Gunakan URL HTTPS yang dapat diakses publik.</small>
            </label>
          )}

          {(clientError || upload.error?.message) && (
            <p className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{clientError ?? upload.error?.message}</p>
          )}
          {mode === "upload" && url && !file && !upload.isPending && (
            <p className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-emerald-700">
              <CheckCircle2 size={16} /> Gambar berhasil dipetakan ke program.
            </p>
          )}

          <label className="admin-field mt-4">
            <span>Alt gambar <span className="text-red-600">*</span></span>
            <input
              required
              placeholder="Deskripsikan isi gambar untuk aksesibilitas"
              value={alt}
              onChange={(event) => onAltChange(event.target.value)}
            />
          </label>
        </div>

        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">Preview sampul</p>
          <div
            role="img"
            aria-label={alt || "Preview gambar sampul"}
            className="aspect-[16/10] overflow-hidden rounded-xl border border-slate-200 bg-slate-100 bg-cover bg-center"
            style={preview ? { backgroundImage: `url("${preview.replaceAll('"', "%22")}")` } : undefined}
          >
            {!preview && (
              <div className="flex size-full flex-col items-center justify-center gap-2 text-slate-400">
                <ImagePlus size={28} />
                <span className="text-xs font-medium">Belum ada gambar</span>
              </div>
            )}
          </div>
          {url && (
            <p className="mt-2 break-all text-xs text-slate-500" title={url}>
              URL tersimpan: {url}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

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
