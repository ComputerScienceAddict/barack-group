"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { phoneNumbers } from "@/lib/site-data";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/industries", label: "Industries" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
  { href: "/hiring", label: "New Hire" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50">
      {/* desktop utility bar */}
      <div className="hidden border-b border-white/8 bg-[#0a0e1c] lg:block">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-2.5 text-xs">
          <p className="text-slate-500">
            <span className="font-semibold text-slate-300">Barak Group Inc.</span>
            <span className="mx-2 text-slate-700">|</span>
            Est. 2018
            <span className="mx-2 text-slate-700">|</span>
            Mon–Fri 9–5 · Sun 9–3
          </p>
          <div className="flex items-center gap-6">
            {phoneNumbers.map((line) => (
              <a
                key={line.state}
                href={line.href}
                className="group flex items-center gap-2 transition hover:text-blue-300"
              >
                <span className="font-semibold text-white">{line.state}</span>
                <span className="tabular-nums text-slate-500 group-hover:text-blue-300">{line.phone}</span>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* main nav */}
      <div className="border-b border-white/6 bg-[#06080f]/95 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link href="/" className="flex shrink-0 items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Barak Group Inc." className="h-9 w-auto" />
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {navLinks.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-md px-3.5 py-2 text-sm font-medium transition ${
                    active ? "bg-blue-600 text-white" : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-md border border-white/10 text-sm text-slate-300 lg:hidden"
            aria-label="Toggle menu"
          >
            {open ? "Close" : "Menu"}
          </button>
        </div>
      </div>

      {/* mobile menu */}
      {open ? (
        <div className="border-b border-white/6 bg-[#06080f] px-4 py-4 shadow-2xl lg:hidden">
          <div className="mb-4 divide-y divide-white/8 border-y border-white/8">
            {phoneNumbers.map((line) => (
              <a
                key={line.state}
                href={line.href}
                className="flex items-center justify-between py-3.5 text-sm transition hover:bg-white/5"
              >
                <span className="font-medium text-slate-300">{line.state}</span>
                <span className="font-semibold tabular-nums text-white">{line.phone}</span>
              </a>
            ))}
          </div>
          <nav className="flex flex-col gap-0.5">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`rounded-md px-3 py-3 text-sm font-medium ${
                  pathname === link.href ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
