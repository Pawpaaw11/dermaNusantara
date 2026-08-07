"use client";
/* eslint-disable @next/next/no-img-element, react-hooks/set-state-in-effect */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, CircleUserRound, Pencil, Plus, Save, Trash2, X } from "lucide-react";
import { FormEvent, useEffect, useRef, useState } from "react";
import { testimonialsApi } from "@/lib/admin-api/resources";
import type { Testimonial } from "@/lib/admin-api/types";
import { EmptyState, ErrorState, PageHeader, StatusBadge } from "./AdminUI";
import { ImageUploadField } from "./ImageUploadField";

const blank = { name: "", role: "", quote: "", photoUrl: "", isActive: true };
type Form = typeof blank;

export function TestimonialsAdminPage() {
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ["admin", "testimonials"], queryFn: testimonialsApi.list });
  const editorRef = useRef<HTMLFormElement>(null);
  const [ordered, setOrdered] = useState<Testimonial[]>([]);
  const [editing, setEditing] = useState<Testimonial | "new">();
  const [form, setForm] = useState<Form>(blank);
  const [message, setMessage] = useState<string>();

  useEffect(() => { if (query.data?.data) setOrdered(query.data.data); }, [query.data]);
  useEffect(() => { if (!editing) return; const frame = requestAnimationFrame(() => editorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })); return () => cancelAnimationFrame(frame); }, [editing]);
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin", "testimonials"] });
  const save = useMutation({
    mutationFn: () => editing === "new" ? testimonialsApi.create(form) : testimonialsApi.update(editing!.id, { ...form, expectedUpdatedAt: editing!.updatedAt }),
    onSuccess: async () => { setEditing(undefined); setMessage("Testimoni berhasil disimpan."); await invalidate(); },
  });
  const reorder = useMutation({ mutationFn: () => testimonialsApi.reorder(ordered.map((item) => item.id)), onSuccess: async () => { setMessage("Urutan testimoni berhasil disimpan."); await invalidate(); } });
  const toggle = useMutation({ mutationFn: (item: Testimonial) => testimonialsApi.toggle(item.id, !item.isActive), onSuccess: invalidate });
  const remove = useMutation({ mutationFn: testimonialsApi.remove, onSuccess: async () => { setMessage("Testimoni dihapus permanen."); await invalidate(); } });

  function open(item?: Testimonial) {
    setMessage(undefined); save.reset(); setEditing(item ?? "new");
    setForm(item ? { name: item.name, role: item.role ?? "", quote: item.quote, photoUrl: item.photoUrl ?? "", isActive: item.isActive } : { ...blank });
  }
  function move(index: number, delta: number) { const target = index + delta; if (target < 0 || target >= ordered.length) return; setOrdered((current) => { const copy = [...current]; [copy[index], copy[target]] = [copy[target], copy[index]]; return copy; }); }
  function submit(event: FormEvent) { event.preventDefault(); setMessage(undefined); save.mutate(); }
  function hardDelete(item: Testimonial) { if (prompt(`Ketik HAPUS untuk menghapus testimoni ${item.name} secara permanen.`) === "HAPUS") remove.mutate(item.id); }
  const error = save.error?.message || reorder.error?.message || toggle.error?.message || remove.error?.message;

  return <section>
    <PageHeader title="Testimoni" description="Kelola suara donatur, foto, urutan, dan status penampilan di homepage." action={<button className="admin-button admin-button-primary" onClick={() => open()}><Plus size={17}/>Tambah testimoni</button>}/>
    {message && <p className="mb-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</p>}
    {error && <ErrorState message={error}/>} 
    {editing && <form key={editing === "new" ? "new" : editing.id} ref={editorRef} onSubmit={submit} className="mb-6 scroll-mt-28 space-y-5 rounded-2xl border border-primary/30 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4"><div><h2 className="font-bold text-primary">{editing === "new" ? "Tambah testimoni" : `Edit testimoni ${editing.name}`}</h2><p className="text-sm text-slate-500">Foto dan jabatan bersifat opsional.</p></div><button type="button" className="admin-button shrink-0" onClick={() => setEditing(undefined)}><X size={16}/>Tutup</button></div>
      <ImageUploadField title="Foto testimoni (opsional)" description="Jika kosong, homepage menampilkan ikon user abu-abu." pickerLabel="Pilih foto" previewLabel="Preview foto" urlLabel="URL foto" required={false} altRequired={false} showAlt={false} url={form.photoUrl} alt={form.name ? `Foto ${form.name}` : "Foto testimoni"} onUrlChange={(photoUrl) => setForm({ ...form, photoUrl })} onAltChange={() => undefined}/>
      <div className="grid gap-5 md:grid-cols-2">
        <label className="admin-field"><span>Nama <b className="text-red-600">*</b></span><input required maxLength={100} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })}/></label>
        <label className="admin-field"><span>Jabatan/Peran</span><input maxLength={100} placeholder="Contoh: Guru, Dosen, Founder" value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })}/><small className="font-normal text-slate-500">Jika kosong, ditampilkan sebagai Donatur.</small></label>
      </div>
      <label className="admin-field"><span>Isi testimoni <b className="text-red-600">*</b></span><textarea required rows={5} maxLength={220} value={form.quote} onChange={(event) => setForm({ ...form, quote: event.target.value })}/><small className={`text-right font-semibold ${form.quote.length >= 220 ? "text-red-600" : "text-slate-500"}`}>{form.quote.length}/220 karakter</small></label>
      <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={form.isActive} onChange={(event) => setForm({ ...form, isActive: event.target.checked })}/>Langsung aktif di homepage</label>
      <div className="flex flex-wrap gap-2"><button disabled={save.isPending || !form.name.trim() || !form.quote.trim()} className="admin-button admin-button-primary"><Save size={17}/>{save.isPending ? "Menyimpan…" : "Simpan testimoni"}</button><button type="button" className="admin-button admin-button-secondary" onClick={() => setEditing(undefined)}>Batal</button></div>
    </form>}
    <div className="mb-4 flex justify-end"><button disabled={reorder.isPending || ordered.length < 2} className="admin-button admin-button-primary" onClick={() => reorder.mutate()}><Save size={17}/>{reorder.isPending ? "Menyimpan…" : "Simpan urutan"}</button></div>
    {query.isError ? <ErrorState message={query.error.message}/> : ordered.length === 0 ? <EmptyState title="Belum ada testimoni" description="Tambahkan testimoni pertama untuk homepage."/> : <div className="space-y-3">{ordered.map((item, index) => <article key={item.id} className={`grid items-center gap-4 rounded-2xl border bg-white p-4 md:grid-cols-[64px_1fr_auto] ${editing !== "new" && editing?.id === item.id ? "border-primary ring-2 ring-primary/10" : "border-slate-200"}`}>
      {item.photoUrl ? <img src={item.photoUrl} alt={`Foto ${item.name}`} className="size-16 rounded-full bg-slate-100 object-cover"/> : <div className="flex size-16 items-center justify-center rounded-full bg-slate-100 text-slate-400"><CircleUserRound size={38}/></div>}
      <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><b>{item.name}</b><StatusBadge status={item.isActive ? "ACTIVE" : "INACTIVE"}/><span className="text-xs text-slate-400">Urutan {index + 1}</span></div><p className="mt-1 text-sm text-slate-500">{item.role?.trim() || "Donatur"}</p><p className="mt-2 line-clamp-2 text-sm text-slate-700">“{item.quote}”</p></div>
      <div className="flex flex-wrap gap-2"><button aria-label="Naikkan urutan" disabled={index === 0} className="admin-button" onClick={() => move(index, -1)}><ArrowUp size={16}/></button><button aria-label="Turunkan urutan" disabled={index === ordered.length - 1} className="admin-button" onClick={() => move(index, 1)}><ArrowDown size={16}/></button><button className="admin-button" onClick={() => open(item)}><Pencil size={16}/>Edit</button><button className="admin-button" onClick={() => toggle.mutate(item)}>{item.isActive ? "Nonaktifkan" : "Aktifkan"}</button><button className="admin-button text-red-600" onClick={() => hardDelete(item)}><Trash2 size={16}/>Hapus</button></div>
    </article>)}</div>}
  </section>;
}
