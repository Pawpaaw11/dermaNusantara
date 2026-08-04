import Image from "next/image";
import Link from "next/link";
import {
  getCampaigns,
  type CampaignListItem,
} from "@/lib/api/campaigns";

const currencyFormatter = new Intl.NumberFormat("id-ID");

function formatCurrency(value: number) {
  return `Rp ${currencyFormatter.format(value)}`;
}

function formatTarget(campaign: CampaignListItem) {
  if (!campaign.target) {
    return "-";
  }

  return campaign.target.metric === "AMOUNT"
    ? formatCurrency(campaign.target.value)
    : `${currencyFormatter.format(campaign.target.value)} unit`;
}

export async function ProgramHighlights() {
  let campaigns: CampaignListItem[] = [];
  let failedToLoad = false;

  try {
    const response = await getCampaigns();
    campaigns = [...response.data].sort((first, second) => {
      const preferredOrder: Record<string, number> = {
        "sedekah-al-quran": 0,
        "operasional-pondok": 2,
      };

      return (
        (preferredOrder[first.slug] ?? 1) -
        (preferredOrder[second.slug] ?? 1)
      );
    });
  } catch {
    failedToLoad = true;
  }

  return (
    <section
      className="bg-surface-container px-margin-mobile py-16 md:px-margin-desktop md:py-24"
      id="programs"
    >
      <div className="mx-auto max-w-container-max">
        <div className="mb-10 space-y-3 text-center md:mb-16 md:space-y-4">
          <h2 className="font-headline-md text-headline-md text-primary">
            Program Kebaikan
          </h2>
          <p className="mx-auto max-w-2xl font-body-md text-body-md text-on-surface-variant">
            Pilih jalan kebaikanmu hari ini. Sedikit dari kita, sangat berarti
            bagi mereka.
          </p>
        </div>

        {failedToLoad || campaigns.length === 0 ? (
          <div className="rounded-2xl border border-outline-variant/40 bg-surface px-6 py-10 text-center">
            <p className="font-body-md text-body-md text-on-surface-variant">
              Program belum dapat dimuat.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
          {campaigns.map((program) => {
            const displayedPercentage = Math.round(
              program.progress.percentage,
            );
            const progressWidth = Math.min(
              Math.max(program.progress.percentage, 0),
              100,
            );

            return (
            <article
              className="ambient-shadow hover-lift relative mx-auto flex w-full max-w-[20.5rem] flex-col overflow-hidden rounded-lg border border-outline-variant/40 bg-surface md:max-w-none"
              key={program.id}
            >
              <div className="relative h-36 overflow-hidden md:h-44">
                <Image
                  alt={program.coverImageAlt}
                  className="object-cover transition-transform duration-500 hover:scale-105"
                  fill
                  sizes="(min-width: 768px) 33vw, 100vw"
                  src={program.coverImageUrl}
                  unoptimized={program.coverImageUrl.includes("/uploads/")}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-primary/75 via-primary/25 to-transparent" />
                <div className="absolute left-4 top-4 rounded bg-primary px-2.5 py-1.5 font-label-sm text-label-sm text-on-primary shadow-sm md:left-5 md:top-5 md:px-3 md:py-2">
                  {program.category.name} Derma Nusantara
                </div>
                <p className="absolute bottom-4 left-4 max-w-[190px] font-headline-sm text-[1.1rem] font-bold uppercase leading-6 text-on-primary md:bottom-5 md:left-5 md:max-w-[220px] md:text-headline-sm">
                  {program.title}
                </p>
              </div>

              <div className="flex flex-grow flex-col px-4 pt-0 md:px-5">
                <div className="-mt-px mb-4 w-fit rounded-br-lg bg-secondary px-3 py-1.5 font-label-md text-label-md text-on-secondary md:mb-5 md:px-4 md:py-2">
                  {program.cardBadgeText}
                </div>

                <h3 className="font-headline-sm text-[1.15rem] font-bold leading-6 text-primary md:text-headline-sm">
                  {program.title}
                </h3>
                <p className="mt-2 line-clamp-2 font-body-md text-[0.95rem] leading-6 text-on-surface-variant md:mt-3 md:text-body-md">
                  {program.shortDescription}
                </p>

                <div className="mt-auto pt-5 md:pt-6">
                  <p className="font-body-md text-[0.95rem] leading-6 text-outline md:text-body-md">
                    Perolehan
                  </p>
                  <div className="mt-1 flex items-end justify-between gap-4">
                    <p className="font-headline-sm text-[1.15rem] font-bold leading-6 text-primary md:text-headline-sm">
                      {formatCurrency(program.progress.collectedAmount)}
                    </p>
                    <p className="font-headline-sm text-[1.15rem] font-bold leading-6 text-primary md:text-headline-sm">
                      {displayedPercentage}%
                    </p>
                  </div>

                  <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-surface-variant md:mt-5 md:h-3">
                    <div
                      className="progress-fill h-full rounded-full bg-secondary"
                      style={{ width: `${progressWidth}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-outline-variant/30 bg-surface-container-low px-4 py-3 md:mt-6 md:px-5 md:py-4">
                <span className="font-body-md text-[0.95rem] leading-6 text-outline md:text-body-md">
                  Target
                </span>
                <span className="font-label-md text-label-md text-primary">
                  {formatTarget(program)}
                </span>
              </div>

              <Link
                className="block w-full bg-primary py-3.5 text-center font-label-md text-label-md text-on-primary transition-colors hover:bg-primary-container focus-visible:bg-primary-container focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-fixed-dim md:py-4"
                href={`/donasi/${program.slug}`}
              >
                Donasi
              </Link>
            </article>
            );
          })}
          </div>
        )}
      </div>
    </section>
  );
}
