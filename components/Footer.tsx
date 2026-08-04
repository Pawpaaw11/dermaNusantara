import Link from "next/link";
import { MapPin, MessageCircle, Phone } from "lucide-react";

const legalLinks = [
  { label: "Kebijakan Privasi", href: "/kebijakan-privasi" },
  { label: "Syarat & Ketentuan", href: "/syarat-ketentuan" },
  { label: "Panduan Donasi", href: "/panduan-donasi" },
];

const address =
  "Mojokarang, Kec. Dlanggu, Kabupaten Mojokerto, Jawa Timur";

export function Footer() {
  return (
    <footer
      className="w-full rounded-t-[40px] bg-surface-container-highest px-margin-mobile py-section-gap md:px-margin-desktop dark:bg-surface-container-highest"
      id="about"
    >
      <div className="mx-auto grid max-w-container-max gap-10 lg:grid-cols-[1fr_1.25fr_0.8fr] lg:gap-16">
        <div>
          <span className="font-headline-sm text-headline-sm font-bold text-primary dark:text-primary-fixed">
            Derma Nusantara
          </span>
          <p className="mt-4 max-w-sm font-body-md text-body-md leading-7 text-on-surface-variant">
            Menghubungkan kebaikan untuk mendukung pendidikan, kemanusiaan,
            dan program sosial yang berdampak bagi Indonesia.
          </p>
        </div>

        <div>
          <h2 className="font-label-md text-label-md font-bold text-primary">Kontak & Alamat</h2>
          <div className="mt-4 space-y-3 text-sm text-on-surface-variant">
            <a className="flex items-center gap-3 transition-colors hover:text-primary" href="tel:+6281357035751"><Phone aria-hidden size={18}/>081357035751</a>
            <a className="flex items-center gap-3 transition-colors hover:text-primary" href="https://wa.me/6281357035751" rel="noreferrer" target="_blank"><MessageCircle aria-hidden size={18}/>WhatsApp</a>
            <a className="flex items-start gap-3 leading-6 transition-colors hover:text-primary" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`} rel="noreferrer" target="_blank"><MapPin aria-hidden className="mt-0.5 shrink-0" size={18}/><span>{address}</span></a>
          </div>
        </div>

        <nav aria-label="Informasi hukum" className="flex flex-col items-start gap-4">
          <h2 className="font-label-md text-label-md font-bold text-primary">Informasi</h2>
          {legalLinks.map((link) => <Link className="font-label-sm text-label-sm text-on-surface-variant underline decoration-outline-variant underline-offset-4 transition-colors hover:text-primary" href={link.href} key={link.href}>{link.label}</Link>)}
        </nav>
      </div>
      <div className="mx-auto mt-12 max-w-container-max border-t border-outline-variant/50 pt-6">
        <p className="font-body-md text-body-md text-on-surface-variant">
          © 2026 Derma Nusantara. Mengusung Semangat Gotong Royong.
        </p>
      </div>
    </footer>
  );
}
