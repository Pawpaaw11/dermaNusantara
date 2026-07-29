import Link from "next/link";
import { ArrowRight, ChartColumn, ShieldCheck } from "lucide-react";

const features = [
  {
    title: "Sistem Keamanan Tinggi",
    description:
      "Data dan donasi Anda dilindungi dengan enkripsi standar perbankan.",
    icon: ShieldCheck,
    cardClass: "bg-surface-container-low text-primary",
    iconClass: "bg-secondary-fixed-dim text-on-secondary-fixed-variant",
    textClass: "text-on-surface-variant",
  },
  {
    title: "Laporan Real-time",
    description:
      "Akses laporan keuangan dan update penyaluran program kapan saja.",
    icon: ChartColumn,
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
              Setiap rupiah dapat dilacak.
            </h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant">
              Kami percaya transparansi adalah kunci dari amanah. Lihat laporan
              penyaluran dana secara real-time dan rasakan ketenangan dalam
              berbagi.
            </p>
            <Link
              className="flex items-center gap-2 font-label-md text-label-md text-secondary hover:underline"
              href="#"
            >
              Lihat Laporan Transparansi
              <ArrowRight aria-hidden size={16} />
            </Link>
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
