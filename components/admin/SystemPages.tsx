"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowLeft, Eye, Save } from "lucide-react";
import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";

import { auditApi, settingsApi } from "@/lib/admin-api/resources";
import { authApi } from "@/lib/admin-api/auth";
import { useAdminSession } from "./AdminSession";
import { DataTable, ErrorState, PageHeader } from "./AdminUI";

type Row = Record<string, unknown>;

export function SettingsPage() {
  const [values, setValues] = useState<Record<string, unknown>>({});
  const [saved, setSaved] = useState(false);
  const query = useQuery({ queryKey: ["admin", "settings"], queryFn: settingsApi.get });
  useEffect(() => {
    if (query.data?.data) {
      // Hydrate a local draft so dirty form edits do not mutate the query cache.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setValues(query.data.data);
    }
  }, [query.data]);
  const mutation = useMutation({ mutationFn: () => settingsApi.update(values), onSuccess: () => setSaved(true) });
  const fields = [
    ["organizationName", "Nama organisasi"],
    ["organizationIdentity", "Identitas organisasi"],
    ["adminWhatsapp", "WhatsApp admin"],
    ["anonymousDonorLabel", "Label donor anonim"],
    ["confirmationMessageTemplate", "Template konfirmasi"],
    ["defaultExpiryMinutes", "Default expiry (menit)"],
    ["uniqueCodeMinimum", "Kode unik minimum"],
    ["uniqueCodeMaximum", "Kode unik maksimum"],
    ["timezone", "Zona waktu"],
  ];
  return (
    <section>
      <PageHeader title="Pengaturan" description="Konfigurasi operasional yang diizinkan backend melalui schema allowlist." />
      {query.isError ? <ErrorState error={query.error} onRetry={() => query.refetch()} /> : (
        <form className="admin-card space-y-5 p-6" onSubmit={(event) => { event.preventDefault(); setSaved(false); mutation.mutate(); }}>
          {fields.map(([key, label]) => <label className="admin-field" key={key}><span>{label}</span>{key.includes("Template") || key.includes("template") ? <textarea rows={4} value={String(values[key] ?? "")} onChange={(event) => setValues({ ...values, [key]: event.target.value })} /> : <input value={String(values[key] ?? "")} onChange={(event) => setValues({ ...values, [key]: event.target.value })} />}</label>)}
          {mutation.isError && <ErrorState error={mutation.error} />}
          {saved && <p className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">Pengaturan berhasil disimpan.</p>}
          <div className="sticky bottom-4 flex justify-end rounded-xl border border-slate-200 bg-white/95 p-3 shadow-lg"><button className="admin-button admin-button-primary" disabled={mutation.isPending}><Save size={16} /> Simpan pengaturan</button></div>
        </form>
      )}
    </section>
  );
}

export function AuditListPage() {
  const query = useQuery({ queryKey: ["admin", "audit"], queryFn: () => auditApi.list({ page: 1, limit: 20, sortBy: "createdAt", sortOrder: "desc" }) });
  const columns = useMemo<ColumnDef<Row>[]>(() => [
    { accessorKey: "createdAt", header: "Waktu", cell: ({ getValue }) => new Date(String(getValue())).toLocaleString("id-ID") },
    { accessorKey: "actor.name", header: "Actor", cell: ({ row }) => String((row.original.actor as Row | undefined)?.name ?? row.original.actorName ?? "Sistem") },
    { accessorKey: "action", header: "Action" },
    { accessorKey: "entityType", header: "Entity" },
    { accessorKey: "requestId", header: "Request ID" },
    { id: "action", header: "", cell: ({ row }) => <Link className="admin-icon-button" href={`/admin/sistem/audit-log/${String(row.original.id)}`}><Eye size={16} /></Link> },
  ], []);
  return <section><PageHeader title="Audit Log" description="Catatan append-only seluruh mutasi administratif." />{query.isError ? <ErrorState error={query.error} onRetry={() => query.refetch()} /> : <DataTable columns={columns} data={query.data?.data ?? []} loading={query.isLoading} />}</section>;
}

export function AuditDetailPage({ id }: { id: string }) {
  const query = useQuery({ queryKey: ["admin", "audit", id], queryFn: () => auditApi.get(id) });
  return <section><PageHeader title="Detail Audit Log" description="Before/after payload ditampilkan read-only." actions={<Link className="admin-button admin-button-secondary" href="/admin/sistem/audit-log"><ArrowLeft size={16} /> Kembali</Link>} />{query.isError ? <ErrorState error={query.error} onRetry={() => query.refetch()} /> : <pre className="admin-card max-h-[720px] overflow-auto bg-slate-950 p-5 text-xs leading-6 text-slate-100">{JSON.stringify(query.data?.data, null, 2)}</pre>}</section>;
}

export function ProfilePage() {
  const { admin } = useAdminSession();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const mutation = useMutation({
    mutationFn: () => authApi.changePassword({ currentPassword, newPassword }),
    onSuccess: () => window.location.assign("/admin/login"),
  });
  return (
    <section>
      <PageHeader title="Profil Admin" description="Informasi akun dan keamanan session Anda." />
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="admin-card p-6"><h2 className="font-bold">Profil</h2><dl className="mt-5 space-y-3 text-sm"><div><dt className="text-slate-500">Nama</dt><dd className="font-semibold">{admin.name}</dd></div><div><dt className="text-slate-500">Email</dt><dd className="font-semibold">{admin.email}</dd></div><div><dt className="text-slate-500">Role</dt><dd className="font-semibold">{admin.role}</dd></div></dl></div>
        <form className="admin-card space-y-4 p-6" onSubmit={(event: FormEvent) => { event.preventDefault(); mutation.mutate(); }}><h2 className="font-bold">Ubah Password</h2><label className="admin-field"><span>Password saat ini</span><input type="password" required value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} /></label><label className="admin-field"><span>Password baru</span><input type="password" minLength={12} required value={newPassword} onChange={(event) => setNewPassword(event.target.value)} /></label>{mutation.isError && <p className="text-sm text-red-600">{mutation.error.message}</p>}<button className="admin-button admin-button-primary" disabled={mutation.isPending}>Ubah password</button></form>
      </div>
    </section>
  );
}
