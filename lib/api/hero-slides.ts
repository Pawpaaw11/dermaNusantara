export type PublicHeroSlide={id:string;desktopImageUrl:string;desktopImageAlt:string;mobileImageUrl?:string|null;mobileImageAlt?:string|null;linkUrl?:string|null;sortOrder:number};
const base=(process.env.BACKEND_API_URL||process.env.NEXT_PUBLIC_API_URL||"http://localhost:3000/api/v1").replace(/\/$/,"");
export async function getHeroSlides():Promise<PublicHeroSlide[]>{try{const response=await fetch(`${base}/hero-slides`,{cache:"no-store"});if(!response.ok)return[];const body=await response.json() as {data?:PublicHeroSlide[]};return Array.isArray(body.data)?body.data:[]}catch{return[]}}
