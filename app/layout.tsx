import type { Metadata } from "next";
import { Figtree, Nunito_Sans } from "next/font/google";
import "./globals.css";
import { absoluteUrl, DEFAULT_OG_IMAGE, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/seo";

const figtree = Figtree({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-figtree",
});

const nunitoSans = Nunito_Sans({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-nunito-sans",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "Derma Nusantara | Donasi Transparan untuk Indonesia", template: "%s | Derma Nusantara" },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  alternates: { canonical: "/" },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } },
  openGraph: { type: "website", locale: "id_ID", url: "/", siteName: SITE_NAME, title: "Derma Nusantara | Donasi Transparan untuk Indonesia", description: SITE_DESCRIPTION, images: [{ url: DEFAULT_OG_IMAGE, alt: "Program kebaikan Derma Nusantara" }] },
  twitter: { card: "summary_large_image", title: "Derma Nusantara | Donasi Transparan untuk Indonesia", description: SITE_DESCRIPTION, images: [absoluteUrl(DEFAULT_OG_IMAGE)] },
  icons: { icon: [{ url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" }, { url: "/favicon-48x48.png", sizes: "48x48", type: "image/png" }], apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }] },
  manifest: "/manifest.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body
        className={`${figtree.variable} ${nunitoSans.variable} bg-background text-body-md font-body-md text-on-background antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
