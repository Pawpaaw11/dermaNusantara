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
import { absoluteUrl, safeJsonLd, SITE_DESCRIPTION, SITE_NAME } from "@/lib/seo";

export default function Home() {
  const jsonLd = { "@context": "https://schema.org", "@graph": [{ "@type": "Organization", "@id": `${absoluteUrl("/")}#organization`, name: SITE_NAME, url: absoluteUrl("/"), logo: { "@type": "ImageObject", url: absoluteUrl("/icon-512.png") }, description: SITE_DESCRIPTION }, { "@type": "WebSite", "@id": `${absoluteUrl("/")}#website`, name: SITE_NAME, url: absoluteUrl("/"), description: SITE_DESCRIPTION, publisher: { "@id": `${absoluteUrl("/")}#organization` }, inLanguage: "id-ID" }] };
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }} />
    </>
  );
}
