import Image from "next/image";
import { Quote } from "lucide-react";
import { testimonials } from "@/data/landing-page";

export function TestimonialsSection() {
  return (
    <section className="bg-surface-container px-margin-mobile py-24 md:px-margin-desktop">
      <div className="mx-auto max-w-container-max">
        <div className="mb-14 grid gap-5 md:grid-cols-[0.8fr_1.2fr] md:items-end">
          <div>
            <span className="mb-4 inline-flex w-fit rounded bg-secondary px-4 py-2 font-label-sm text-label-sm text-on-secondary">
              Suara Kebaikan
            </span>
            <h2 className="font-headline-md text-headline-md text-primary">
              Testimoni
            </h2>
          </div>
          <p className="max-w-2xl font-body-lg text-body-lg text-on-surface-variant md:justify-self-end">
            Kepercayaan lahir dari pengalaman nyata para tokoh, relawan, dan
            sahabat yang melihat langsung bagaimana amanah dikelola.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {testimonials.map((testimonial) => (
            <article
              className="ambient-shadow hover-lift relative flex min-h-[340px] flex-col overflow-hidden rounded-lg border border-outline-variant/40 bg-surface"
              key={testimonial.name}
            >
              <div className="h-2 bg-primary" />

              <div className="flex flex-1 flex-col p-7">
                <div className="mb-7 flex items-center justify-between gap-4">
                  <div className="relative size-16 overflow-hidden rounded-full border-4 border-secondary/35 bg-surface-container-low">
                    <Image
                      alt={testimonial.image.alt}
                      className="object-cover"
                      fill
                      sizes="64px"
                      src={testimonial.image.src}
                    />
                  </div>
                  <div className="flex size-12 items-center justify-center rounded-full bg-tertiary-container text-on-tertiary-container">
                    <Quote aria-hidden size={22} fill="currentColor" />
                  </div>
                </div>

                <p className="font-body-md text-body-md italic leading-7 text-on-surface-variant">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>

                <div className="mt-auto pt-8">
                  <div className="mb-4 h-px w-full bg-outline-variant/50" />
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
