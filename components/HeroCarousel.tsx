"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import type { PublicHeroSlide } from "@/lib/api/hero-slides";

const intervalMs=3000;
export function HeroCarousel({slides}:{slides:PublicHeroSlide[]}){
 const [active,setActive]=useState(0),[paused,setPaused]=useState(false);
 useEffect(()=>{if(active>=slides.length)setActive(0)},[active,slides.length]);
 useEffect(()=>{if(paused||slides.length<2||window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;const id=window.setInterval(()=>setActive(current=>(current+1)%slides.length),intervalMs);return()=>window.clearInterval(id)},[paused,slides.length]);
 const previous=()=>setActive(current=>current===0?slides.length-1:current-1),next=()=>setActive(current=>(current+1)%slides.length);
 return <div aria-roledescription="carousel" className="group relative aspect-video w-full overflow-hidden bg-surface-container-low md:aspect-auto md:h-[100svh] md:min-h-[540px]" onBlur={()=>setPaused(false)} onFocus={()=>setPaused(true)} onMouseEnter={()=>setPaused(true)} onMouseLeave={()=>setPaused(false)}>
  <div className="absolute inset-0">{slides.map((slide,index)=>{const picture=<picture className="block size-full"><source media="(max-width: 767px)" srcSet={slide.mobileImageUrl||slide.desktopImageUrl}/><img src={slide.desktopImageUrl} alt={slide.mobileImageAlt||slide.desktopImageAlt} className="block size-full object-contain object-center md:object-cover"/></picture>;return <div key={slide.id} aria-hidden={active!==index} className={`absolute inset-0 transition-opacity duration-700 ease-out ${active===index?"opacity-100":"pointer-events-none opacity-0"}`}>{slide.linkUrl?<a href={slide.linkUrl} tabIndex={active===index?0:-1} className="block size-full">{picture}</a>:picture}</div>})}</div>
  {slides.length>1&&<><button aria-label="Tampilkan banner sebelumnya" className="absolute left-1.5 top-1/2 inline-flex size-7 -translate-y-1/2 items-center justify-center rounded-full bg-surface/90 text-primary shadow-sm focus-visible:ring-2 focus-visible:ring-primary md:left-8 md:size-12" onClick={previous}><ChevronLeft aria-hidden className="size-4 md:size-6"/></button><button aria-label="Tampilkan banner berikutnya" className="absolute right-1.5 top-1/2 inline-flex size-7 -translate-y-1/2 items-center justify-center rounded-full bg-surface/90 text-primary shadow-sm focus-visible:ring-2 focus-visible:ring-primary md:right-8 md:size-12" onClick={next}><ChevronRight aria-hidden className="size-4 md:size-6"/></button><div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5 rounded-full bg-surface/90 px-2.5 py-1.5 shadow-sm md:bottom-5 md:gap-2 md:px-3 md:py-2">{slides.map((slide,index)=><button key={slide.id} aria-label={`Tampilkan banner ${index+1}`} aria-current={active===index} className={`h-2 rounded-full transition-all md:h-2.5 ${active===index?"w-6 bg-primary md:w-8":"w-2 bg-outline-variant md:w-2.5"}`} onClick={()=>setActive(index)}/>)}</div></>}
 </div>
}
