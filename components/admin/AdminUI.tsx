"use client";

import { flexRender, getCoreRowModel, useReactTable, type ColumnDef } from "@tanstack/react-table";
import * as Dialog from "@radix-ui/react-dialog";
import { AlertTriangle, Inbox, LoaderCircle, RefreshCw, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  description,
  action,
  actions,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <h2 className="font-headline-md-mobile text-primary">{title}</h2>
        <p className="mt-1 max-w-2xl text-sm text-on-surface-variant">{description}</p>
      </div>
      {actions ?? action}
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const normalized = status.toUpperCase();
  const style =
    normalized.includes("PAID") || normalized.includes("VERIFIED") || normalized === "PUBLISHED"
      ? "bg-[#DDF4E7] text-[#17643A]"
      : normalized.includes("PENDING") || normalized.includes("REVIEW")
        ? "bg-tertiary-fixed text-on-tertiary-fixed-variant"
        : normalized.includes("REJECT") || normalized.includes("FAILED")
          ? "bg-error-container text-on-error-container"
          : "bg-surface-container-high text-on-surface-variant";
  return <span className={cn("inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold", style)}>{status.replaceAll("_", " ")}</span>;
}

export function DataTable<T>({
  data,
  columns,
  empty = "Belum ada data.",
  loading = false,
}: {
  data: T[];
  columns: ColumnDef<T>[];
  empty?: string;
  loading?: boolean;
}) {
  const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel() });
  return (
    <div className="overflow-hidden rounded-2xl border border-outline-variant/60 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="sticky top-0 bg-surface-container-low text-xs uppercase tracking-wide text-on-surface-variant">
            {table.getHeaderGroups().map((group) => (
              <tr key={group.id}>
                {group.headers.map((header) => (
                  <th className="px-5 py-4 font-bold" key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-outline-variant/40">
            {loading ? [1,2,3,4,5].map((row) => (
              <tr key={row}>{columns.map((_, cell) => <td className="px-5 py-4" key={cell}><div className="h-4 animate-pulse rounded bg-surface-container-high motion-reduce:animate-none" /></td>)}</tr>
            )) : table.getRowModel().rows.map((row) => (
              <tr className="transition-colors hover:bg-primary-fixed/20" key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td className="px-5 py-4 align-middle" key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!loading && !data.length ? <div className="flex flex-col items-center px-6 py-14 text-center text-on-surface-variant"><Inbox className="mb-3 text-outline" size={34} /><p>{empty}</p></div> : null}
    </div>
  );
}

export function LoadingBlock({ label = "Memuat data" }: { label?: string }) {
  return <div className="flex min-h-64 items-center justify-center rounded-2xl border border-outline-variant/50 bg-white" role="status"><LoaderCircle className="mr-3 animate-spin text-primary motion-reduce:animate-none" /><span>{label}</span></div>;
}

export function ErrorBlock({ message, retry }: { message: string; retry?: () => void }) {
  return <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-error/20 bg-error-container/30 p-8 text-center"><AlertTriangle className="text-error" /><p className="mt-3 font-semibold text-on-error-container">{message}</p>{retry ? <button className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-white" onClick={retry}><RefreshCw size={16} />Coba lagi</button> : null}</div>;
}

export function AdminPageSkeleton() {
  return <div className="animate-pulse space-y-6 motion-reduce:animate-none" role="status"><span className="sr-only">Memuat halaman admin</span><div className="h-14 w-72 rounded-xl bg-surface-container-high" /><div className="grid gap-4 md:grid-cols-4">{[1,2,3,4].map((x)=><div className="h-32 rounded-2xl bg-white" key={x} />)}</div><div className="h-96 rounded-2xl bg-white" /></div>;
}

export function ErrorState({ error, message, onRetry }: { error?: unknown; message?: string; onRetry?: () => void }) {
  const resolvedMessage = message ?? (error instanceof Error ? error.message : "Terjadi kesalahan saat memuat data.");
  return <ErrorBlock message={resolvedMessage} retry={onRetry} />;
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return <div className="rounded-2xl border border-dashed border-outline-variant bg-white p-10 text-center"><Inbox className="mx-auto mb-3 text-outline" /><h3 className="font-bold text-on-surface">{title}</h3><p className="mt-1 text-sm text-on-surface-variant">{description}</p></div>;
}

export function ConfirmActionDialog({
  open, title, description, confirmLabel, pending, onClose, onConfirm, children,
}: {
  open: boolean; title: string; description: string; confirmLabel: string; pending?: boolean;
  onClose: () => void; onConfirm: () => void; children?: React.ReactNode;
}) {
  return <Dialog.Root open={open} onOpenChange={(value) => !value && onClose()}><Dialog.Portal><Dialog.Overlay className="fixed inset-0 z-[80] bg-slate-950/45 backdrop-blur-sm" /><Dialog.Content className="fixed left-1/2 top-1/2 z-[81] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-2xl"><div className="flex items-start justify-between gap-4"><div><Dialog.Title className="text-lg font-bold">{title}</Dialog.Title><Dialog.Description className="mt-1 text-sm text-slate-500">{description}</Dialog.Description></div><Dialog.Close className="admin-icon-button"><X size={16} /></Dialog.Close></div>{children}<div className="mt-6 flex justify-end gap-2"><button className="admin-button admin-button-secondary" onClick={onClose}>Batal</button><button className="admin-button admin-button-primary" disabled={pending} onClick={onConfirm}>{pending ? "Memproses…" : confirmLabel}</button></div></Dialog.Content></Dialog.Portal></Dialog.Root>;
}
