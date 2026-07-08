"use client";

import { SiteImage } from "@/components/site-image";
import { HeroBeforeAfter } from "@/components/hero-before-after";
import { AnimatedContent } from "@/components/reactbits";
import { ButtonLink } from "@/components/ui/button-link";
import { heroImage } from "@/lib/site-data";

const proofPoints = [
  {
    title: "24/7 request support",
    detail: "Urgent facility needs routed fast, without chasing multiple crews.",
  },
  {
    title: "MI · OH · IN coverage",
    detail: "Regional coordination for janitorial, porter, and floor-care work.",
  },
  {
    title: "Operating since 2018",
    detail: "Established crews, clear scopes, and quality checks on every site.",
  },
];

const services = [
  "Office and retail cleaning",
  "Day porter routes",
  "Floor restoration",
  "Turnover resets",
];

export function HomeHero() {
  return (
    <section className="barak-hero-vintage relative isolate overflow-hidden text-white">
      <div className="pointer-events-none absolute inset-0 -z-20" aria-hidden>
        <SiteImage
          src={heroImage.src}
          alt={heroImage.alt}
          fill
          priority
          className="object-cover object-[center_35%] vintage-hero-image"
        />

        <div className="absolute inset-0 vintage-hero-wash" />
        <div className="absolute inset-0 vintage-paper-grid" />
        <div className="absolute inset-x-0 top-0 h-44 bg-gradient-to-b from-[#08101d] to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-[#0f1829] to-transparent" />
        <div className="absolute -left-40 top-20 h-[34rem] w-[34rem] rounded-full border border-[#d6bd86]/10" />
        <div className="absolute -right-52 top-12 h-[36rem] w-[36rem] rounded-full bg-[#d6bd86]/[0.045] blur-3xl" />
      </div>

      <div className="site-header-offset relative mx-auto grid w-full max-w-7xl items-start gap-7 px-4 pb-10 sm:px-6 sm:pb-14 lg:grid-cols-[0.92fr_1.08fr] lg:gap-12 lg:pb-16">
        <div className="order-2 flex flex-col gap-5 lg:order-none lg:max-w-2xl">
          <AnimatedContent>
            <div className="vintage-eyebrow">
              <span className="vintage-eyebrow-line" />
              <span>Commercial</span>
              <span>Janitorial</span>
              <span>Facility Maintenance</span>
            </div>
          </AnimatedContent>

          <AnimatedContent delay={80}>
            <div className="space-y-5">
              <h1 className="vintage-hero-title font-display">
                Clean facilities.
                <span>Reliable crews.</span>
              </h1>

              <p className="max-w-xl text-[15px] leading-7 text-[#cdd4df] sm:text-[17px] sm:leading-8">
                Janitorial, porter, and floor-care programs for offices, multifamily
                properties, medical sites, warehouses, and high-traffic buildings.
              </p>
            </div>
          </AnimatedContent>

          <AnimatedContent delay={140}>
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <ButtonLink href="/contact#quote" size="lg" className="w-full vintage-primary-btn sm:w-auto">
                Book a walkthrough
              </ButtonLink>

              <ButtonLink href="/services" variant="secondary" size="lg" className="w-full vintage-secondary-btn sm:w-auto">
                See the work
              </ButtonLink>
            </div>
          </AnimatedContent>

          <AnimatedContent delay={190}>
            <ul className="vintage-proof-grid">
              {proofPoints.map((item) => (
                <li key={item.title} className="vintage-proof-card">
                  <p className="text-[13px] font-black uppercase tracking-[0.08em] text-[#fff2d4]">
                    {item.title}
                  </p>
                  <p className="mt-2 text-[12.5px] leading-5 text-[#c6cfda]">
                    {item.detail}
                  </p>
                </li>
              ))}
            </ul>
          </AnimatedContent>
        </div>

        <AnimatedContent delay={120} className="order-1 w-full lg:order-none">
          <div className="relative">
            <div className="absolute -inset-3 rounded-[2rem] bg-[#d6bd86]/[0.055] blur-2xl sm:-inset-5" />

            <div className="vintage-showcase-card relative overflow-hidden rounded-[1.35rem] p-2.5 sm:rounded-[2rem] sm:p-3.5">
              <HeroBeforeAfter />

              <div className="vintage-scope-card">
                <div className="flex items-center gap-3">
                  <span className="h-px w-9 bg-[#d6bd86]" />
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#ead8ad] sm:text-[11px]">
                    Service Scope
                  </p>
                </div>

                <ul className="mt-3 grid grid-cols-1 gap-x-6 gap-y-2.5 sm:grid-cols-2">
                  {services.map((service) => (
                    <li
                      key={service}
                      className="flex items-center gap-2.5 text-[12.5px] font-semibold text-[#e9edf3]"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-[#d6bd86]" />
                      {service}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </AnimatedContent>
      </div>
    </section>
  );
}
