import { getHeroSlides } from "@/lib/api/hero-slides";
import { HeroCarousel } from "./HeroCarousel";

export async function HeroSection(){
 const slides=await getHeroSlides();
 if(slides.length===0)return null;
 return <section aria-label="Sorotan kampanye Derma Nusantara" className="relative -mt-[76px] w-full bg-background px-2 pb-0 pt-0 md:px-0"><h1 className="sr-only">Platform Donasi Transparan untuk Kebaikan di Seluruh Indonesia</h1><HeroCarousel slides={slides}/></section>
}
