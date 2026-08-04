import type { MetadataRoute } from "next";
import { getArticles } from "@/lib/api/articles";
import { getCampaignsForSitemap } from "@/lib/api/campaigns";
import { absoluteUrl } from "@/lib/seo";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), changeFrequency: "daily", priority: 1 },
    { url: absoluteUrl("/berita"), changeFrequency: "daily", priority: 0.8 },
    { url: absoluteUrl("/kebijakan-privasi"), changeFrequency: "yearly", priority: 0.3 },
    { url: absoluteUrl("/syarat-ketentuan"), changeFrequency: "yearly", priority: 0.3 },
    { url: absoluteUrl("/panduan-donasi"), changeFrequency: "monthly", priority: 0.5 },
  ];
  const [campaigns, firstArticles] = await Promise.all([
    getCampaignsForSitemap().catch(() => []),
    getArticles({ page: 1, limit: 50 }),
  ]);
  const articles = [...firstArticles.data];
  for (let page = 2; page <= firstArticles.meta.totalPages; page += 1) {
    const response = await getArticles({ page, limit: 50 });
    articles.push(...response.data);
  }
  return [
    ...staticEntries,
    ...campaigns.map((campaign) => ({ url: absoluteUrl(`/donasi/${campaign.slug}`), changeFrequency: "weekly" as const, priority: 0.8 })),
    ...articles.map((article) => ({ url: absoluteUrl(`/berita/${article.slug}`), lastModified: new Date(article.updatedAt), changeFrequency: "monthly" as const, priority: 0.7 })),
  ];
}
