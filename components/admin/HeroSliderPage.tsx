"use client";
/* eslint-disable react-hooks/set-state-in-effect, @next/next/no-img-element */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, Pencil, Plus, Save, Trash2, X } from "lucide-react";
import { FormEvent, useEffect, useRef, useState } from "react";
import { heroSlidesApi } from "@/lib/admin-api/resources";
import type { HeroSlide } from "@/lib/admin-api/types";
import { EmptyState, ErrorState, PageHeader, StatusBadge } from "./AdminUI";
import { ImageUploadField } from "./ImageUploadField";

const blank={desktopImageUrl:"",desktopImageAlt:"",mobileImageUrl:"",mobileImageAlt:"",linkUrl:"",isActive:true};
type Form=typeof blank;

export function HeroSliderPage(){
 const qc=useQueryClient(), query=useQuery({queryKey:["admin","hero-slides"],queryFn:heroSlidesApi.list});
 const editorRef=useRef<HTMLFormElement>(null);
 const [ordered,setOrdered]=useState<HeroSlide[]>([]),[editing,setEditing]=useState<HeroSlide|"new">(),[form,setForm]=useState<Form>(blank),[message,setMessage]=useState<string>();
 useEffect(()=>{if(query.data?.data)setOrdered(query.data.data)},[query.data]);
 useEffect(()=>{if(!editing)return;const frame=requestAnimationFrame(()=>editorRef.current?.scrollIntoView({behavior:"smooth",block:"start"}));return()=>cancelAnimationFrame(frame)},[editing]);
 function invalidate(){return qc.invalidateQueries({queryKey:["admin","hero-slides"]})}
 const save=useMutation({mutationFn:()=>editing==="new"?heroSlidesApi.create(form):heroSlidesApi.update(editing!.id,{...form,expectedUpdatedAt:editing!.updatedAt}),onSuccess:async()=>{setEditing(undefined);setMessage("Slider berhasil disimpan.");await invalidate()}});
 const reorder=useMutation({mutationFn:()=>heroSlidesApi.reorder(ordered.map(item=>item.id)),onSuccess:async()=>{setMessage("Urutan homepage berhasil disimpan.");await invalidate()}});
 const toggle=useMutation({mutationFn:(item:HeroSlide)=>heroSlidesApi.toggle(item.id,!item.isActive),onSuccess:invalidate});
 const remove=useMutation({mutationFn:heroSlidesApi.remove,onSuccess:async()=>{setMessage("Slider dihapus permanen.");await invalidate()}});
 function open(item?:HeroSlide){setMessage(undefined);save.reset();setEditing(item??"new");setForm(item?{desktopImageUrl:item.desktopImageUrl,desktopImageAlt:item.desktopImageAlt,mobileImageUrl:item.mobileImageUrl??"",mobileImageAlt:item.mobileImageAlt??"",linkUrl:item.linkUrl??"",isActive:item.isActive}:{...blank})}
 function move(index:number,delta:number){const target=index+delta;if(target<0||target>=ordered.length)return;setOrdered(current=>{const copy=[...current];[copy[index],copy[target]]=[copy[target],copy[index]];return copy})}
 function submit(e:FormEvent){e.preventDefault();setMessage(undefined);save.mutate()}
 function hardDelete(item:HeroSlide){if(prompt(`Ketik HAPUS untuk menghapus slider urutan ${item.sortOrder+1} secara permanen.`)==="HAPUS")remove.mutate(item.id)}
 const error=save.error?.message||reorder.error?.message||toggle.error?.message||remove.error?.message;
 return <section><PageHeader title="Hero Slider" description="Atur banner utama homepage, urutan, status, serta gambar desktop dan mobile." action={<button className="admin-button admin-button-primary" onClick={()=>open()}><Plus size={17}/>Tambah slider</button>}/>
  {message&&<p className="mb-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</p>}{error&&<ErrorState message={error}/>} 
  {editing&&<form key={editing==="new"?"new":editing.id} ref={editorRef} id="hero-slider-editor" onSubmit={submit} className="mb-6 scroll-mt-28 space-y-5 rounded-2xl border border-primary/30 bg-white p-5 shadow-sm"><div className="flex items-center justify-between gap-4"><div><h2 className="font-bold text-primary">{editing==="new"?"Tambah hero slider":`Edit slider urutan ${ordered.findIndex(item=>item.id===editing.id)+1}`}</h2><p className="text-sm text-slate-500">Gambar mobile bersifat opsional dan otomatis memakai gambar desktop jika kosong.</p></div><button type="button" className="admin-button shrink-0" onClick={()=>setEditing(undefined)}><X size={16}/>Tutup</button></div>
   <ImageUploadField title="Gambar desktop" pickerLabel="Pilih gambar desktop" previewLabel="Preview desktop" url={form.desktopImageUrl} alt={form.desktopImageAlt} onUrlChange={v=>setForm({...form,desktopImageUrl:v})} onAltChange={v=>setForm({...form,desktopImageAlt:v})}/>
   <ImageUploadField title="Gambar mobile (opsional)" pickerLabel="Pilih gambar mobile" previewLabel="Preview mobile" required={false} altRequired={false} url={form.mobileImageUrl} alt={form.mobileImageAlt} onUrlChange={v=>setForm({...form,mobileImageUrl:v})} onAltChange={v=>setForm({...form,mobileImageAlt:v})}/>
   <label className="admin-field"><span>Link tujuan (opsional)</span><input value={form.linkUrl} placeholder="/program atau https://contoh.com" onChange={e=>setForm({...form,linkUrl:e.target.value})}/><small className="font-normal text-slate-500">Isi path internal yang diawali / atau URL http(s).</small></label>
   <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={form.isActive} onChange={e=>setForm({...form,isActive:e.target.checked})}/>Langsung aktif di homepage</label>
   <div className="flex flex-wrap gap-2"><button disabled={save.isPending} className="admin-button admin-button-primary"><Save size={17}/>{save.isPending?"Menyimpan…":"Simpan perubahan"}</button><button type="button" className="admin-button admin-button-secondary" onClick={()=>setEditing(undefined)}>Batal</button></div>
  </form>}
  <div className="mb-4 flex justify-end"><button disabled={reorder.isPending||ordered.length<2} className="admin-button admin-button-primary" onClick={()=>reorder.mutate()}><Save size={17}/>{reorder.isPending?"Menyimpan…":"Simpan urutan"}</button></div>
  {query.isError?<ErrorState message={query.error.message}/>:ordered.length===0?<EmptyState title="Belum ada slider" description="Tambahkan banner pertama untuk homepage."/>:<div className="space-y-3">{ordered.map((item,index)=><article key={item.id} className={`grid items-center gap-4 rounded-2xl border bg-white p-4 transition-colors md:grid-cols-[96px_1fr_auto] ${editing!=="new"&&editing?.id===item.id?"border-primary ring-2 ring-primary/10":"border-slate-200"}`}><img src={item.desktopImageUrl} alt={item.desktopImageAlt} className="h-16 w-24 rounded-lg bg-slate-100 object-cover"/><div><div className="flex flex-wrap items-center gap-2"><b>Urutan {index+1}</b><StatusBadge status={item.isActive?"ACTIVE":"INACTIVE"}/></div><p className="mt-1 text-sm text-slate-600">{item.desktopImageAlt}</p><p className="mt-1 break-all text-xs text-slate-400">{item.linkUrl||"Tanpa link tujuan"}</p></div><div className="flex flex-wrap gap-2"><button aria-label="Naikkan urutan" disabled={index===0} className="admin-button" onClick={()=>move(index,-1)}><ArrowUp size={16}/></button><button aria-label="Turunkan urutan" disabled={index===ordered.length-1} className="admin-button" onClick={()=>move(index,1)}><ArrowDown size={16}/></button><button aria-expanded={editing!=="new"&&editing?.id===item.id} aria-controls="hero-slider-editor" className="admin-button" onClick={()=>open(item)}><Pencil size={16}/>Edit</button><button className="admin-button" onClick={()=>toggle.mutate(item)}>{item.isActive?"Nonaktifkan":"Aktifkan"}</button><button className="admin-button text-red-600" onClick={()=>hardDelete(item)}><Trash2 size={16}/>Hapus</button></div></article>)}</div>}
 </section>
}
