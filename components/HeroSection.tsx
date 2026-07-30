"use client";

import Image, { type StaticImageData } from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import bannerOne from "@/components/asset/1.webp";
import bannerTwo from "@/components/asset/2.webp";
import bannerThree from "@/components/asset/3.webp";
import { hero } from "@/data/landing-page";

type HeroSlide = {
  image: StaticImageData;
  alt: string;
};

const heroSlides: HeroSlide[] = [
  {
    image: bannerOne,
    alt: "Banner ajakan donasi untuk mendukung kegiatan belajar santri.",
  },
  {
    image: bannerTwo,
    alt: "Banner dukungan komunitas untuk pendidikan santri di kelas.",
  },
  {
    image: bannerThree,
    alt: "Banner konsep program dengan suasana kajian santri di ruangan.",
  },
];

const carouselInterval = 3000;

export function HeroSection() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const goToPreviousSlide = () => {
    setActiveSlide((currentSlide) =>
      currentSlide === 0 ? heroSlides.length - 1 : currentSlide - 1,
    );
  };

  const goToNextSlide = () => {
    setActiveSlide((currentSlide) => (currentSlide + 1) % heroSlides.length);
  };

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (isPaused || prefersReducedMotion) {
      return undefined;
    }

    const intervalId = window.setInterval(goToNextSlide, carouselInterval);

    return () => window.clearInterval(intervalId);
  }, [isPaused]);

  return (
    <section
      aria-label="Sorotan kampanye Derma Nusantara"
      className="relative -mt-[76px] w-full bg-background px-margin-mobile pb-margin-mobile pt-0 md:px-0 md:pb-0"
    >
      <h1 className="sr-only">{hero.title}</h1>

      <div
        aria-roledescription="carousel"
        className="group relative h-[58svh] min-h-[320px] max-h-[520px] overflow-hidden bg-surface-container-low md:h-[100svh] md:min-h-[540px] md:max-h-none"
        onBlur={() => setIsPaused(false)}
        onFocus={() => setIsPaused(true)}
      >
        <div className="absolute inset-0">
          {heroSlides.map((slide, index) => (
            <Image
              alt={slide.alt}
              className={`absolute inset-0 object-contain object-top transition-opacity duration-700 ease-out md:object-cover md:object-center ${
                activeSlide === index ? "opacity-100" : "opacity-0"
              }`}
              fill
              key={slide.alt}
              priority={index === 0}
              sizes="100vw"
              src={slide.image}
            />
          ))}
        </div>

        <button
          aria-label="Tampilkan banner sebelumnya"
          className="absolute left-2 top-1/2 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-surface/90 text-primary shadow-sm transition hover:bg-surface focus:outline-none focus-visible:ring-2 focus-visible:ring-primary md:left-8 md:size-12"
          onClick={goToPreviousSlide}
          type="button"
        >
          <ChevronLeft aria-hidden size={24} />
        </button>

        <button
          aria-label="Tampilkan banner berikutnya"
          className="absolute right-2 top-1/2 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-surface/90 text-primary shadow-sm transition hover:bg-surface focus:outline-none focus-visible:ring-2 focus-visible:ring-primary md:right-8 md:size-12"
          onClick={goToNextSlide}
          type="button"
        >
          <ChevronRight aria-hidden size={24} />
        </button>

        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-surface/90 px-3 py-2 shadow-sm backdrop-blur-sm md:bottom-5">
          {heroSlides.map((slide, index) => (
            <button
              aria-label={`Tampilkan banner ${index + 1}`}
              aria-current={activeSlide === index}
              className={`h-2.5 rounded-full transition-all ${
                activeSlide === index
                  ? "w-8 bg-primary"
                  : "w-2.5 bg-outline-variant hover:bg-secondary"
              }`}
              key={slide.alt}
              onClick={() => setActiveSlide(index)}
              type="button"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
