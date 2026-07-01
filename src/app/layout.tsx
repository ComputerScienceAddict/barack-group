import type { Metadata } from "next";
import { Inter, Libre_Baskerville, Oswald } from "next/font/google";
import "./globals.css";
import { SiteShell } from "@/components/site-shell";

const display = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const accent = Libre_Baskerville({
  variable: "--font-baskerville",
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
});

const body = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Barak Group Inc. — Commercial & Residential Cleaning",
  description:
    "Barak Group Inc. provides commercial and residential cleaning, maintenance, and specialty facility services across Oregon, Utah, and Idaho.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${display.variable} ${accent.variable} ${body.variable} h-full antialiased`}>
      <body className="min-h-full bg-[#06080f] text-white">
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
