import { CircleUserRound, Quote } from "lucide-react";
import { testimonials } from "@/data/landing-page";

export function TestimonialsSection() {
  return (
    <section className="bg-surface-container px-margin-mobile py-16 md:px-margin-desktop md:py-24">
      <div className="mx-auto max-w-container-max">
        <div className="mb-9 grid gap-4 md:mb-14 md:grid-cols-[0.8fr_1.2fr] md:items-end md:gap-5">
          <div>
            <span className="mb-3 inline-flex w-fit rounded bg-secondary px-3 py-1.5 font-label-sm text-label-sm text-on-secondary md:mb-4 md:px-4 md:py-2">
              Suara Kebaikan
            </span>
            <h2 className="font-headline-md text-headline-md text-primary">
              Testimoni
            </h2>
          </div>
          <p className="max-w-2xl font-body-lg text-[1rem] leading-7 text-on-surface-variant md:justify-self-end md:text-body-lg">
            Kesan awal para donatur saat mencoba layanan Derma Nusantara pada
            hari peluncurannya.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3 md:gap-6">
          {testimonials.map((testimonial) => (
            <article
              className="ambient-shadow hover-lift relative mx-auto flex w-full max-w-[20.5rem] flex-col overflow-hidden rounded-lg border border-outline-variant/40 bg-surface md:min-h-[340px] md:max-w-none"
              key={testimonial.name}
            >
              <div className="h-1.5 bg-primary md:h-2" />

              <div className="flex flex-1 flex-col p-5 md:p-7">
                <div className="mb-5 flex items-center justify-between gap-4 md:mb-7">
                  <div aria-hidden className="flex size-12 items-center justify-center rounded-full border-[3px] border-slate-300 bg-slate-100 text-slate-400 md:size-16 md:border-4">
                    <CircleUserRound className="size-8 md:size-11" strokeWidth={1.6} />
                  </div>
                  <div className="flex size-9 items-center justify-center rounded-full bg-tertiary-container text-on-tertiary-container md:size-12">
                    <Quote aria-hidden size={18} fill="currentColor" />
                  </div>
                </div>

                <p className="font-body-md text-[0.95rem] italic leading-6 text-on-surface-variant md:text-body-md md:leading-7">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>

                <div className="mt-auto pt-6 md:pt-8">
                  <div className="mb-3 h-px w-full bg-outline-variant/50 md:mb-4" />
                  <p className="font-label-md text-label-md text-primary">
                    {testimonial.name}
                  </p>
                  <p className="mt-1 font-label-sm text-label-sm text-on-surface-variant">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
