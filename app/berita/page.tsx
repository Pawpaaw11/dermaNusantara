import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CalendarDays, Clock3, FileText } from "lucide-react";
import { Footer } from "@/components/Footer";
import { SiteHeader } from "@/components/SiteHeader";
import { articles } from "@/data/landing-page";

export const metadata: Metadata = {
  title: "Berita & Artikel | Derma Nusantara",
  description:
    "Kumpulan berita, laporan, dan cerita inspiratif dari program Derma Nusantara.",
};

const categories = ["Semua", "Kegiatan", "Inspirasi", "Laporan"];
const featuredArticle = articles[0];
const articleList = articles.slice(1);

function getCategoryClass(category: string) {
  if (category === "Kegiatan") {
    return "bg-tertiary-container text-on-tertiary-container";
  }

  if (category === "Laporan") {
    return "bg-primary text-on-primary";
  }

  return "bg-secondary text-on-secondary";
}

export default function NewsListPage() {
  return (
    <>
      <SiteHeader />
      <main className="w-full bg-background">
        <section className="mx-auto max-w-container-max px-margin-mobile pb-16 pt-24 md:px-margin-desktop md:pb-24 md:pt-28">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <p className="mb-3 font-label-md text-label-md text-secondary">
              Ruang Kabar Kebaikan
            </p>
            <h1 className="font-display-lg-mobile text-display-lg-mobile text-primary md:font-display-lg md:text-display-lg">
              Berita & Artikel
            </h1>
            <p className="mt-4 font-body-lg text-body-lg text-on-surface-variant">
              Ikuti perkembangan aktivitas, laporan transparansi, dan cerita
              inspiratif dari lapangan.
            </p>
          </div>

          <Link
            className="group grid grid-cols-1 gap-gutter rounded-lg bg-surface-container-lowest p-5 ambient-shadow transition-transform duration-300 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary md:grid-cols-12 md:p-6"
            href={`/berita/${featuredArticle.slug}`}
          >
            <div className="relative h-[320px] overflow-hidden rounded-lg md:col-span-7 md:h-[450px]">
              {featuredArticle.image ? (
                <Image
                  alt={featuredArticle.image.alt}
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  fill
                  priority
                  sizes="(min-width: 768px) 58vw, 100vw"
                  src={featuredArticle.image.src}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-primary-container">
                  <FileText
                    aria-hidden
                    className="text-on-primary"
                    size={64}
                  />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-primary/85 via-primary/25 to-transparent" />
              <div className="absolute bottom-0 left-0 w-full p-6 md:p-8">
                <span
                  className={`mb-3 inline-block rounded-full px-3 py-1 font-label-sm text-label-sm ${getCategoryClass(
                    featuredArticle.category,
                  )}`}
                >
                  Laporan Utama
                </span>
                <h2 className="mb-3 max-w-2xl font-headline-sm text-headline-sm text-surface-container-lowest md:font-headline-md md:text-headline-md">
                  {featuredArticle.title}
                </h2>
                <div className="flex items-center gap-2 font-label-sm text-label-sm text-surface-container-low">
                  <CalendarDays aria-hidden size={16} />
                  <span>{featuredArticle.date}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-center p-2 md:col-span-5 md:p-8">
              <h3 className="font-headline-sm text-headline-sm text-primary">
                Membawa Harapan ke Desa Terpencil
              </h3>
              <p className="mt-4 line-clamp-5 font-body-md text-body-md text-on-surface-variant">
                {featuredArticle.excerpt}
              </p>
            </div>
          </Link>
        </section>

        <section
          className="bg-surface px-margin-mobile py-section-gap md:px-margin-desktop"
          id="artikel"
        >
          <div className="mx-auto max-w-container-max">
            <div className="mb-12 flex flex-wrap justify-center gap-3">
              {categories.map((category, index) => (
                <button
                  className={`rounded-full px-6 py-2 font-label-md text-label-md transition-colors ${
                    index === 0
                      ? "bg-primary text-on-primary"
                      : "bg-surface-container-highest text-on-surface-variant hover:bg-primary hover:text-on-primary"
                  }`}
                  key={category}
                  type="button"
                >
                  {category}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {articleList.map((article) => (
                <Link
                  className="group flex flex-col overflow-hidden rounded-lg bg-surface-container-lowest ambient-shadow transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(26,35,126,0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  href={`/berita/${article.slug}`}
                  key={article.title}
                >
                  <div className="relative h-56 overflow-hidden">
                    {article.image ? (
                      <Image
                        alt={article.image.alt}
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        fill
                        sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                        src={article.image.src}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-primary-container">
                        <FileText
                          aria-hidden
                          className="text-on-primary"
                          size={56}
                        />
                      </div>
                    )}
                    <span
                      className={`absolute left-4 top-4 rounded-full px-3 py-1 font-label-sm text-label-sm ${getCategoryClass(
                        article.category,
                      )}`}
                    >
                      {article.category}
                    </span>
                  </div>

                  <div className="flex flex-grow flex-col p-6">
                    <div className="mb-3 flex items-center gap-2 font-label-sm text-label-sm text-on-surface-variant">
                      <Clock3 aria-hidden size={16} />
                      <span>{article.date}</span>
                    </div>
                    <h3 className="mb-3 line-clamp-2 font-headline-sm text-headline-sm text-on-background transition-colors group-hover:text-primary">
                      {article.title}
                    </h3>
                    <p className="line-clamp-3 flex-grow font-body-md text-body-md text-on-surface-variant">
                      {article.excerpt}
                    </p>
                  </div>
                </Link>
              ))}
            </div>

            <div className="mt-16 text-center">
              <button
                className="rounded-full border-2 border-outline-variant bg-surface-container-lowest px-8 py-3 font-label-md text-label-md text-primary transition-colors duration-300 hover:border-primary hover:bg-surface-container-low"
                type="button"
              >
                Muat Lebih Banyak
              </button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
