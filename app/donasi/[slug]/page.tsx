import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import {
  CampaignAboutSection,
  MobileDonationCta,
  RecentDonorsSection,
} from "@/components/DonationDetailSections";
import { DonationPaymentForm } from "@/components/DonationPaymentForm";
import { Footer } from "@/components/Footer";
import { SiteHeader } from "@/components/SiteHeader";
import { getCampaignBySlug } from "@/lib/api/campaigns";
import { absoluteUrl, safeJsonLd } from "@/lib/seo";

type DonationPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: DonationPageProps): Promise<Metadata> {
  const { slug } = await params;
  const program = await getCampaignBySlug(slug);

  if (!program) {
    return {
      title: "Program Tidak Ditemukan | Derma Nusantara",
      robots: { index: false, follow: false },
    };
  }

  return {
    title: `${program.title} | Donasi`,
    description: program.shortDescription,
    alternates: { canonical: `/donasi/${program.slug}` },
    openGraph: { type: "website", url: `/donasi/${program.slug}`, title: `${program.title} | Donasi Derma Nusantara`, description: program.shortDescription, images: [{ url: program.coverImageUrl, alt: program.coverImageAlt }] },
    twitter: { card: "summary_large_image", title: `${program.title} | Donasi Derma Nusantara`, description: program.shortDescription, images: [program.coverImageUrl] },
  };
}

export default async function DonationPage({ params }: DonationPageProps) {
  const { slug } = await params;
  const program = await getCampaignBySlug(slug);

  if (!program) {
    notFound();
  }

  const canonicalUrl = absoluteUrl(`/donasi/${program.slug}`);
  const jsonLd = { "@context": "https://schema.org", "@type": "Project", name: program.title, description: program.shortDescription, url: canonicalUrl, image: absoluteUrl(program.coverImageUrl), category: program.category.name, ...(program.location ? { location: { "@type": "Place", name: program.location } } : {}), potentialAction: { "@type": "DonateAction", target: canonicalUrl, recipient: { "@type": "Organization", name: "Derma Nusantara", url: absoluteUrl("/") } } };

  return (
    <>
      <SiteHeader />
      <main className="bg-background">
        <section className="px-margin-mobile pb-36 pt-8 md:px-margin-desktop lg:pb-24">
          <div className="mx-auto grid max-w-container-max gap-10 lg:grid-cols-12 lg:gap-12">
            <article className="lg:col-span-7">
              <div className="flex flex-wrap items-center gap-2 font-label-sm text-label-sm text-on-surface-variant">
                <Link
                  className="inline-flex items-center gap-2 transition-colors hover:text-primary"
                  href="/#programs"
                >
                  <ArrowLeft size={14} />
                  Kembali ke program
                </Link>
                <span>/</span>
                <span className="text-primary">{program.category.name}</span>
              </div>

              <div className="mt-6 max-w-3xl">
                <h1 className="font-display-lg-mobile text-[2.3rem] leading-tight text-primary md:text-display-lg">
                  {program.title}
                </h1>
              </div>

              <div className="ambient-shadow relative mt-8 aspect-[16/10] overflow-hidden rounded-lg bg-surface">
                <Image
                  alt={program.coverImageAlt}
                  className="object-cover"
                  fill
                  priority
                  sizes="(min-width: 1024px) 58vw, 100vw"
                  src={program.coverImageUrl}
                  unoptimized={program.coverImageUrl.includes("/uploads/")}
                />
              </div>

              <CampaignAboutSection
                description={program.description}
                story={program.story}
              />

              {/* <section className="mt-8">
                <h2 className="font-headline-sm text-headline-sm text-primary">
                  Berita Program
                </h2>

                <div className="mt-5 space-y-4">
                  {program.updates.map((update) => (
                    <article
                      className="ambient-shadow rounded-lg border border-outline-variant/40 bg-surface p-6"
                      key={`${update.publishedAt}-${update.title}`}
                    >
                      <div className="flex items-center gap-2 font-label-sm text-label-sm text-on-surface-variant">
                        <CalendarDays size={16} />
                        <span>{update.publishedAt}</span>
                      </div>

                      <h3 className="mt-3 font-headline-sm text-headline-sm text-primary">
                        {update.title}
                      </h3>
                      <p className="mt-3 font-body-md text-body-md leading-7 text-on-surface-variant">
                        {update.excerpt}
                      </p>

                      <details className="group mt-4">
                        <summary className="flex cursor-pointer list-none items-center gap-2 font-label-md text-label-md text-secondary transition-colors hover:text-primary">
                          Selengkapnya
                          <ChevronDown
                            className="transition-transform group-open:rotate-180"
                            size={18}
                          />
                        </summary>
                        <div className="mt-4 space-y-4 border-t border-outline-variant/30 pt-4 font-body-md text-body-md leading-7 text-on-surface-variant">
                          {update.content.map((paragraph) => (
                            <p key={paragraph}>{paragraph}</p>
                          ))}
                        </div>
                      </details>
                    </article>
                  ))}
                </div>
              </section> */}

              <RecentDonorsSection donors={program.recentDonors} />
            </article>

            <aside className="lg:col-span-5">
              <DonationPaymentForm program={program} />
            </aside>
          </div>
        </section>
      </main>
      <Footer />
      <MobileDonationCta />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }} />
    </>
  );
}
