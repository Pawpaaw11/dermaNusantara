import { Suspense } from "react";
import { Footer } from "@/components/Footer";
import { HeroSection } from "@/components/HeroSection";
import { NewsSection } from "@/components/NewsSection";
import { ProgramHighlights } from "@/components/ProgramHighlights";
import { ProgramHighlightsSkeleton } from "@/components/ProgramHighlightsSkeleton";
import { SiteHeader } from "@/components/SiteHeader";
import { TestimonialsSection } from "@/components/TestimonialsSection";
import { TransparencySection } from "@/components/TransparencySection";
import { WaveDivider } from "@/components/WaveDivider";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main>
        <HeroSection />
        <WaveDivider className="-mb-4 rotate-180 fill-surface-container pt-4 md:-mb-8 md:pt-8" />
        <Suspense fallback={<ProgramHighlightsSkeleton />}>
          <ProgramHighlights />
        </Suspense>
        <WaveDivider className="bg-surface-container fill-background" />
        <NewsSection />
        <TestimonialsSection />
        <TransparencySection />
      </main>
      <Footer />
    </>
  );
}
