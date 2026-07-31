"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowDown,
  ArrowUp,
  Banknote,
  CalendarDays,
  Check,
  CircleDollarSign,
  Coins,
  CreditCard,
  Edit3,
  FileText,
  Hash,
  Info,
  Package,
  Plus,
  Save,
  ShieldCheck,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { campaignsApi } from "@/lib/admin-api/resources";
import type {
  Campaign,
  CampaignDonationConfig,
  CampaignDonationOption,
  CampaignUpdate,
} from "@/lib/admin-api/types";

import { useAdminSession } from "./AdminSession";
import { ConfirmActionDialog, EmptyState, ErrorState, StatusBadge } from "./AdminUI";

const idr = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });
const integer = new Intl.NumberFormat("id-ID");

function EditorSkeleton() {
  return (
    <div className="animate-pulse space-y-5 motion-reduce:animate-none" role="status">
      <span className="sr-only">Memuat konfigurasi program</span>
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((item) => <div className="h-28 rounded-2xl bg-slate-100" key={item} />)}
      </div>
      <div className="h-64 rounded-2xl bg-slate-100" />
    </div>
  );
}

function SectionHeading({ icon, title, description, action }: { icon: React.ReactNode; title: string; description: string; action?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
      <div className="flex gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">{icon}</span>
        <div>
          <h2 className="text-lg font-bold text-slate-900">{title}</h2>
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        </div>
      </div>
      {action}
    </div>
  );
}

function FieldError({ message }: { message?: string }) {
  return message ? <span className="text-xs font-medium text-red-600">{message}</span> : null;
}

const donationSchema = z.object({
  inputType: z.enum(["MONEY", "QUANTITY"]),
  currency: z.string().min(3),
  minimumAmount: z.number().min(1).nullable(),
  maximumAmount: z.number().min(1).nullable(),
  allowCustomAmount: z.boolean(),
  unitName: z.string(),
  unitLabel: z.string(),
  unitPrice: z.number().min(1).nullable(),
  minimumQuantity: z.number().min(1).nullable(),
  maximumQuantity: z.number().min(1).nullable(),
  quantityStep: z.number().min(1).nullable(),
}).superRefine((value, context) => {
  if (value.inputType === "MONEY" && !value.minimumAmount) {
    context.addIssue({ code: "custom", path: ["minimumAmount"], message: "Minimum donasi wajib diisi." });
  }
  if (value.inputType === "QUANTITY") {
    for (const [key, label] of [["unitName", "Nama unit"], ["unitLabel", "Label unit"]] as const) {
      if (!value[key].trim()) context.addIssue({ code: "custom", path: [key], message: `${label} wajib diisi.` });
    }
    for (const key of ["unitPrice", "minimumQuantity", "quantityStep"] as const) {
      if (!value[key]) context.addIssue({ code: "custom", path: [key], message: "Field ini wajib diisi." });
    }
  }
});
type DonationForm = z.infer<typeof donationSchema>;

function donationDefaults(config?: CampaignDonationConfig | null): DonationForm {
  return {
    inputType: config?.inputType ?? "MONEY",
    currency: config?.currency ?? "IDR",
    minimumAmount: config?.minimumAmount ?? 25_000,
    maximumAmount: config?.maximumAmount ?? null,
    allowCustomAmount: config?.allowCustomAmount ?? true,
    unitName: config?.unitName ?? "",
    unitLabel: config?.unitLabel ?? "",
    unitPrice: config?.unitPrice ?? null,
    minimumQuantity: config?.minimumQuantity ?? 1,
    maximumQuantity: config?.maximumQuantity ?? null,
    quantityStep: config?.quantityStep ?? 1,
  };
}

