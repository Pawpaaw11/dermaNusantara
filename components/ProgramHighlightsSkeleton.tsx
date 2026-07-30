const skeletonClass =
  "animate-pulse rounded bg-surface-variant/80 motion-reduce:animate-none";

export function ProgramHighlightsSkeleton() {
  return (
    <section
      aria-busy="true"
      className="bg-surface-container px-margin-mobile py-16 md:px-margin-desktop md:py-24"
      id="programs"
      role="status"
    >
      <span className="sr-only">Memuat program kebaikan</span>

      <div aria-hidden className="mx-auto max-w-container-max">
        <div className="mb-10 flex flex-col items-center md:mb-16">
          <div className={`${skeletonClass} h-10 w-64 md:h-12 md:w-80`} />
          <div className={`${skeletonClass} mt-4 h-5 w-full max-w-xl`} />
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
          {Array.from({ length: 3 }, (_, index) => (
            <article
              className="ambient-shadow relative mx-auto flex w-full max-w-[20.5rem] flex-col overflow-hidden rounded-lg border border-outline-variant/40 bg-surface md:max-w-none"
              key={index}
            >
              <div className={`${skeletonClass} h-36 rounded-none md:h-44`} />

              <div className="flex flex-grow flex-col px-4 md:px-5">
                <div
                  className={`${skeletonClass} -mt-px mb-5 h-10 w-44 rounded-t-none`}
                />
                <div className={`${skeletonClass} h-7 w-3/4`} />
                <div className={`${skeletonClass} mt-4 h-4 w-full`} />
                <div className={`${skeletonClass} mt-2 h-4 w-4/5`} />

                <div className="mt-7">
                  <div className={`${skeletonClass} h-4 w-24`} />
                  <div className="mt-3 flex items-center justify-between gap-4">
                    <div className={`${skeletonClass} h-7 w-36`} />
                    <div className={`${skeletonClass} h-7 w-14`} />
                  </div>
                  <div
                    className={`${skeletonClass} mt-5 h-3 w-full rounded-full`}
                  />
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-outline-variant/30 bg-surface-container-low px-4 py-4 md:px-5">
                <div className={`${skeletonClass} h-5 w-16`} />
                <div className={`${skeletonClass} h-5 w-28`} />
              </div>
              <div className="h-[52px] animate-pulse bg-primary/35 motion-reduce:animate-none md:h-14" />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
