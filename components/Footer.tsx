import Link from "next/link";
import { footerLinks } from "@/data/landing-page";

export function Footer() {
  return (
    <footer
      className="flex w-full flex-col justify-between gap-gutter rounded-t-[40px] bg-surface-container-highest px-margin-mobile py-section-gap md:flex-row md:px-margin-desktop dark:bg-surface-container-highest"
      id="about"
    >
      <div className="flex flex-col gap-4">
        <span className="font-headline-sm text-headline-sm font-bold text-primary dark:text-primary-fixed">
          Derma Nusantara
        </span>
        <p className="max-w-sm font-body-md text-body-md text-on-surface dark:text-on-surface">
          © 2024 Derma Nusantara. Mengusung Semangat Gotong Royong.
        </p>
      </div>

      <nav
        aria-label="Footer"
        className="flex flex-col gap-6 md:flex-row md:gap-12"
      >
        {footerLinks.map((link) => (
          <Link
            className="font-label-sm text-label-sm text-on-surface-variant underline transition-all hover:text-primary"
            href="#"
            key={link}
          >
            {link}
          </Link>
        ))}
      </nav>
    </footer>
  );
}
