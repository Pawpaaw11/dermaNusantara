import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, UserRound } from "lucide-react";
import { DonationPaymentForm } from "@/components/DonationPaymentForm";
import { Footer } from "@/components/Footer";
import { SiteHeader } from "@/components/SiteHeader";
import { getCampaignBySlug } from "@/lib/api/campaigns";

type DonationPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const dynamic = "force-dynamic";

const currencyFormatter = new Intl.NumberFormat("id-ID");

export async function generateMetadata({
  params,
}: DonationPageProps): Promise<Metadata> {
  const { slug } = await params;
  const program = await getCampaignBySlug(slug);

  if (!program) {
    return {
      title: "Program Tidak Ditemukan | Derma Nusantara",
    };
  }

  return {
    title: `${program.title} | Donasi | Derma Nusantara`,
    description: program.description,
  };
}

export default async function DonationPage({ params }: DonationPageProps) {
  const { slug } = await params;
  const program = await getCampaignBySlug(slug);

  if (!program) {
    notFound();
  }

  return (
    <>
      <SiteHeader />
      <main className="bg-background">
        <section className="px-margin-mobile pb-20 pt-8 md:px-margin-desktop md:pb-24">
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

              <section className="mt-8 border-b border-outline-variant/40 pb-8">
                <h2 className="font-headline-sm text-headline-sm text-primary">
                  Tentang program
                </h2>
                <div className="mt-4 max-w-3xl space-y-5 font-body-lg text-body-lg leading-8 text-on-surface-variant">
                  <p>{program.description}</p>
                  {program.story.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </section>

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

              <section className="mt-8">
                <h2 className="font-headline-sm text-headline-sm text-primary">
                  Donatur
                </h2>

                <div className="ambient-shadow mt-5 overflow-hidden rounded-lg border border-outline-variant/40 bg-surface">
                  {program.recentDonors.map((donor) => (
                    <div
                      className="flex items-center justify-between gap-4 border-b border-outline-variant/30 px-6 py-5 last:border-b-0"
                      key={`${donor.donorDisplayName}-${donor.donatedAt}`}
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-secondary/20 text-secondary">
                          <UserRound size={20} />
                        </div>
                        <p className="truncate font-label-md text-label-md text-on-background">
                          {donor.donorDisplayName}
                        </p>
                      </div>
                      <p className="shrink-0 font-label-md text-label-md text-primary">
                        Rp {currencyFormatter.format(donor.amount)}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            </article>

            <aside className="lg:col-span-5">
              <DonationPaymentForm program={program} />
            </aside>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
