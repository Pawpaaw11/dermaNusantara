export const SITE_NAME = "Derma Nusantara";
export const SITE_DESCRIPTION = "Platform donasi dan gerakan kebaikan untuk mendukung pendidikan, pangan, wakaf Al-Quran, dan program sosial yang transparan di seluruh Indonesia.";

const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
export const SITE_URL = (configuredSiteUrl || "https://dermanusantara.my.id").replace(/\/$/, "");
export const DEFAULT_OG_IMAGE = "/images/hero/1.webp";

export function absoluteUrl(path = "/") {
  return new URL(path, `${SITE_URL}/`).toString();
}

export function safeJsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
