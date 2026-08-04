import { Newspaper, ShieldCheck } from "lucide-react";

const features = [
  {
    title: "Sistem Keamanan Tinggi",
    description:
      "Akses dibatasi, data divalidasi, sesi diamankan, dan aktivitas pengelolaan dicatat secara berlapis.",
    icon: ShieldCheck,
    cardClass: "bg-surface-container-low text-primary",
    iconClass: "bg-secondary-fixed-dim text-on-secondary-fixed-variant",
    textClass: "text-on-surface-variant",
  },
  {
    title: "Laporan Berkala",
    description:
      "Perkembangan program dan penyaluran donasi kami sampaikan secara berkala melalui berita Derma Nusantara.",
    icon: Newspaper,
    cardClass: "bg-primary-container text-on-primary",
    iconClass: "bg-primary-fixed text-primary",
    textClass: "text-primary-fixed-dim",
  },
];

export function TransparencySection() {
  return (
    <section
      className="bg-background px-margin-mobile py-24 md:px-margin-desktop"
      id="transparency"
    >
      <div className="mx-auto max-w-container-max">
        <div className="grid grid-cols-1 items-center gap-6 md:grid-cols-12">
          <div className="space-y-6 md:col-span-5">
            <h2 className="font-display-lg-mobile text-display-lg-mobile text-primary md:font-headline-md md:text-headline-md">
              Keamanan dan amanah dalam setiap langkah.
            </h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant">
              Keamanan data dan akuntabilitas program menjadi prioritas kami.
              Setiap perkembangan program serta laporan penyaluran disampaikan
              secara berkala melalui berita Derma Nusantara.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:col-span-7">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <article
                  className={`ambient-shadow hover-lift flex flex-col items-start justify-center rounded-[32px] p-8 ${feature.cardClass}`}
                  key={feature.title}
                >
                  <div className={`mb-6 rounded-2xl p-4 ${feature.iconClass}`}>
                    <Icon aria-hidden size={32} fill="currentColor" />
                  </div>
                  <h3 className="mb-2 font-headline-sm text-headline-sm">
                    {feature.title}
                  </h3>
                  <p
                    className={`font-body-md text-body-md ${feature.textClass}`}
                  >
                    {feature.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
