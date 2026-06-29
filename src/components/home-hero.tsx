"use client";

import Image from "next/image";
import { HeroBeforeAfter } from "@/components/hero-before-after";
import { Lightning } from "@/components/lightning";
import { AnimatedContent } from "@/components/reactbits";
import { ButtonLink } from "@/components/ui/button-link";
import { heroImage } from "@/lib/site-data";

export function HomeHero() {
  return (
    <section className="relative overflow-hidden bg-[#06080f] text-white">
      <Image src={heroImage.src} alt={heroImage.alt} fill priority className="object-cover object-center opacity-[0.08]" />
      <div className="pointer-events-none absolute inset-0 opacity-90">
        <Lightning hue={220} xOffset={0} speed={1} intensity={0.9} size={1} />
      </div>
      <div className="absolute inset-0 bg-gradient-to-br from-[#06080f]/85 via-[#06080f]/70 to-[#0a1628]/90" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_0%_0%,rgba(37,99,235,0.2),transparent_60%)]" />

      <div className="relative mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 lg:py-20">
        <div className="grid w-full gap-10 lg:grid-cols-2 lg:items-center lg:gap-12">
          <div className="space-y-7">
            <div className="space-y-5">
              <p className="font-display text-[11px] font-bold uppercase tracking-[0.2em] text-blue-400">
                Barak Group · Est. 2018
              </p>

              <h1 className="font-display text-[clamp(2.5rem,6vw,4.75rem)] font-bold leading-[0.92] tracking-tight">
                <span className="block text-white">CLEANING &</span>
                <span className="block text-white">MAINTENANCE</span>
                <span className="mt-2 block text-blue-400 italic">you can count on.</span>
              </h1>

              <div className="max-w-md space-y-3">
                <p className="text-lg font-semibold leading-snug text-white">
                  Stadium nights. Job-site mornings. We show up either way.
                </p>
                <p className="text-sm leading-6 text-slate-400">
                  Commercial janitorial and specialty cleaning across Oregon, Utah, and Idaho.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <ButtonLink href="/contact#quote" size="lg">
                  Get a free quote
                </ButtonLink>
                <ButtonLink href="/services" variant="secondary" size="lg">
                  View services
                </ButtonLink>
              </div>
              <p className="text-sm text-slate-500">
                Background-checked crews · Free walkthrough · Photo reports
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
