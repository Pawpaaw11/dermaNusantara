"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { Edit3, Plus, Search, Trash2, X } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { DataTable, ErrorBlock, LoadingBlock, PageHeader, StatusBadge } from "./AdminUI";
import type { ListParams } from "@/lib/admin-api/types";

type Field = {
  key: string;
  label: string;
  type?: "text" | "number" | "textarea" | "boolean" | "select";
  options?: Array<{ label: string; value: string }>;
  required?: boolean;
};

type Api<T> = {
  list: (params?: ListParams) => Promise<{ data: T[]; meta?: { total: number } }>;
  create?: (input: unknown) => Promise<unknown>;
  update?: (id: string, input: unknown) => Promise<unknown>;
  remove?: (id: string) => Promise<unknown>;
};

export function ResourcePage<T extends Record<string, unknown>>({
  title,
  description,
  queryKey,
  api,
  fields,
  display,
  canMutate = true,
}: {
  title: string;
  description: string;
  queryKey: string;
  api: Api<T>;
  fields: Field[];
  display: Array<{ key: string; label: string; render?: (row: T) => React.ReactNode }>;
  canMutate?: boolean;
}) {
  const client = useQueryClient();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<T | null>(null);
  const [form, setForm] = useState<Record<string, unknown>>({});
  const query = useQuery({
    queryKey: ["admin", queryKey, search],
    queryFn: () => api.list({ page: 1, limit: 100, search }),
  });
  const mutation = useMutation({
    mutationFn: async () => {
      const id = String(editing?.id ?? "");
      return editing && api.update ? api.update(id, form) : api.create?.(form);
    },
    onSuccess: () => {
      toast.success(editing ? "Perubahan disimpan." : "Data berhasil dibuat.");
      setOpen(false);
      setEditing(null);
      setForm({});
      client.invalidateQueries({ queryKey: ["admin", queryKey] });
    },
    onError: (error: Error) => toast.error(error.message),
  });
  const remove = useMutation({
    mutationFn: (id: string) =>
      api.remove
        ? api.remove(id)
        : Promise.reject(new Error("Aksi hapus tidak tersedia.")),
    onSuccess: () => {
      toast.success("Data berhasil dihapus.");
      client.invalidateQueries({ queryKey: ["admin", queryKey] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const columns = useMemo<ColumnDef<T>[]>(
    () => [
      ...display.map((item) => ({
        id: item.key,
        header: item.label,
        cell: ({ row }: { row: { original: T } }) =>
          item.render
            ? item.render(row.original)
            : formatCell(row.original[item.key]),
      })),
      ...(canMutate
        ? [
            {
              id: "actions",
              header: "",
              cell: ({ row }: { row: { original: T } }) => (
                <div className="flex justify-end gap-1">
                  {api.update ? (
                    <button
                      aria-label="Edit"
                      className="rounded-lg p-2 text-primary hover:bg-primary-fixed"
                      onClick={() => {
                        setEditing(row.original);
                        setForm(
                          Object.fromEntries(
                            fields.map((field) => [
                              field.key,
                              row.original[field.key] ?? "",
                            ]),
                          ),
                        );
                        setOpen(true);
                      }}
                    >
                      <Edit3 size={16} />
                    </button>
                  ) : null}
                  {api.remove ? (
                    <button
                      aria-label="Hapus"
                      className="rounded-lg p-2 text-error hover:bg-error-container"
                      onClick={() => {
                        if (window.confirm("Hapus data ini?")) {
                          remove.mutate(String(row.original.id));
                        }
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  ) : null}
                </div>
              ),
            } as ColumnDef<T>,
          ]
        : []),
    ],
    [api, canMutate, display, fields, remove],
  );

  return (
    <>
      <PageHeader
        description={description}
        title={title}
        action={
          canMutate && api.create ? (
            <button
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white"
              onClick={() => {
                setEditing(null);
                setForm({});
                setOpen(true);
              }}
            >
              <Plus size={17} />
              Tambah Data
            </button>
          ) : null
        }
      />
      <div className="mb-4 flex max-w-md items-center gap-2 rounded-xl border border-outline-variant bg-white px-4">
        <Search className="text-outline" size={17} />
        <input
          className="w-full border-0 bg-transparent px-0 py-3 text-sm focus:ring-0"
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Cari data..."
          value={search}
        />
      </div>
      {query.isPending ? <LoadingBlock /> : null}
      {query.isError ? (
        <ErrorBlock message={(query.error as Error).message} retry={() => query.refetch()} />
      ) : null}
      {query.data ? <DataTable columns={columns} data={query.data.data} /> : null}

      <Dialog.Root onOpenChange={setOpen} open={open}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-[90] bg-black/45 backdrop-blur-sm" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-[100] max-h-[90vh] w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl outline-none">
            <div className="flex items-center justify-between">
              <Dialog.Title className="font-headline-sm text-xl text-primary">
                {editing ? `Edit ${title}` : `Tambah ${title}`}
              </Dialog.Title>
              <Dialog.Close className="rounded-lg p-2 hover:bg-surface-container"><X size={18} /></Dialog.Close>
            </div>
            <div className="mt-6 space-y-4">
              {fields.map((field) => (
                <label className="block" key={field.key}>
                  <span className="mb-2 block text-sm font-bold">{field.label}</span>
                  {field.type === "textarea" ? (
                    <textarea className="min-h-28 w-full rounded-xl border-outline-variant" onChange={(e) => setForm((v) => ({ ...v, [field.key]: e.target.value }))} required={field.required} value={String(form[field.key] ?? "")} />
                  ) : field.type === "boolean" ? (
                    <input checked={Boolean(form[field.key])} className="size-5 rounded border-outline-variant text-primary" onChange={(e) => setForm((v) => ({ ...v, [field.key]: e.target.checked }))} type="checkbox" />
                  ) : field.type === "select" ? (
                    <select className="w-full rounded-xl border-outline-variant" onChange={(e) => setForm((v) => ({ ...v, [field.key]: e.target.value }))} required={field.required} value={String(form[field.key] ?? "")}>
                      <option value="">Pilih...</option>
                      {field.options?.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                    </select>
                  ) : (
                    <input className="w-full rounded-xl border-outline-variant" onChange={(e) => setForm((v) => ({ ...v, [field.key]: field.type === "number" ? Number(e.target.value) : e.target.value }))} required={field.required} type={field.type ?? "text"} value={String(form[field.key] ?? "")} />
                  )}
                </label>
              ))}
            </div>
            <button className="mt-6 w-full rounded-xl bg-primary px-5 py-3 font-bold text-white disabled:bg-outline" disabled={mutation.isPending} onClick={() => mutation.mutate()}>
              {mutation.isPending ? "Menyimpan..." : "Simpan"}
            </button>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}

function formatCell(value: unknown) {
  if (typeof value === "boolean") return <StatusBadge status={value ? "AKTIF" : "NONAKTIF"} />;
  if (value && typeof value === "object") return JSON.stringify(value);
  return String(value ?? "-");
}
