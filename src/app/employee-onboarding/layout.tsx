import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./onboarding.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Barak Group Inc. — Employee Onboarding",
  description:
    "Complete employment application, W-4, I-9, BOLI, and direct deposit authorization in one guided flow.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function EmployeeOnboardingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className={`onboardingBody ${inter.variable}`}>
      {children}
    </div>
  );
}
