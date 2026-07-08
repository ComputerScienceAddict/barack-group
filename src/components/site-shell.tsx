"use client";

import Image from "next/image";
import Link from "next/link";import { usePathname } from "next/navigation";
import { useState } from "react";
import { phoneNumbers } from "@/lib/site-data";

const navLinks = [
  { href: "/services", label: "Services" },
  { href: "/industries", label: "Industries" },
  { href: "/blog", label: "Updates" },
];

const footerLinks = [
  { href: "/services", label: "Services" },
  { href: "/industries", label: "Industries" },
  { href: "/blog", label: "Updates" },
  { href: "/contact", label: "Contact" },
];

function HeaderLink({
  href,
  label,
  pathname,
  onClick,
}: {
  href: string;
  label: string;
  pathname: string;
  onClick?: () => void;
}) {
  const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`barak-header-link ${isActive ? "barak-header-link-active" : ""}`}
    >
      {label}
    </Link>
  );
}

function Header() {
  const pathname = usePathname() ?? "/";
  const [open, setOpen] = useState(false);

  return (
    <header className="barak-header print:hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="barak-header-inner">
          <Link href="/" className="barak-header-logo-image" onClick={() => setOpen(false)}>
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
          <nav className="barak-header-nav hidden md:flex" aria-label="Main">
            {navLinks.map((link) => (
              <HeaderLink key={link.href} href={link.href} label={link.label} pathname={pathname} />
            ))}
            <span className="barak-header-divider" aria-hidden="true" />
            <Link href="/contact" className="barak-header-cta">
              Get a quote
            </Link>
          </nav>

          <button
            type="button"
            className={`barak-header-menu-btn md:hidden ${open ? "barak-header-menu-btn-open" : ""}`}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen(!open)}
          >
            <span className="barak-header-menu-icon" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
            <span className="barak-header-menu-label">{open ? "Close" : "Menu"}</span>
          </button>
        </div>

        {open && (
          <nav id="mobile-nav" className="barak-header-mobile-nav md:hidden">
            {navLinks.map((link) => {
              const isActive = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`barak-header-mobile-link ${isActive ? "barak-header-mobile-link-active" : ""}`}
                >
                  {link.label}
                </Link>
              );
            })}
            <Link
              href="/contact"
              onClick={() => setOpen(false)}
              className={`barak-header-mobile-link ${pathname.startsWith("/contact") ? "barak-header-mobile-link-active" : ""}`}
            >
              Contact
            </Link>
            <Link
              href="/contact"
              className="barak-header-cta barak-header-cta-mobile"
              onClick={() => setOpen(false)}
            >
              Get a quote
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="barak-footer print:hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-14">
        <div className="barak-footer-grid">
          <div className="barak-footer-col">
            <div className="relative mb-4 h-12 w-[11rem]">
              <Image
                src="/barak-logo.png"
                alt="Barak Group Inc."
                fill
                className="object-contain object-left"
                sizes="176px"
              />
            </div>
            <p className="barak-footer-tagline">              Commercial cleaning and facility services across Oregon, Utah, and Idaho.
            </p>
          </div>

          <div className="barak-footer-col">
            <p className="barak-footer-heading">Explore</p>
            <nav className="barak-footer-links">
              {footerLinks.map((item) => (
                <Link key={item.href} href={item.href} className="barak-footer-link">
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="barak-footer-col">
            <p className="barak-footer-heading">Contact</p>
            <div className="barak-footer-links">
              {phoneNumbers.map((line) => (
                <a key={line.state} href={line.href} className="barak-footer-link">
                  {line.state} · {line.phone}
                </a>
              ))}
              <a href="mailto:barakgroupor@gmail.com" className="barak-footer-link">
                barakgroupor@gmail.com
              </a>
            </div>
          </div>

          <div className="barak-footer-col">
            <p className="barak-footer-heading">Affiliated franchise</p>
            <div className="barak-footer-affiliate">
              <img
                src="/jani-king-logo.png"
                alt="Jani-King logo"
                className="barak-footer-affiliate-logo"
              />
              <p className="barak-footer-affiliate-text">
                Barak Group operates as an affiliated Jani-King franchise in Oregon and Idaho.
              </p>
            </div>
          </div>
        </div>

        <div className="barak-footer-bottom">
          <p>© {new Date().getFullYear()} Barak Group Inc.</p>
          <p>Oregon · Utah · Idaho</p>
        </div>
      </div>
    </footer>
  );
}

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isOnboarding = pathname?.startsWith("/employee-onboarding") || pathname?.startsWith("/hiring");

  if (isOnboarding) {
    return <>{children}</>;
  }

  return (
    <div className="barak-page w-full min-h-full flex flex-col">
      <Header />
      <main className="w-full flex-1">{children}</main>
      <Footer />
    </div>
  );
}
