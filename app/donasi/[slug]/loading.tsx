import { Footer } from "@/components/Footer";
import { SiteHeader } from "@/components/SiteHeader";

const skeletonClass =
  "animate-pulse rounded bg-surface-variant/80 motion-reduce:animate-none";

export default function DonationDetailLoading() {
  return (
    <>
      <SiteHeader />
      <main className="bg-background">
        <section
          aria-busy="true"
          className="px-margin-mobile pb-20 pt-8 md:px-margin-desktop md:pb-24"
          role="status"
        >
          <span className="sr-only">Memuat program donasi</span>

          <div
            aria-hidden
            className="mx-auto grid max-w-container-max gap-10 lg:grid-cols-12 lg:gap-12"
          >
            <article className="lg:col-span-7">
              <div className={`${skeletonClass} h-5 w-52`} />
              <div className={`${skeletonClass} mt-7 h-12 w-4/5 max-w-lg`} />
              <div
                className={`${skeletonClass} ambient-shadow relative mt-8 aspect-[16/10] w-full rounded-lg`}
              />

              <section className="mt-8 border-b border-outline-variant/40 pb-8">
                <div className={`${skeletonClass} h-7 w-44`} />
                <div className="mt-5 space-y-3">
                  <div className={`${skeletonClass} h-5 w-full`} />
                  <div className={`${skeletonClass} h-5 w-full`} />
                  <div className={`${skeletonClass} h-5 w-11/12`} />
                  <div className={`${skeletonClass} h-5 w-4/5`} />
                </div>
              </section>

              <section className="mt-8">
                <div className={`${skeletonClass} h-7 w-28`} />
                <div className="ambient-shadow mt-5 overflow-hidden rounded-lg border border-outline-variant/40 bg-surface">
                  {Array.from({ length: 2 }, (_, index) => (
                    <div
                      className="flex items-center justify-between gap-4 border-b border-outline-variant/30 px-6 py-5 last:border-b-0"
                      key={index}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`${skeletonClass} size-11 rounded-full`}
                        />
                        <div className={`${skeletonClass} h-5 w-28`} />
                      </div>
                      <div className={`${skeletonClass} h-5 w-24`} />
                    </div>
                  ))}
                </div>
              </section>
            </article>

            <aside className="lg:col-span-5">
              <div className="lg:sticky lg:top-28">
                <div className="ambient-shadow overflow-hidden rounded-[32px] border border-outline-variant/40 bg-surface-container-lowest">
                  <div className="bg-primary/80 px-8 py-7">
                    <div className="flex justify-between gap-4">
                      <div>
                        <div className="h-4 w-28 animate-pulse rounded bg-white/25 motion-reduce:animate-none" />
                        <div className="mt-3 h-8 w-40 animate-pulse rounded bg-white/30 motion-reduce:animate-none" />
                      </div>
                      <div className="h-14 w-28 animate-pulse rounded-full bg-white/20 motion-reduce:animate-none" />
                    </div>
                    <div className="mt-6 h-3 w-full animate-pulse rounded-full bg-white/20 motion-reduce:animate-none" />
                    <div className="mt-4 flex justify-between">
                      <div className="h-4 w-24 animate-pulse rounded bg-white/20 motion-reduce:animate-none" />
                      <div className="h-4 w-20 animate-pulse rounded bg-white/20 motion-reduce:animate-none" />
                    </div>
                  </div>

                  <div className="space-y-7 px-8 py-8">
                    <div>
                      <div className={`${skeletonClass} mb-3 h-5 w-32`} />
                      <div className="grid grid-cols-2 gap-3">
                        {Array.from({ length: 4 }, (_, index) => (
                          <div
                            className={`${skeletonClass} h-12 rounded-2xl`}
                            key={index}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className={`${skeletonClass} h-5 w-36`} />
                      <div className={`${skeletonClass} h-12 rounded-2xl`} />
                      <div className={`${skeletonClass} h-12 rounded-2xl`} />
                      <div className={`${skeletonClass} h-12 rounded-2xl`} />
                      <div className={`${skeletonClass} h-28 rounded-2xl`} />
                    </div>

                    <div>
                      <div className={`${skeletonClass} mb-3 h-5 w-40`} />
                      <div className={`${skeletonClass} h-20 rounded-2xl`} />
                    </div>
                    <div className="h-14 animate-pulse rounded-full bg-primary/35 motion-reduce:animate-none" />
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
