import Link from "next/link";
import { HeroImageCarousel } from "@/components/hero-image-carousel";
import { HeroLightningBackdrop } from "@/components/hero-lightning-backdrop";
import { ServiceShowcaseSection } from "@/components/service-showcase-section";
import {
  phoneNumbers,
  serviceHighlights,
  industries,
  posts,
} from "@/lib/site-data";

export function HomePageContent() {
  return (
    <div className="w-full">
      <section className="relative w-full overflow-hidden border-b-2 barak-border">
        <HeroLightningBackdrop />
        <div className="relative z-[1] max-w-6xl mx-auto flex flex-wrap lg:border-r-2 lg:border-l-2 barak-border">
          <div className="barak-panel relative z-[1] w-full bg-[color-mix(in_srgb,var(--color-panel)_90%,transparent)] md:w-1/2 px-4 sm:px-6 md:px-8 lg:px-12 py-8 lg:py-16">
            <h1 className="text-2xl font-bold leading-tight text-[var(--color-ink)]">
              Barak Group delivers dependable commercial cleaning across Oregon, Utah, and Idaho.
            </h1>

            <ul className="mt-6 space-y-3">
              {serviceHighlights.slice(0, 4).map((service) => (
                <li key={service.title} className="flex items-start text-[var(--color-ink-2)]">
                  <span className="mr-2 mt-0.5 text-[var(--color-accent)]">•</span>
                  <span>
                    <strong className="text-[var(--color-ink)]">{service.title}.</strong>{" "}
                    {service.description}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/contact" className="barak-btn-primary px-4 py-2 text-sm font-semibold">
                Get a Quote
              </Link>
              <Link href="/services" className="barak-btn-secondary px-4 py-2 text-sm font-semibold">
                View Services
              </Link>
            </div>
          </div>

          <div className="relative z-[1] flex w-full flex-col border-t-2 barak-border bg-[var(--color-panel)] md:w-1/2 md:border-l-2 md:border-t-0">
            <HeroImageCarousel />
            <div className="barak-hero-caption">
              <p className="barak-hero-caption-label">On-site crews</p>
              <p className="barak-hero-caption-text">
                Offices, stadiums, construction sites, and specialty jobs across the Pacific Northwest and Mountain West.
              </p>
            </div>
          </div>
        </div>
      </section>

      <ServiceShowcaseSection />

      <section className="w-full border-b-2 barak-border">
        <div className="barak-band max-w-6xl mx-auto flex flex-wrap lg:border-r-2 lg:border-l-2 barak-border">
          <div className="px-4 sm:px-6 md:px-8 lg:px-12 pt-8 w-full relative">
            <div className="absolute right-4 top-4 hidden md:block border barak-border bg-[var(--color-paper)]/90 px-3 py-1.5 text-xs font-medium text-[var(--color-ink-2)]">
              Built for high-traffic facilities
            </div>
            <div className="flex justify-center flex-wrap w-full relative pb-8">
              <h2 className="text-3xl font-bold leading-tight text-center w-full text-[var(--color-ink)]">
                Need a crew that shows up and does it right?
              </h2>
              <p className="mt-3 text-center max-w-2xl text-[var(--color-ink-2)]">
                We support offices, campuses, events, construction, and specialty jobs with flexible staffing and clear communication.
              </p>
              <div className="mt-6 w-full flex justify-center">
                <Link href="/contact" className="barak-btn-secondary px-5 py-2.5 text-sm font-semibold">
                  YES, LET&apos;S TALK
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full border-b-2 barak-border">
        <div className="w-full max-w-6xl mx-auto flex flex-wrap lg:border-l-2 lg:border-r-2 barak-border">
          <div className="w-full lg:w-2/3 border-b-2 lg:border-b-0 barak-border bg-[var(--color-paper)]">
            <div className="relative px-4 sm:px-6 md:px-8 lg:px-12 py-4 sm:py-6 md:py-8 lg:py-10">
              <h2 className="text-2xl font-bold leading-tight text-[var(--color-ink)]">Recent Updates</h2>
              <ul className="mt-4">
                {posts.map((post) => (
                  <li key={post.slug} className="py-4 border-b border-stone-300/80 last:border-b-0">
                    <p className="text-xs font-semibold text-[var(--color-ink-3)]">{post.date}</p>
                    <Link
                      href={`/blog/${post.slug}`}
                      className="text-lg font-semibold text-[var(--color-ink)] hover:text-[var(--color-accent)] transition-colors"
                    >
                      {post.title}
                    </Link>
                    <p className="text-sm text-[var(--color-ink-2)]">{post.excerpt}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="w-full lg:w-1/3 lg:border-l-2 barak-border bg-[var(--color-paper-2)]">
            <div className="px-4 sm:px-6 md:px-8 lg:px-12 py-8 border-b-2 barak-border">
              <h2 className="text-2xl font-bold leading-tight text-[var(--color-ink)]">Service Areas</h2>
            </div>
            <ul className="px-4 sm:px-6 md:px-8 lg:px-12 py-8">
              {phoneNumbers.map((office) => (
                <li key={office.state} className="mb-3">
                  <p className="font-semibold text-[var(--color-ink)]">{office.state}</p>
                  <a
                    href={office.href}
                    className="text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] underline underline-offset-2"
                  >
                    {office.phone}
                  </a>
                </li>
              ))}
            </ul>

            <div className="px-4 sm:px-6 md:px-8 lg:px-12 py-8 border-t-2 barak-border">
              <h2 className="text-2xl font-bold leading-tight text-[var(--color-ink)]">Industries</h2>
            </div>
            <ul className="px-4 sm:px-6 md:px-8 lg:px-12 py-8">
              {industries.slice(0, 8).map((industry) => (
                <li key={industry.name} className="mb-2 text-[var(--color-ink-2)]">
                  {industry.name}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
