"use client";

import { LanguageProvider } from "@/components/employee-onboarding/LanguageProvider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return <LanguageProvider>{children}</LanguageProvider>;
}
