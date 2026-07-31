export type PublicArticle = {
  id: string; slug: string; title: string; excerpt: string; authorName: string;
  readTimeMinutes: number; coverImageUrl: string; coverImageAlt: string; coverImageCaption?: string | null;
  content: Array<{ type: "paragraph"|"heading"|"quote"|"image"; text?: string; level?: 2|3; attribution?: string; url?: string; alt?: string; caption?: string }>;
  publishedAt: string; updatedAt: string; category: { id: string; code: string; name: string };
  disbursedAmount?: number|null; beneficiaryCount?: number|null; beneficiaryUnit?: string|null;
  ctaTitle?: string|null; ctaDescription?: string|null; ctaStartingAmount?: number|null; ctaVerificationTime?: string|null; ctaButtonLabel?: string|null; ctaUrl?: string|null;
  seo?: { title:string; description:string; canonicalUrl:string; ogImageUrl:string };
  relatedArticles?: PublicArticle[];
};
export type PublicCategory={id:string;code:string;name:string};
const base=(process.env.BACKEND_API_URL||process.env.NEXT_PUBLIC_API_URL||"http://localhost:3000/api/v1").replace(/\/$/,"");
async function api<T>(path:string):Promise<T>{const r=await fetch(`${base}/${path}`,{cache:"no-store"});if(!r.ok)throw new Error(String(r.status));return (await r.json()).data}
export async function getArticles(params:{page?:number;limit?:number;category?:string}={}){const q=new URLSearchParams(Object.entries(params).filter(([,v])=>v!==undefined).map(([k,v])=>[k,String(v)]));const r=await fetch(`${base}/articles?${q}`,{cache:"no-store"});if(!r.ok)return {data:[] as PublicArticle[],meta:{page:1,limit:10,total:0,totalPages:0}};return r.json() as Promise<{data:PublicArticle[];meta:{page:number;limit:number;total:number;totalPages:number}}>}
export const getArticle=(slug:string)=>api<PublicArticle>(`articles/${slug}`);
export const getArticleCategories=()=>api<PublicCategory[]>("article-categories").catch(()=>[]);
export const formatArticleDate=(v:string)=>new Intl.DateTimeFormat("id-ID",{day:"2-digit",month:"short",year:"numeric"}).format(new Date(v));
