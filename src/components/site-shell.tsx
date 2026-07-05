"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ButtonLink } from "@/components/ui/button-link";

const nav = [
  { label: "Services", href: "/services" },
  { label: "About", href: "/about" },
  { label: "Coverage", href: "/coverage" },
  { label: "Contact", href: "/contact" },
];

function MenuIcon({ open }: { open: boolean }) {
  return (
    <span className="relative block h-4 w-5" aria-hidden>
      <span
        className={`absolute left-0 top-0 h-0.5 w-5 rounded-full bg-current transition duration-200 ${
          open ? "top-[7px] rotate-45" : ""
        }`}
      />
      <span
        className={`absolute left-0 top-[7px] h-0.5 w-5 rounded-full bg-current transition duration-200 ${
          open ? "opacity-0" : ""
        }`}
      />
      <span
        className={`absolute left-0 top-[14px] h-0.5 w-5 rounded-full bg-current transition duration-200 ${
          open ? "top-[7px] -rotate-45" : ""
        }`}
      />
    </span>
  );
}

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideChrome = pathname.startsWith("/employee-onboarding");
  const [open, setOpen] = useState(false);

  if (hideChrome) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[#03050b] text-white">
      <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-4 sm:pt-4">
        <div className="mx-auto max-w-7xl rounded-[1.25rem] border border-white/10 bg-[#050814]/92 shadow-[0_18px_70px_rgba(0,0,0,0.45)] backdrop-blur-2xl sm:rounded-[1.7rem]">
          <div className="flex h-16 items-center justify-between gap-3 px-3 sm:h-20 sm:px-5">
            <Link href="/" className="flex min-w-0 shrink items-center" onClick={() => setOpen(false)}>
              <div className="relative h-11 w-[10.5rem] sm:h-14 sm:w-[14.5rem]">
                <Image
                  src="/barak-logo.png"
                  alt="Barak Group Inc."
                  fill
                  priority
                  className="object-contain object-left"
                  sizes="(max-width: 640px) 168px, 232px"
                />
              </div>
            </Link>

            <nav className="hidden items-center gap-1 md:flex">
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-md px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="flex shrink-0 items-center gap-2">
              <ButtonLink href="/contact#quote" variant="header" size="header" className="inline-flex">
                <span className="hidden sm:inline">Get a quote</span>
                <span className="sm:hidden">Quote</span>
              </ButtonLink>

              <button
                type="button"
                onClick={() => setOpen((value) => !value)}
                aria-label={open ? "Close menu" : "Open menu"}
                aria-expanded={open}
                className={`flex h-10 w-10 items-center justify-center rounded-md border transition md:hidden ${
                  open
                    ? "border-blue-300/30 bg-blue-500/10 text-blue-100"
                    : "border-white/12 bg-white/[0.04] text-slate-200 hover:border-white/20 hover:bg-white/[0.07]"
                }`}
              >
                <MenuIcon open={open} />
              </button>
            </div>
          </div>

          {open ? (
            <div className="border-t border-white/8 px-3 pb-4 pt-2 md:hidden">
              <nav className="flex flex-col gap-0.5">
                {nav.map((item) => {
                  const active = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={`rounded-md px-3 py-3 text-sm font-semibold transition ${
                        active ? "bg-white/10 text-white" : "text-slate-300 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
              <ButtonLink
                href="/contact#quote"
                variant="primary"
                size="md"
                className="mt-3 w-full"
                onClick={() => setOpen(false)}
              >
                Get a quote
              </ButtonLink>
            </div>
          ) : null}
        </div>
      </header>

      <main>{children}</main>
    </div>
  );
}
