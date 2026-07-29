import Image from "next/image";
import Link from "next/link";
import { FileText } from "lucide-react";
import { articles } from "@/data/landing-page";

export function NewsSection() {
  return (
    <section className="bg-background px-margin-mobile py-24 md:px-margin-desktop">
      <div className="mx-auto max-w-container-max">
        <div className="mb-16 space-y-4 text-center">
          <h2 className="font-headline-md text-headline-md text-primary">
            Berita & Artikel
          </h2>
          <p className="mx-auto max-w-2xl font-body-md text-body-md text-on-surface-variant">
            Ikuti terus perkembangan aktivitas dan cerita inspiratif dari
            lapangan.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-10 md:grid-cols-[repeat(3,minmax(0,21.75rem))] md:justify-center md:gap-12">
          {articles.slice(0, 3).map((article) => (
            <Link
              className="ambient-shadow hover-lift group mx-auto flex w-full max-w-[21.75rem] flex-col overflow-hidden rounded-[24px] bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              href={`/berita/${article.slug}`}
              key={article.title}
            >
              <div className="relative h-48 overflow-hidden">
                {article.image ? (
                  <Image
                    alt={article.image.alt}
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    fill
                    sizes="(min-width: 768px) 33vw, 100vw"
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
                <div className="absolute right-4 top-4 rounded-full bg-secondary-container px-3 py-1 font-label-sm text-label-sm text-on-secondary-container">
                  {article.category}
                </div>
              </div>

              <div className="flex flex-grow flex-col p-6">
                <p className="mb-2 font-label-sm text-label-sm text-on-surface-variant">
                  {article.date}
                </p>
                <h3 className="line-clamp-2 font-headline-sm text-headline-sm text-primary">
                  {article.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-16 text-center">
          <Link
            className="ambient-shadow hover-lift inline-flex rounded-[24px] border border-surface-tint/20 bg-surface-container-highest px-8 py-3 font-label-md text-label-md text-primary transition-colors hover:bg-secondary-container hover:text-on-secondary-container"
            href="/berita"
          >
            Lihat Semua Berita
          </Link>
        </div>
      </div>
    </section>
  );
}
