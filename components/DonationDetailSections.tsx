"use client";

import { HeartHandshake, UserRound } from "lucide-react";
import { useEffect, useState } from "react";

type Donor = {
  donorDisplayName: string;
  amount: number;
  donatedAt: string;
};

const currencyFormatter = new Intl.NumberFormat("id-ID");

export function CampaignAboutSection({
  description,
  story,
}: {
  description: string;
  story: string[];
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <section className="mt-6 rounded-[24px] border border-outline-variant/40 bg-surface p-5 shadow-sm lg:mt-8 lg:rounded-none lg:border-x-0 lg:border-t-0 lg:bg-transparent lg:p-0 lg:pb-8 lg:shadow-none">
      <h2 className="text-xl font-bold leading-7 text-primary lg:font-headline-sm lg:text-headline-sm">
        Tentang program
      </h2>
      <div className="relative mt-3 max-w-3xl lg:mt-4">
        <div
          className={`space-y-4 overflow-hidden text-[1rem] leading-7 text-on-surface-variant transition-[max-height] duration-500 lg:max-h-none lg:space-y-5 lg:overflow-visible lg:font-body-lg lg:text-body-lg lg:leading-8 ${
            expanded ? "max-h-[200rem]" : "max-h-[8.75rem]"
          }`}
        >
          <p>{description}</p>
          {story.map((paragraph, index) => (
            <p key={`${index}-${paragraph}`}>{paragraph}</p>
          ))}
        </div>
        {!expanded ? (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-background via-background/90 to-transparent lg:hidden"
          />
        ) : null}
      </div>
      <button
        aria-expanded={expanded}
        className="mt-3 text-sm font-bold text-primary transition-colors hover:text-secondary lg:hidden"
        onClick={() => setExpanded((current) => !current)}
        type="button"
      >
        {expanded ? "Ringkas ↑" : "Selengkapnya →"}
      </button>
    </section>
  );
}

export function RecentDonorsSection({ donors }: { donors: Donor[] }) {
  const [expanded, setExpanded] = useState(false);
  const latestDonors = donors.slice(0, 5);
  const mobileDonors = expanded ? latestDonors : latestDonors.slice(0, 3);

  const row = (donor: Donor, index: number) => (
    <div
      className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-outline-variant/30 px-3.5 py-3.5 last:border-b-0 md:px-6 md:py-5"
      key={`${donor.donorDisplayName}-${donor.donatedAt}-${index}`}
    >
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary/20 text-secondary md:size-11">
          <UserRound size={18} />
        </div>
        <p className="truncate text-sm font-semibold text-on-background md:font-label-md md:text-label-md">
          {donor.donorDisplayName}
        </p>
      </div>
      <p className="whitespace-nowrap text-sm font-bold text-primary md:font-label-md md:text-label-md">
        Rp {currencyFormatter.format(donor.amount)}
      </p>
    </div>
  );

  return (
    <section className="mt-6 rounded-[24px] border border-outline-variant/40 bg-surface p-5 shadow-sm lg:mt-8 lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none">
      <h2 className="text-xl font-bold leading-7 text-primary lg:font-headline-sm lg:text-headline-sm">Donatur</h2>
      {latestDonors.length ? (
        <>
          <div className="relative mt-4 overflow-hidden rounded-2xl border border-outline-variant/40 bg-surface-container-low lg:hidden">
            {mobileDonors.map(row)}
            {!expanded && latestDonors.length > 3 ? (
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-surface to-transparent"
              />
            ) : null}
          </div>
          <div className="ambient-shadow mt-5 hidden overflow-hidden rounded-lg border border-outline-variant/40 bg-surface lg:block">
            {latestDonors.map(row)}
          </div>
          {latestDonors.length > 3 ? (
            <button
              aria-expanded={expanded}
              className="mt-3 text-sm font-bold text-primary transition-colors hover:text-secondary lg:hidden"
              onClick={() => setExpanded((current) => !current)}
              type="button"
            >
              {expanded ? "Ringkas ↑" : "Selengkapnya →"}
            </button>
          ) : null}
        </>
      ) : (
        <div className="mt-5 rounded-lg border border-outline-variant/40 bg-surface px-6 py-8 text-center text-on-surface-variant">
          Belum ada donatur untuk program ini.
        </div>
      )}
    </section>
  );
}

export function MobileDonationCta() {
  const [blockedByContent, setBlockedByContent] = useState(false);

  useEffect(() => {
    const targets: Element[] = [];
    const form = document.getElementById("donation-form");
    const footer = document.querySelector("footer");
    if (form) targets.push(form);
    if (footer) targets.push(footer);
    if (!targets.length) return;
    const visibility = new Map<Element, boolean>();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => visibility.set(entry.target, entry.isIntersecting));
        setBlockedByContent([...visibility.values()].some(Boolean));
      },
      { threshold: 0.08 },
    );
    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, []);

  if (blockedByContent) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 border-t border-outline-variant/40 bg-background/95 px-4 pt-3 shadow-[0_-8px_30px_rgba(20,30,70,0.12)] backdrop-blur-md lg:hidden"
      style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
    >
      <a
        className="mx-auto flex max-w-md items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 font-label-md text-label-md text-on-primary"
        href="#donation-form"
        onClick={(event) => {
          event.preventDefault();
          document
            .getElementById("donation-form")
            ?.scrollIntoView({ behavior: "smooth", block: "start" });
        }}
      >
        <HeartHandshake size={18} />
        Donasi Sekarang
      </a>
    </div>
  );
}
