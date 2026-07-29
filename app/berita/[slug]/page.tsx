import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  CalendarDays,
  ChevronRight,
  FileText,
  HeartHandshake,
  UserRound,
} from "lucide-react";
import { Footer } from "@/components/Footer";
import { SiteHeader } from "@/components/SiteHeader";
import { articles } from "@/data/landing-page";

type ArticlePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

function getArticle(slug: string) {
  return articles.find((article) => article.slug === slug);
}

function getCategoryClass(category: string) {
  if (category === "Kegiatan") {
    return "bg-tertiary-container text-on-tertiary-container";
  }

  if (category === "Laporan") {
    return "bg-primary text-on-primary";
  }

  return "bg-secondary text-on-secondary";
}

export function generateStaticParams() {
  return articles.map((article) => ({
    slug: article.slug,
  }));
}

export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);

  if (!article) {
    return {
      title: "Berita Tidak Ditemukan | Derma Nusantara",
    };
  }

  return {
    title: `${article.title} | Derma Nusantara`,
    description: article.excerpt,
  };
}

export default async function ArticleDetailPage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = getArticle(slug);

  if (!article) {
    notFound();
  }

  const relatedArticles = articles
    .filter((item) => item.slug !== article.slug)
    .slice(0, 3);

  return (
    <>
      <SiteHeader />
      <main className="bg-background">
        <article className="mx-auto max-w-container-max px-margin-mobile py-section-gap md:px-margin-desktop">
          <div className="mx-auto max-w-3xl">
            <nav
              aria-label="Breadcrumb"
              className="mb-6 flex items-center gap-2 font-label-sm text-label-sm text-on-surface-variant"
            >
              <Link className="transition-colors hover:text-primary" href="/berita">
                Berita
              </Link>
              <ChevronRight aria-hidden size={16} />
              <span className="font-semibold text-primary">
                {article.category}
              </span>
            </nav>

            <h1 className="mb-6 font-display-lg-mobile text-display-lg-mobile text-primary md:font-display-lg md:text-display-lg">
              {article.title}
            </h1>

            <div className="mb-8 flex flex-wrap items-center gap-4 font-label-md text-label-md text-on-surface-variant">
              <div className="flex items-center gap-2">
                <CalendarDays aria-hidden size={20} />
                <span>{article.date}</span>
              </div>
              <span className="size-1 rounded-full bg-outline-variant" />
              <div className="flex items-center gap-2">
                <UserRound aria-hidden size={20} />
                <span>{article.author}</span>
              </div>
            </div>

            <figure className="mb-10">
              <div className="relative aspect-video w-full overflow-hidden rounded-lg ambient-shadow">
                {article.image ? (
                  <Image
                    alt={article.image.alt}
                    className="object-cover"
                    fill
                    priority
                    sizes="(min-width: 768px) 768px, 100vw"
                    src={article.image.src}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-primary-container">
                    <FileText
                      aria-hidden
                      className="text-on-primary"
                      size={72}
                    />
                  </div>
                )}
              </div>
              <figcaption className="mt-4 text-center font-label-sm text-label-sm text-on-surface-variant">
                {article.caption}
              </figcaption>
            </figure>

            <div className="space-y-6 font-body-lg text-body-lg text-on-surface">
              {article.content.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}

              <blockquote className="my-8 border-l-4 border-tertiary-container py-2 pl-6">
                <p className="font-headline-sm text-headline-sm italic text-primary">
                  &ldquo;{article.quote}&rdquo;
                </p>
              </blockquote>

              <div className="my-10 flex flex-col items-start justify-between gap-6 rounded-lg bg-surface-container p-6 ambient-shadow sm:flex-row sm:items-center">
                <div>
                  <h2 className="font-headline-sm text-headline-sm text-primary">
                    Transparansi Penyaluran
                  </h2>
                  <p className="mt-2 font-body-md text-body-md text-on-surface-variant">
                    Ringkasan dampak dari kegiatan dan dukungan yang tersalurkan.
                  </p>
                </div>
                <div className="grid w-full gap-4 sm:w-auto sm:grid-cols-2">
                  <div className="rounded-lg bg-surface-container-lowest p-4 text-center shadow-sm">
                    <p className="mb-1 font-label-sm text-label-sm uppercase text-on-surface-variant">
                      Dana Disalurkan
                    </p>
                    <p className="font-headline-sm text-headline-sm text-secondary">
                      Rp 25.000.000
                    </p>
                  </div>
                  <div className="rounded-lg bg-surface-container-lowest p-4 text-center shadow-sm">
                    <p className="mb-1 font-label-sm text-label-sm uppercase text-on-surface-variant">
                      Penerima Manfaat
                    </p>
                    <p className="font-headline-sm text-headline-sm text-tertiary">
                      500 KK
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative mt-12 overflow-hidden rounded-[32px] bg-primary-container p-7 ambient-shadow md:p-9">
              <div className="relative z-10 flex flex-col items-center gap-6 md:flex-row md:gap-8">
                <div className="flex-1">
                  <h2 className="mb-4 font-headline-md-mobile text-headline-md-mobile text-on-primary md:font-headline-sm md:text-headline-sm">
                    Terinspirasi untuk membantu lebih banyak?
                  </h2>
                  <p className="font-body-md text-body-md text-primary-fixed-dim">
                    Dukungan Anda bisa berubah menjadi paket pangan, buku
                    belajar, dan bantuan nyata untuk keluarga yang sedang
                    berjuang.
                  </p>
                </div>

                <div className="flex w-full flex-col gap-6 rounded-[24px] border border-white/20 bg-white/10 p-6 backdrop-blur-md md:w-72">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="mb-1 font-label-sm text-label-sm text-primary-fixed-dim">
                        Mulai dari
                      </p>
                      <p className="font-headline-sm text-headline-sm text-tertiary-fixed">
                        Rp 25.000
                      </p>
                    </div>
                    <div>
                      <p className="mb-1 font-label-sm text-label-sm text-primary-fixed-dim">
                        Verifikasi
                      </p>
                      <p className="font-headline-sm text-headline-sm text-tertiary-fixed">
                        24 jam
                      </p>
                    </div>
                  </div>

                  <Link
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-tertiary-container px-8 py-4 font-label-md text-label-md text-on-tertiary-container transition-all duration-300 hover:-translate-y-1 hover:bg-tertiary-fixed hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary ambient-shadow"
                    href="/#programs"
                  >
                    Donasi Sekarang
                    <HeartHandshake aria-hidden size={20} />
                  </Link>
                </div>
              </div>
              <div
                aria-hidden
                className="absolute -bottom-20 -right-20 size-64 rounded-full bg-secondary opacity-20 blur-3xl"
              />
            </div>
          </div>
        </article>

        <section className="bg-surface-container-low px-margin-mobile py-section-gap md:px-margin-desktop">
          <div className="mx-auto max-w-container-max">
            <div className="mb-10 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <h2 className="font-headline-md text-headline-md text-primary">
                Artikel Terkait
              </h2>
              <Link
                className="inline-flex items-center gap-2 font-label-md text-label-md text-secondary hover:underline"
                href="/berita"
              >
                Lihat Semua
                <ArrowRight aria-hidden size={18} />
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-gutter md:grid-cols-3">
              {relatedArticles.map((relatedArticle) => (
                <Link
                  className="group flex flex-col overflow-hidden rounded-lg bg-surface-container-lowest ambient-shadow transition-transform duration-300 hover:-translate-y-1"
                  href={`/berita/${relatedArticle.slug}`}
                  key={relatedArticle.slug}
                >
                  <div className="relative h-48 overflow-hidden">
                    {relatedArticle.image ? (
                      <Image
                        alt={relatedArticle.image.alt}
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        fill
                        sizes="(min-width: 768px) 33vw, 100vw"
                        src={relatedArticle.image.src}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-primary-container">
                        <FileText
                          aria-hidden
                          className="text-on-primary"
                          size={48}
                        />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <span
                      className={`mb-3 w-max rounded-full px-3 py-1 font-label-sm text-label-sm ${getCategoryClass(
                        relatedArticle.category,
                      )}`}
                    >
                      {relatedArticle.category}
                    </span>
                    <h3 className="mb-2 line-clamp-2 font-headline-sm text-headline-sm text-primary transition-colors group-hover:text-secondary">
                      {relatedArticle.title}
                    </h3>
                    <p className="mb-4 line-clamp-3 flex-1 font-body-md text-body-md text-on-surface-variant">
                      {relatedArticle.excerpt}
                    </p>
                    <span className="font-label-sm text-label-sm text-outline">
                      {relatedArticle.date}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
