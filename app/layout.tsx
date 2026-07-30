import type { Metadata } from "next";
import { Figtree, Nunito_Sans } from "next/font/google";
import "./globals.css";

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
  title: "Derma Nusantara",
  description:
    "Gerakan kebaikan untuk menyalurkan donasi, makanan hangat, wakaf Al-Quran, dan dukungan pendidikan di seluruh Nusantara.",
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