export function DonationConfigEditor({ campaign }: { campaign: Campaign }) {
  const client = useQueryClient();
  const form = useForm<DonationForm>({ resolver: zodResolver(donationSchema), defaultValues: donationDefaults(campaign.donationConfig) });
  const inputType = useWatch({ control: form.control, name: "inputType" });
  const originalType = campaign.donationConfig?.inputType;
  useEffect(() => form.reset(donationDefaults(campaign.donationConfig)), [campaign.donationConfig, form]);
  const save = useMutation({
    mutationFn: (values: DonationForm) => campaignsApi.saveDonationConfig(campaign.id, {
      ...values,
      minimumAmount: values.inputType === "MONEY" ? values.minimumAmount : null,
      maximumAmount: values.inputType === "MONEY" ? values.maximumAmount : null,
      allowCustomAmount: values.inputType === "MONEY" ? values.allowCustomAmount : false,
      unitName: values.inputType === "QUANTITY" ? values.unitName : null,
      unitLabel: values.inputType === "QUANTITY" ? values.unitLabel : null,
      unitPrice: values.inputType === "QUANTITY" ? values.unitPrice : null,
      minimumQuantity: values.inputType === "QUANTITY" ? values.minimumQuantity : null,
      maximumQuantity: values.inputType === "QUANTITY" ? values.maximumQuantity : null,
      quantityStep: values.inputType === "QUANTITY" ? values.quantityStep : null,
    }),
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: ["admin", "campaign", campaign.id] });
      toast.success("Konfigurasi donasi berhasil disimpan.");
    },
    onError: (error: Error) => toast.error(error.message),
  });
  const lockedType = Boolean(originalType && (campaign.status !== "DRAFT" || (campaign._count?.donations ?? 0) > 0));

  return (
    <form onSubmit={form.handleSubmit((values) => save.mutate(values))}>
      <SectionHeading icon={<CircleDollarSign size={22} />} title="Konfigurasi Donasi" description="Atur cara donatur menentukan kontribusi pada program ini." />
      <div className="grid gap-4 sm:grid-cols-2">
        {(["MONEY", "QUANTITY"] as const).map((type) => (
          <button
            type="button"
            disabled={lockedType && type !== originalType}
            onClick={() => form.setValue("inputType", type, { shouldDirty: true, shouldValidate: true })}
            className={`rounded-2xl border p-5 text-left transition ${inputType === type ? "border-primary bg-primary/5 ring-2 ring-primary/15" : "border-slate-200 hover:border-primary/40"} disabled:cursor-not-allowed disabled:opacity-50`}
            key={type}
          >
            <span className="flex items-center justify-between">
              <span className="flex size-10 items-center justify-center rounded-xl bg-white text-primary shadow-sm">{type === "MONEY" ? <Banknote size={20} /> : <Package size={20} />}</span>
              {inputType === type && <span className="flex size-6 items-center justify-center rounded-full bg-primary text-white"><Check size={14} /></span>}
            </span>
            <strong className="mt-4 block text-slate-900">{type === "MONEY" ? "Nominal uang" : "Jumlah unit"}</strong>
            <span className="mt-1 block text-sm text-slate-500">{type === "MONEY" ? "Donatur memilih nominal rupiah." : "Donatur memilih jumlah paket atau barang."}</span>
          </button>
        ))}
      </div>
      {lockedType && <p className="mt-4 flex items-start gap-2 rounded-xl bg-amber-50 p-4 text-sm text-amber-800"><Info className="mt-0.5 shrink-0" size={16} /> Tipe kontribusi tidak dapat diubah karena program sudah dipublikasikan atau memiliki transaksi.</p>}

      <div className="mt-6 grid gap-5 rounded-2xl border border-slate-200 bg-slate-50/60 p-5 md:grid-cols-2">
        {inputType === "MONEY" ? (
          <>
            <label className="admin-field"><span>Mata uang</span><input disabled {...form.register("currency")} /></label>
            <label className="admin-field"><span>Minimum donasi</span><input type="number" {...form.register("minimumAmount", { setValueAs: optionalNumber })} /><FieldError message={form.formState.errors.minimumAmount?.message} /></label>
            <label className="admin-field"><span>Maksimum donasi <small className="font-normal text-slate-400">(opsional)</small></span><input type="number" {...form.register("maximumAmount", { setValueAs: optionalNumber })} /><FieldError message={form.formState.errors.maximumAmount?.message} /></label>
            <label className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 text-sm font-semibold text-slate-700">
              <span><strong className="block">Izinkan nominal custom</strong><small className="font-normal text-slate-500">Donatur dapat memasukkan nominal sendiri.</small></span>
              <input className="size-5 accent-primary" type="checkbox" {...form.register("allowCustomAmount")} />
            </label>
          </>
        ) : (
          <>
            <label className="admin-field"><span>Nama unit</span><input placeholder="Contoh: Al-Quran" {...form.register("unitName")} /><FieldError message={form.formState.errors.unitName?.message} /></label>
            <label className="admin-field"><span>Label unit</span><input placeholder="Contoh: mushaf" {...form.register("unitLabel")} /><FieldError message={form.formState.errors.unitLabel?.message} /></label>
            <label className="admin-field"><span>Harga per unit</span><input type="number" {...form.register("unitPrice", { setValueAs: optionalNumber })} /><FieldError message={form.formState.errors.unitPrice?.message} /></label>
            <label className="admin-field"><span>Minimum kuantitas</span><input type="number" {...form.register("minimumQuantity", { setValueAs: optionalNumber })} /><FieldError message={form.formState.errors.minimumQuantity?.message} /></label>
            <label className="admin-field"><span>Maksimum kuantitas <small className="font-normal text-slate-400">(opsional)</small></span><input type="number" {...form.register("maximumQuantity", { setValueAs: optionalNumber })} /></label>
            <label className="admin-field"><span>Kelipatan kuantitas</span><input type="number" {...form.register("quantityStep", { setValueAs: optionalNumber })} /><FieldError message={form.formState.errors.quantityStep?.message} /></label>
          </>
        )}
      </div>
      <div className="mt-5 flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-xs text-slate-500">{inputType === "MONEY" ? `Minimum saat ini ${idr.format(form.getValues("minimumAmount") ?? 0)}` : `Harga satuan ${idr.format(form.getValues("unitPrice") ?? 0)}`}</p>
        <button className="admin-button admin-button-primary" disabled={save.isPending || !form.formState.isDirty}><Save size={16} /> {save.isPending ? "Menyimpan…" : "Simpan konfigurasi"}</button>
      </div>
    </form>
  );
}

