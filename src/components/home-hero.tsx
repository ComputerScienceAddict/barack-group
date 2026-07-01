"use client";

import Image from "next/image";
import { HeroBeforeAfter } from "@/components/hero-before-after";
import { AnimatedContent } from "@/components/reactbits";
import { ButtonLink } from "@/components/ui/button-link";
import { heroImage } from "@/lib/site-data";

export function HomeHero() {
  return (
    <section className="hero-vintage-bg relative overflow-hidden text-white">
      <Image
        src={heroImage.src}
        alt={heroImage.alt}
        fill
        priority
        className="hero-vintage-image object-cover object-center"
      />

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#06080f]/90 via-[#080a12]/75 to-[#06080f]/95" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_20%_0%,rgba(59,130,246,0.12),transparent_60%)]" />
      <div className="hero-vintage-grain pointer-events-none absolute inset-0" />
      <div className="hero-vintage-vignette pointer-events-none absolute inset-0" />

      <div className="relative mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:py-24">
        <div className="grid w-full gap-12 lg:grid-cols-2 lg:items-center lg:gap-14">
          <div className="space-y-8">
            <div className="max-w-xl space-y-5">
              <h1 className="font-display text-[clamp(2.25rem,5.5vw,3.5rem)] font-semibold leading-[1.1] tracking-tight text-white">
                Cleaning & maintenance{" "}
                <span className="text-blue-400">you can count on.</span>
              </h1>

              <div className="space-y-2.5">
                <p className="font-accent text-[1.2rem] font-medium italic leading-snug text-slate-200 sm:text-[1.35rem]">
                  Stadium nights. Job-site mornings. We show up either way.
                </p>

                <p className="text-[15px] leading-relaxed text-slate-400">
                  Commercial janitorial and specialty cleaning across Oregon, Utah, and Idaho.
                </p>
              </div>
            </div>

            <div className="space-y-5 pt-1">
              <div className="flex flex-wrap items-center gap-4">
                <ButtonLink href="/contact#quote" size="lg">
                  Get a free quote
                </ButtonLink>
                <ButtonLink href="/services" variant="secondary" size="lg">
                  View services
                </ButtonLink>
              </div>
              <p className="text-[13px] leading-5 tracking-wide text-slate-500">
                Est. 2018 · Background-checked crews · Free walkthrough · Photo reports
              </p>
            </div>
          </div>

          <AnimatedContent delay={120}>
            <HeroBeforeAfter />
          </AnimatedContent>
        </div>
      </div>
    </section>
  );
}
