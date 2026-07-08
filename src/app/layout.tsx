import type { Metadata } from "next";
import { Lora, Inter } from "next/font/google";
import "./globals.css";
import { SiteShell } from "@/components/site-shell";

const display = Lora({
  variable: "--font-dm-serif",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  style: ["normal"],
});

const body = Inter({
  variable: "--font-dm-sans",
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
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${display.variable} ${body.variable} h-full`}
    >
      <body suppressHydrationWarning className="min-h-full bg-[var(--color-paper)] text-[var(--color-ink)] antialiased">
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
