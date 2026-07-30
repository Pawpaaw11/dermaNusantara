"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Copy, ImagePlus, Trash2, UploadCloud } from "lucide-react";
import { FormEvent, useRef, useState } from "react";

import { mediaApi } from "@/lib/admin-api/resources";
import { ErrorState, PageHeader } from "./AdminUI";

export function MediaPage() {
  const client = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File>();
  const [clientError, setClientError] = useState<string>();
  const query = useQuery({ queryKey: ["admin", "media"], queryFn: () => mediaApi.list({ page: 1, limit: 50 }) });
  const upload = useMutation({
    mutationFn: () => {
      const body = new FormData();
      body.append("file", file!);
      return mediaApi.upload(body);
    },
    onSuccess: async () => {
      setFile(undefined);
      if (fileRef.current) fileRef.current.value = "";
      await client.invalidateQueries({ queryKey: ["admin", "media"] });
    },
  });
  const remove = useMutation({
    mutationFn: mediaApi.remove,
    onSuccess: () => client.invalidateQueries({ queryKey: ["admin", "media"] }),
  });
  const selectFile = (selected?: File) => {
    setClientError(undefined);
    if (!selected) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(selected.type)) return setClientError("Gunakan file JPEG, PNG, atau WebP.");
    if (selected.size > 5 * 1024 * 1024) return setClientError("Ukuran file maksimum 5 MB.");
    setFile(selected);
  };

  return (
    <section>
      <PageHeader title="Media" description="Kelola aset gambar program. Validasi akhir tetap dilakukan oleh server." />
      <form className="admin-card mb-6 flex flex-col items-center justify-center border-dashed p-8 text-center" onSubmit={(event: FormEvent) => { event.preventDefault(); if (file) upload.mutate(); }}>
        <UploadCloud className="mb-3 text-[var(--color-primary)]" size={34} />
        <h2 className="font-bold">Unggah media baru</h2>
        <p className="mb-4 text-sm text-slate-500">JPEG, PNG, WebP · maksimum 5 MB</p>
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => selectFile(event.target.files?.[0])} />
        {file && <p className="mt-3 text-sm font-medium">{file.name} · {(file.size / 1024 / 1024).toFixed(2)} MB</p>}
        {(clientError || upload.error?.message) && <p className="mt-3 text-sm text-red-600">{clientError ?? upload.error?.message}</p>}
        <button className="admin-button admin-button-primary mt-4" disabled={!file || upload.isPending}><ImagePlus size={16} /> {upload.isPending ? "Mengunggah…" : "Unggah"}</button>
      </form>
      {query.isError ? <ErrorState error={query.error} onRetry={() => query.refetch()} /> : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {(query.data?.data ?? []).map((asset) => (
            <article className="admin-card overflow-hidden" key={asset.id}>
              <div aria-label={asset.originalName ?? asset.fileName ?? asset.storedName} className="aspect-[4/3] bg-cover bg-center bg-slate-100" role="img" style={{ backgroundImage: `url("${asset.url.replaceAll('"', "%22")}")` }} />
              <div className="p-4">
                <p className="truncate font-semibold">{asset.originalName ?? asset.fileName ?? asset.storedName}</p>
                <p className="text-xs text-slate-500">{asset.mimeType} · {(asset.size / 1024).toFixed(0)} KB</p>
                <div className="mt-3 flex gap-2">
                  <button className="admin-icon-button" title="Salin URL" onClick={() => navigator.clipboard.writeText(asset.url)}><Copy size={16} /></button>
                  <button className="admin-icon-button text-red-600" title="Hapus" disabled={remove.isPending} onClick={() => confirm("Hapus media ini?") && remove.mutate(asset.id)}><Trash2 size={16} /></button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
