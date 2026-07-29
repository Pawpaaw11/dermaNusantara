import Image from "next/image";
import Link from "next/link";
import { programs } from "@/data/landing-page";

export function ProgramHighlights() {
  return (
    <section
      className="bg-surface-container px-margin-mobile py-24 md:px-margin-desktop"
      id="programs"
    >
      <div className="mx-auto max-w-container-max">
        <div className="mb-16 space-y-4 text-center">
          <h2 className="font-headline-md text-headline-md text-primary">
            Program Kebaikan
          </h2>
          <p className="mx-auto max-w-2xl font-body-md text-body-md text-on-surface-variant">
            Pilih jalan kebaikanmu hari ini. Sedikit dari kita, sangat berarti
            bagi mereka.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {programs.map((program) => (
            <article
              className="ambient-shadow hover-lift relative flex flex-col overflow-hidden rounded-lg border border-outline-variant/40 bg-surface"
              key={program.title}
            >
              <div className="relative h-44 overflow-hidden">
                <Image
                  alt={program.image.alt}
                  className="object-cover transition-transform duration-500 hover:scale-105"
                  fill
                  sizes="(min-width: 768px) 33vw, 100vw"
                  src={program.image.src}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-primary/75 via-primary/25 to-transparent" />
                <div className="absolute left-5 top-5 rounded bg-primary px-3 py-2 font-label-sm text-label-sm text-on-primary shadow-sm">
                  {program.category} Derma Nusantara
                </div>
                <p className="absolute bottom-5 left-5 max-w-[220px] font-headline-sm text-headline-sm uppercase text-on-primary">
                  {program.title}
                </p>
              </div>

              <div className="flex flex-grow flex-col px-5 pt-0">
                <div className="-mt-px mb-5 w-fit rounded-br-lg bg-secondary px-4 py-2 font-label-md text-label-md text-on-secondary">
                  {program.category} Pelosok Negeri
                </div>

                <h3 className="font-headline-sm text-headline-sm text-primary">
                  {program.title}
                </h3>
                <p className="mt-3 line-clamp-2 font-body-md text-body-md text-on-surface-variant">
                  {program.description}
                </p>

                <div className="mt-auto pt-6">
                  <p className="font-body-md text-body-md text-outline">
                    Perolehan
                  </p>
                  <div className="mt-1 flex items-end justify-between gap-4">
                    <p className="font-headline-sm text-headline-sm text-primary">
                      {program.collected}
                    </p>
                    <p className="font-headline-sm text-headline-sm text-primary">
                      {program.progress}%
                    </p>
                  </div>

                  <div className="mt-5 h-3 w-full overflow-hidden rounded-full bg-surface-variant">
                    <div
                      className="progress-fill h-full rounded-full bg-secondary"
                      style={{ width: `${program.progress}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-outline-variant/30 bg-surface-container-low px-5 py-4">
                <span className="font-body-md text-body-md text-outline">
                  Target
                </span>
                <span className="font-label-md text-label-md text-primary">
                  {program.target}
                </span>
              </div>

              <Link
                className="block w-full bg-primary py-4 text-center font-label-md text-label-md text-on-primary transition-colors hover:bg-primary-container focus-visible:bg-primary-container focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-fixed-dim"
                href={`/donasi/${program.slug}`}
              >
                Donasi
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
