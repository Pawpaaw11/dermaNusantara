import { Footer } from "./Footer";
import { SiteHeader } from "./SiteHeader";

export type LegalSection = {
  title: string;
  paragraphs?: string[];
  items?: string[];
};

export function LegalPage({
  title,
  description,
  sections,
}: {
  title: string;
  description: string;
  sections: LegalSection[];
}) {
  return (
    <>
      <SiteHeader />
      <main className="bg-background px-margin-mobile pb-24 pt-12 md:px-margin-desktop md:pt-16">
        <article className="mx-auto max-w-4xl">
          <header className="border-b border-outline-variant/50 pb-8">
            <p className="font-label-md text-label-md text-secondary">Informasi Derma Nusantara</p>
            <h1 className="mt-3 font-display-lg-mobile text-primary md:font-display-lg">{title}</h1>
            <p className="mt-4 max-w-3xl font-body-lg text-body-lg leading-8 text-on-surface-variant">{description}</p>
            <p className="mt-4 text-sm text-on-surface-variant">Terakhir diperbarui: 2 Agustus 2026</p>
          </header>
          <div className="mt-10 space-y-10">
            {sections.map((section, index) => (
              <section key={section.title}>
                <h2 className="font-headline-sm text-primary">{index + 1}. {section.title}</h2>
                {section.paragraphs?.map((paragraph) => <p className="mt-4 leading-8 text-on-surface-variant" key={paragraph}>{paragraph}</p>)}
                {section.items ? <ul className="mt-4 list-disc space-y-3 pl-6 leading-7 text-on-surface-variant">{section.items.map((item) => <li key={item}>{item}</li>)}</ul> : null}
              </section>
            ))}
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