const optionSchema = z.object({
  amount: z.number().int().min(1, "Nominal wajib lebih dari nol."),
  label: z.string(),
  sortOrder: z.number().int().min(0),
  isActive: z.boolean(),
});
type OptionForm = z.infer<typeof optionSchema>;

export function DonationOptionsEditor({ campaignId }: { campaignId: string }) {
  const client = useQueryClient();
  const query = useQuery({ queryKey: ["admin", "campaign", campaignId, "options"], queryFn: () => campaignsApi.donationOptions(campaignId) });
  const [editing, setEditing] = useState<CampaignDonationOption | "new">();
  const [deleting, setDeleting] = useState<CampaignDonationOption>();
  const form = useForm<OptionForm>({ resolver: zodResolver(optionSchema), defaultValues: { amount: 0, label: "", sortOrder: 0, isActive: true } });
  const open = (item: CampaignDonationOption | "new") => {
    setEditing(item);
    form.reset(item === "new" ? { amount: 0, label: "", sortOrder: query.data?.data.length ?? 0, isActive: true } : { amount: item.amount, label: item.label ?? "", sortOrder: item.sortOrder, isActive: item.isActive });
  };
  const mutation = useMutation({
    mutationFn: (values: OptionForm) => editing === "new"
      ? campaignsApi.createDonationOption(campaignId, values)
      : campaignsApi.updateDonationOption(campaignId, editing!.id, values),
    onSuccess: async () => {
      setEditing(undefined);
      await invalidateCampaign(client, campaignId, "options");
      toast.success("Preset nominal berhasil disimpan.");
    },
    onError: (error: Error) => toast.error(error.message),
  });
  const remove = useMutation({
    mutationFn: () => campaignsApi.deleteDonationOption(campaignId, deleting!.id),
    onSuccess: async () => {
      setDeleting(undefined);
      await invalidateCampaign(client, campaignId, "options");
      toast.success("Preset nominal dihapus.");
    },
    onError: (error: Error) => toast.error(error.message),
  });
  const move = useMutation({
    mutationFn: async ({ item, direction }: { item: CampaignDonationOption; direction: -1 | 1 }) => {
      const list = query.data!.data;
      const index = list.findIndex((entry) => entry.id === item.id);
      const other = list[index + direction];
      await Promise.all([
        campaignsApi.updateDonationOption(campaignId, item.id, optionPayload(item, other.sortOrder)),
        campaignsApi.updateDonationOption(campaignId, other.id, optionPayload(other, item.sortOrder)),
      ]);
    },
    onSuccess: () => invalidateCampaign(client, campaignId, "options"),
    onError: (error: Error) => toast.error(error.message),
  });

  if (query.isLoading) return <EditorSkeleton />;
  if (query.isError) return <ErrorState error={query.error} onRetry={() => query.refetch()} />;
  const items = query.data?.data ?? [];
  return (
    <>
      <SectionHeading
        icon={<Coins size={22} />}
        title="Preset Nominal"
        description="Sediakan pilihan cepat agar donatur lebih mudah menentukan nominal."
        action={<button className="admin-button admin-button-primary" onClick={() => open("new")}><Plus size={16} /> Tambah preset</button>}
      />
      {!items.length ? <EmptyState title="Belum ada preset nominal" description="Tambahkan pilihan nominal pertama untuk program ini." /> : (
        <div className="overflow-hidden rounded-2xl border border-slate-200">
          {items.map((item, index) => (
            <div className="grid gap-4 border-b border-slate-100 bg-white p-4 last:border-0 sm:grid-cols-[1fr_auto_auto] sm:items-center" key={item.id}>
              <div>
                <div className="flex flex-wrap items-center gap-2"><strong className="text-lg text-primary">{idr.format(item.amount)}</strong><StatusBadge status={item.isActive ? "AKTIF" : "NONAKTIF"} /></div>
                <p className="mt-1 text-sm text-slate-500">{item.label || "Tanpa label"} · Urutan {item.sortOrder}</p>
              </div>
              <div className="flex gap-1">
                <button aria-label="Pindahkan ke atas" className="admin-icon-button" disabled={index === 0 || move.isPending} onClick={() => move.mutate({ item, direction: -1 })}><ArrowUp size={16} /></button>
                <button aria-label="Pindahkan ke bawah" className="admin-icon-button" disabled={index === items.length - 1 || move.isPending} onClick={() => move.mutate({ item, direction: 1 })}><ArrowDown size={16} /></button>
              </div>
              <div className="flex gap-2">
                <button className="admin-button admin-button-secondary" onClick={() => open(item)}><Edit3 size={15} /> Edit</button>
                <button aria-label="Hapus preset" className="admin-icon-button text-red-600" onClick={() => setDeleting(item)}><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
      <EditorDialog open={Boolean(editing)} title={editing === "new" ? "Tambah preset nominal" : "Edit preset nominal"} description="Nominal disimpan sebagai integer rupiah." onClose={() => setEditing(undefined)}>
        <form className="mt-5 space-y-4" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
          <label className="admin-field"><span>Nominal</span><input type="number" {...form.register("amount", { valueAsNumber: true })} /><FieldError message={form.formState.errors.amount?.message} /></label>
          <label className="admin-field"><span>Label <small className="font-normal text-slate-400">(opsional)</small></span><input placeholder="Contoh: Paket terbaik" {...form.register("label")} /></label>
          <label className="admin-field"><span>Urutan</span><input type="number" {...form.register("sortOrder", { valueAsNumber: true })} /></label>
          <label className="flex items-center gap-3 text-sm font-semibold text-slate-700"><input className="size-5 accent-primary" type="checkbox" {...form.register("isActive")} /> Tampilkan preset kepada donatur</label>
          <DialogActions pending={mutation.isPending} onCancel={() => setEditing(undefined)} label="Simpan preset" />
        </form>
      </EditorDialog>
      <ConfirmActionDialog open={Boolean(deleting)} title="Hapus preset nominal?" description={`${deleting ? idr.format(deleting.amount) : ""} akan dihapus dari pilihan donatur.`} confirmLabel="Hapus preset" pending={remove.isPending} onClose={() => setDeleting(undefined)} onConfirm={() => remove.mutate()} />
    </>
  );
}

export function PaymentMethodsEditor({ campaign }: { campaign: Campaign }) {
  const client = useQueryClient();
  const query = useQuery({ queryKey: ["admin", "payment-methods", "campaign-options"], queryFn: campaignsApi.paymentMethodMasters });
  const initial = useMemo(() => campaign.paymentMethods?.map((link) => link.paymentMethodId) ?? [], [campaign.paymentMethods]);
  const [selected, setSelected] = useState<string[]>(initial);
  const [confirmRemoval, setConfirmRemoval] = useState(false);
  const save = useMutation({
    mutationFn: () => campaignsApi.savePaymentMethods(campaign.id, selected),
    onSuccess: async () => {
      setConfirmRemoval(false);
      await client.invalidateQueries({ queryKey: ["admin", "campaign", campaign.id] });
      toast.success("Metode pembayaran program berhasil disimpan.");
    },
    onError: (error: Error) => toast.error(error.message),
  });
  if (query.isLoading) return <EditorSkeleton />;
  if (query.isError) return <ErrorState error={query.error} onRetry={() => query.refetch()} />;
  const removed = initial.filter((id) => !selected.includes(id));
  const dirty = [...selected].sort().join() !== [...initial].sort().join();
  const submit = () => campaign.status === "PUBLISHED" && removed.length ? setConfirmRemoval(true) : save.mutate();

  return (
    <>
      <SectionHeading icon={<CreditCard size={22} />} title="Metode Pembayaran" description="Pilih metode aktif yang tersedia untuk donatur program ini." />
      <div className="grid gap-4 lg:grid-cols-2">
        {(query.data?.data ?? []).map((method) => {
          const checked = selected.includes(method.id);
          const disabled = !method.isActive && !checked;
          return (
            <label className={`relative rounded-2xl border p-5 transition ${checked ? "border-primary bg-primary/5 ring-2 ring-primary/10" : "border-slate-200"} ${disabled ? "opacity-55" : "cursor-pointer hover:border-primary/40"}`} key={method.id}>
              <input
                type="checkbox"
                className="absolute right-5 top-5 size-5 accent-primary"
                checked={checked}
                disabled={disabled}
                onChange={() => setSelected((current) => checked ? current.filter((id) => id !== method.id) : [...current, method.id])}
              />
              <div className="flex size-10 items-center justify-center rounded-xl bg-white text-primary shadow-sm"><CreditCard size={19} /></div>
              <strong className="mt-4 block pr-8 text-slate-900">{method.name}</strong>
              <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-400">{method.code} · {method.type.replaceAll("_", " ")}</p>
              <dl className="mt-4 grid grid-cols-2 gap-3 text-xs">
                <div><dt className="text-slate-400">Rentang nominal</dt><dd className="mt-1 font-semibold text-slate-700">{method.minimumAmount ? idr.format(method.minimumAmount) : "Tanpa minimum"}{method.maximumAmount ? ` – ${idr.format(method.maximumAmount)}` : ""}</dd></div>
                <div><dt className="text-slate-400">Kedaluwarsa</dt><dd className="mt-1 font-semibold text-slate-700">{method.expiryMinutes} menit</dd></div>
              </dl>
              <div className="mt-4 flex flex-wrap gap-2"><StatusBadge status={method.isActive ? "AKTIF" : "NONAKTIF"} />{method.uniqueCodeEnabled && <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600">KODE UNIK</span>}</div>
            </label>
          );
        })}
      </div>
      <div className="mt-5 flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-sm text-slate-500">{selected.length} metode dipilih</p>
        <button className="admin-button admin-button-primary" disabled={!dirty || save.isPending || !selected.length} onClick={submit}><Save size={16} /> {save.isPending ? "Menyimpan…" : "Simpan metode"}</button>
      </div>
      <ConfirmActionDialog open={confirmRemoval} title="Lepaskan metode pembayaran?" description="Program sedang dipublikasikan. Metode yang dilepas tidak lagi tersedia untuk transaksi baru." confirmLabel="Simpan perubahan" pending={save.isPending} onClose={() => setConfirmRemoval(false)} onConfirm={() => save.mutate()} />
    </>
  );
}

const updateSchema = z.object({
  publishedAt: z.string().min(1, "Tanggal publikasi wajib diisi."),
  title: z.string().min(3, "Judul minimal 3 karakter."),
  excerpt: z.string().min(3, "Ringkasan minimal 3 karakter."),
  contentText: z.string().min(3, "Konten wajib diisi."),
  sortOrder: z.number().int().min(0),
});
type UpdateForm = z.infer<typeof updateSchema>;

export function CampaignUpdatesEditor({ campaignId }: { campaignId: string }) {
  const client = useQueryClient();
  const query = useQuery({ queryKey: ["admin", "campaign", campaignId, "updates"], queryFn: () => campaignsApi.updates(campaignId) });
  const [editing, setEditing] = useState<CampaignUpdate | "new">();
  const [deleting, setDeleting] = useState<CampaignUpdate>();
  const form = useForm<UpdateForm>({ resolver: zodResolver(updateSchema) });
  const open = (item: CampaignUpdate | "new") => {
    setEditing(item);
    form.reset(item === "new" ? { publishedAt: localDateTime(new Date().toISOString()), title: "", excerpt: "", contentText: "", sortOrder: query.data?.data.length ?? 0 } : { publishedAt: localDateTime(item.publishedAt), title: item.title, excerpt: item.excerpt, contentText: item.content.join("\n"), sortOrder: item.sortOrder });
  };
  const save = useMutation({
    mutationFn: (values: UpdateForm) => {
      const payload = { publishedAt: new Date(values.publishedAt).toISOString(), title: values.title, excerpt: values.excerpt, content: lines(values.contentText), sortOrder: values.sortOrder };
      return editing === "new" ? campaignsApi.createUpdate(campaignId, payload) : campaignsApi.updateUpdate(campaignId, editing!.id, payload);
    },
    onSuccess: async () => {
      setEditing(undefined);
      await invalidateCampaign(client, campaignId, "updates");
      toast.success("Berita program berhasil disimpan.");
    },
    onError: (error: Error) => toast.error(error.message),
  });
  const remove = useMutation({
    mutationFn: () => campaignsApi.deleteUpdate(campaignId, deleting!.id),
    onSuccess: async () => {
      setDeleting(undefined);
      await invalidateCampaign(client, campaignId, "updates");
      toast.success("Berita program dihapus.");
    },
    onError: (error: Error) => toast.error(error.message),
  });
  const reorder = useMutation({
    mutationFn: ({ index, direction }: { index: number; direction: -1 | 1 }) => {
      const ids = query.data!.data.map((item) => item.id);
      [ids[index], ids[index + direction]] = [ids[index + direction], ids[index]];
      return campaignsApi.reorderUpdates(campaignId, ids);
    },
    onSuccess: () => invalidateCampaign(client, campaignId, "updates"),
    onError: (error: Error) => toast.error(error.message),
  });
  if (query.isLoading) return <EditorSkeleton />;
  if (query.isError) return <ErrorState error={query.error} onRetry={() => query.refetch()} />;
  const items = query.data?.data ?? [];
  return (
    <>
      <SectionHeading icon={<FileText size={22} />} title="Berita Program" description="Kelola kabar perkembangan dan laporan penyaluran program." action={<button className="admin-button admin-button-primary" onClick={() => open("new")}><Plus size={16} /> Tambah berita</button>} />
      <p className="mb-5 flex gap-2 rounded-xl bg-blue-50 p-4 text-sm text-blue-800"><Info className="mt-0.5 shrink-0" size={16} /> Data tersimpan di API, tetapi section Berita Program pada website publik masih disembunyikan.</p>
      {!items.length ? <EmptyState title="Belum ada berita program" description="Tambahkan berita pertama untuk mendokumentasikan perkembangan program." /> : (
        <ol className="relative ml-3 border-l-2 border-primary/15 pl-7">
          {items.map((item, index) => (
            <li className="relative mb-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm last:mb-0" key={item.id}>
              <span className="absolute -left-[2.3rem] top-6 flex size-4 rounded-full border-4 border-white bg-primary shadow" />
              <div className="flex flex-col justify-between gap-4 sm:flex-row">
                <div>
                  <p className="flex items-center gap-2 text-xs font-semibold text-slate-500"><CalendarDays size={14} /> {formatDate(item.publishedAt)} · Urutan {item.sortOrder}</p>
                  <h3 className="mt-2 text-lg font-bold text-slate-900">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{item.excerpt}</p>
                  <p className="mt-3 text-xs text-slate-400">{item.content.length} paragraf</p>
                </div>
                <div className="flex shrink-0 items-start gap-1">
                  <button aria-label="Pindahkan ke atas" className="admin-icon-button" disabled={index === 0 || reorder.isPending} onClick={() => reorder.mutate({ index, direction: -1 })}><ArrowUp size={16} /></button>
                  <button aria-label="Pindahkan ke bawah" className="admin-icon-button" disabled={index === items.length - 1 || reorder.isPending} onClick={() => reorder.mutate({ index, direction: 1 })}><ArrowDown size={16} /></button>
                  <button aria-label="Edit berita" className="admin-icon-button" onClick={() => open(item)}><Edit3 size={16} /></button>
                  <button aria-label="Hapus berita" className="admin-icon-button text-red-600" onClick={() => setDeleting(item)}><Trash2 size={16} /></button>
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}
      <EditorDialog wide open={Boolean(editing)} title={editing === "new" ? "Tambah berita program" : "Edit berita program"} description="Konten dipisahkan menjadi satu paragraf per baris." onClose={() => setEditing(undefined)}>
        <form className="mt-5 grid gap-4 md:grid-cols-2" onSubmit={form.handleSubmit((values) => save.mutate(values))}>
          <label className="admin-field"><span>Tanggal publikasi</span><input type="datetime-local" {...form.register("publishedAt")} /><FieldError message={form.formState.errors.publishedAt?.message} /></label>
          <label className="admin-field"><span>Urutan</span><input type="number" {...form.register("sortOrder", { valueAsNumber: true })} /></label>
          <label className="admin-field md:col-span-2"><span>Judul</span><input {...form.register("title")} /><FieldError message={form.formState.errors.title?.message} /></label>
          <label className="admin-field md:col-span-2"><span>Ringkasan</span><textarea rows={3} {...form.register("excerpt")} /><FieldError message={form.formState.errors.excerpt?.message} /></label>
          <label className="admin-field md:col-span-2"><span>Konten</span><textarea rows={8} {...form.register("contentText")} /><FieldError message={form.formState.errors.contentText?.message} /></label>
          <div className="md:col-span-2"><DialogActions pending={save.isPending} onCancel={() => setEditing(undefined)} label="Simpan berita" /></div>
        </form>
      </EditorDialog>
      <ConfirmActionDialog open={Boolean(deleting)} title="Hapus berita program?" description={deleting?.title ?? ""} confirmLabel="Hapus berita" pending={remove.isPending} onClose={() => setDeleting(undefined)} onConfirm={() => remove.mutate()} />
    </>
  );
}

const baselineSchema = z.object({
  collectedAmount: z.number().int().min(0),
  collectedQuantity: z.number().int().min(0),
  paidDonationCount: z.number().int().min(0),
  reason: z.string().min(3, "Alasan perubahan minimal 3 karakter."),
});
type BaselineForm = z.infer<typeof baselineSchema>;

export function CampaignBaselineEditor({ campaignId }: { campaignId: string }) {
  const { admin } = useAdminSession();
  const client = useQueryClient();
  const query = useQuery({ queryKey: ["admin", "campaign", campaignId, "baseline"], queryFn: () => campaignsApi.baseline(campaignId) });
  const form = useForm<BaselineForm>({ resolver: zodResolver(baselineSchema), defaultValues: { collectedAmount: 0, collectedQuantity: 0, paidDonationCount: 0, reason: "" } });
  const values = useWatch({ control: form.control });
  const [confirm, setConfirm] = useState(false);
  useEffect(() => {
    const item = query.data?.data;
    form.reset({ collectedAmount: item?.collectedAmount ?? 0, collectedQuantity: item?.collectedQuantity ?? 0, paidDonationCount: item?.paidDonationCount ?? 0, reason: "" });
  }, [query.data, form]);
  const save = useMutation({
    mutationFn: (values: BaselineForm) => campaignsApi.saveBaseline(campaignId, values),
    onSuccess: async () => {
      setConfirm(false);
      await Promise.all([
        invalidateCampaign(client, campaignId, "baseline"),
        client.invalidateQueries({ queryKey: ["admin", "dashboard"] }),
        client.invalidateQueries({ queryKey: ["admin", "reports"] }),
      ]);
      toast.success("Statistik awal berhasil diperbarui.");
    },
    onError: (error: Error) => toast.error(error.message),
  });
  if (query.isLoading) return <EditorSkeleton />;
  if (query.isError) return <ErrorState error={query.error} onRetry={() => query.refetch()} />;
  const baseline = query.data?.data ?? { collectedAmount: 0, collectedQuantity: 0, paidDonationCount: 0 };
  const isSuper = admin.role === "SUPER_ADMIN";
  return (
    <>
      <SectionHeading icon={<ShieldCheck size={22} />} title="Statistik Awal" description="Rekam capaian historis sebelum transaksi digital mulai digunakan." action={!isSuper ? <span className="rounded-full bg-amber-100 px-3 py-1.5 text-xs font-bold text-amber-800">KHUSUS SUPER ADMIN</span> : undefined} />
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard icon={<Banknote />} label="Nominal historis" value={idr.format(baseline.collectedAmount)} />
        <MetricCard icon={<Package />} label="Kuantitas historis" value={integer.format(baseline.collectedQuantity)} />
        <MetricCard icon={<Hash />} label="Donasi lunas historis" value={integer.format(baseline.paidDonationCount)} />
      </div>
      <p className="mt-5 flex gap-2 rounded-xl bg-blue-50 p-4 text-sm leading-6 text-blue-800"><Info className="mt-0.5 shrink-0" size={17} /> Nilai baseline akan ditambahkan ke transaksi berstatus PAID untuk membentuk progres yang tampil pada website publik.</p>
      {isSuper ? (
        <form className="mt-5 rounded-2xl border border-slate-200 bg-slate-50/60 p-5" onSubmit={form.handleSubmit(() => setConfirm(true))}>
          <div className="grid gap-5 md:grid-cols-3">
            <label className="admin-field"><span>Nominal terkumpul</span><input type="number" {...form.register("collectedAmount", { valueAsNumber: true })} /></label>
            <label className="admin-field"><span>Kuantitas terkumpul</span><input type="number" {...form.register("collectedQuantity", { valueAsNumber: true })} /></label>
            <label className="admin-field"><span>Jumlah donasi lunas</span><input type="number" {...form.register("paidDonationCount", { valueAsNumber: true })} /></label>
            <label className="admin-field md:col-span-3"><span>Alasan perubahan</span><textarea rows={3} placeholder="Jelaskan sumber atau alasan penyesuaian statistik historis." {...form.register("reason")} /><FieldError message={form.formState.errors.reason?.message} /></label>
          </div>
          <div className="mt-5 flex justify-end"><button className="admin-button admin-button-primary" disabled={!form.formState.isDirty || save.isPending}><Save size={16} /> Simpan statistik awal</button></div>
        </form>
      ) : <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">Anda dapat melihat statistik awal, tetapi hanya Super Admin yang dapat mengubahnya.</div>}
      <ConfirmActionDialog open={confirm} title="Perbarui statistik awal?" description="Perubahan ini memengaruhi progres gabungan pada website publik dan akan dicatat di audit log." confirmLabel="Ya, simpan perubahan" pending={save.isPending} onClose={() => setConfirm(false)} onConfirm={() => save.mutate(form.getValues())}>
        <div className="mt-5 grid gap-3 rounded-xl bg-slate-50 p-4 text-sm">
          <ChangeRow label="Nominal" before={idr.format(baseline.collectedAmount)} after={idr.format(values.collectedAmount ?? 0)} />
          <ChangeRow label="Kuantitas" before={integer.format(baseline.collectedQuantity)} after={integer.format(values.collectedQuantity ?? 0)} />
          <ChangeRow label="Donasi lunas" before={integer.format(baseline.paidDonationCount)} after={integer.format(values.paidDonationCount ?? 0)} />
        </div>
      </ConfirmActionDialog>
    </>
  );
}

function MetricCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">{icon}</span><p className="mt-4 text-sm text-slate-500">{label}</p><strong className="mt-1 block text-xl text-slate-900">{value}</strong></div>;
}

function ChangeRow({ label, before, after }: { label: string; before: string; after: string }) {
  return <div className="grid grid-cols-[1fr_auto_auto] items-center gap-3"><span className="font-semibold text-slate-600">{label}</span><span className="text-slate-400 line-through">{before}</span><span className="font-bold text-primary">{after}</span></div>;
}

function EditorDialog({ open, title, description, onClose, children, wide = false }: { open: boolean; title: string; description: string; onClose: () => void; children: React.ReactNode; wide?: boolean }) {
  return (
    <Dialog.Root open={open} onOpenChange={(value) => !value && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[80] bg-slate-950/45 backdrop-blur-sm" />
        <Dialog.Content className={`fixed left-1/2 top-1/2 z-[81] max-h-[90vh] w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl ${wide ? "max-w-3xl" : "max-w-lg"}`}>
          <div className="flex items-start justify-between gap-4"><div><Dialog.Title className="text-lg font-bold text-slate-900">{title}</Dialog.Title><Dialog.Description className="mt-1 text-sm text-slate-500">{description}</Dialog.Description></div><Dialog.Close className="admin-icon-button"><X size={16} /></Dialog.Close></div>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function DialogActions({ pending, onCancel, label }: { pending: boolean; onCancel: () => void; label: string }) {
  return <div className="mt-6 flex justify-end gap-2"><button type="button" className="admin-button admin-button-secondary" onClick={onCancel}>Batal</button><button className="admin-button admin-button-primary" disabled={pending}><Save size={16} /> {pending ? "Menyimpan…" : label}</button></div>;
}

function optionPayload(item: CampaignDonationOption, sortOrder: number) {
  return { amount: item.amount, label: item.label, sortOrder, isActive: item.isActive };
}
function optionalNumber(value: string) {
  return value === "" ? null : Number(value);
}
function lines(value: string) {
  return value.split("\n").map((item) => item.trim()).filter(Boolean);
}
function localDateTime(value: string) {
  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}
function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "long", timeStyle: "short" }).format(new Date(value));
}
async function invalidateCampaign(client: ReturnType<typeof useQueryClient>, campaignId: string, tab: string) {
  await Promise.all([
    client.invalidateQueries({ queryKey: ["admin", "campaign", campaignId, tab] }),
    client.invalidateQueries({ queryKey: ["admin", "campaign", campaignId] }),
  ]);
}
