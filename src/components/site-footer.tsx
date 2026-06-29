import Link from "next/link";
import { locations } from "@/lib/site-data";
export function SiteFooter() {
  return (
    <footer className="relative border-t border-blue-500/15 bg-[#06080f] text-slate-300">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-600/50 to-transparent" />

      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
        {/* brand */}
        <div className="space-y-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Barak Group Inc." className="h-12 w-auto" />
          <p className="text-sm text-slate-400">
            Commercial cleaning and maintenance in Oregon, Utah, and Idaho.
          </p>
          <p className="text-sm font-bold text-blue-400">
            When your reputation is on the line, count on ours.
          </p>
        </div>

        {/* links */}
        <div>
          <p className="mb-4 text-xs font-extrabold uppercase tracking-[0.2em] text-blue-400">Quick Links</p>
          <div className="space-y-2.5 text-sm">
            {[
              { href: "/services", label: "Services" },
              { href: "/industries", label: "Industries" },
              { href: "/blog", label: "Latest News" },
              { href: "/contact", label: "Contact Us" },
            ].map((link) => (
              <Link key={link.href} href={link.href} className="block transition hover:text-blue-300">
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* locations */}
        <div className="sm:col-span-2">
          <p className="mb-4 text-xs font-extrabold uppercase tracking-[0.2em] text-blue-400">Locations</p>
          <div className="grid gap-5 text-sm sm:grid-cols-2">
            {locations.map((location) => (
              <div key={location.state} className="space-y-1">
                <p className="font-bold text-white">{location.state}</p>
                <p className="text-slate-500">{location.address}</p>
                <a href={location.href} className="font-semibold text-blue-400 transition hover:text-blue-300">
                  {location.phone}
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-white/5 py-4 text-center text-xs text-slate-600">
        &copy; {new Date().getFullYear()} Barak Group Inc. All rights reserved.
      </div>
    </footer>
  );
}
