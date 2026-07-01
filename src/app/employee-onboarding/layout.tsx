import type { Metadata } from "next";
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
    "Complete employment application, W-4, I-9, WH-151PS, and direct deposit authorization in one guided flow.",
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
