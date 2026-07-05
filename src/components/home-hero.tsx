"use client";

import Image from "next/image";
import { HeroBeforeAfter } from "@/components/hero-before-after";
import { AnimatedContent } from "@/components/reactbits";
import { ButtonLink } from "@/components/ui/button-link";
import { Lightning } from "@/components/lightning";
import { heroImage } from "@/lib/site-data";

const stats = [
  ["24/7", "rapid response"],
  ["3", "state coverage"],
  ["2018", "trusted since"],
];

const services = ["Commercial", "Janitorial", "Maintenance", "Move Outs"];

export function HomeHero() {
  return (
    <section className="barak-hero-v2 relative isolate overflow-hidden text-white">
      <div className="pointer-events-none absolute inset-0 -z-20" aria-hidden>
        <Image
          src={heroImage.src}
          alt={heroImage.alt}
          fill
          priority
          className="object-cover object-[center_35%] opacity-[0.1] grayscale saturate-50 brightness-[0.35]"
        />

        <Lightning
          hue={218}
          xOffset={-0.34}
          speed={0.34}
          intensity={0.55}
          size={1.55}
          className="absolute inset-y-0 left-[-24%] hidden h-full w-[78%] opacity-35 sm:block"
        />

        <div className="barak-grid-v2 absolute inset-0" />
        <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-[#02040a] via-[#02040a]/96 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_16%,rgba(37,99,235,0.28),transparent_29%),radial-gradient(circle_at_82%_12%,rgba(147,197,253,0.11),transparent_30%),linear-gradient(120deg,rgba(2,4,10,0.42),rgba(2,4,10,0.88)_58%,#02040a_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-[#03050b] to-transparent" />
        <div className="barak-orbit-v2 absolute left-[-17rem] top-24 h-[44rem] w-[44rem]" />
        <div className="barak-blue-flare absolute right-[-18rem] top-12 h-[42rem] w-[42rem]" />
      </div>

      <div className="site-header-offset relative mx-auto grid w-full max-w-7xl items-start gap-5 px-4 pb-8 sm:gap-8 sm:px-6 sm:pb-12 lg:grid-cols-[0.96fr_1.04fr] lg:gap-10 lg:pb-14 xl:gap-12">
        <div className="order-2 flex flex-col gap-4 lg:order-none lg:max-w-2xl lg:gap-5">
          <AnimatedContent>
            <div className="flex items-center gap-2.5 sm:gap-3">
              <span className="h-6 w-px shrink-0 bg-gradient-to-b from-blue-300/80 via-blue-500/60 to-transparent sm:h-7" />
              <p className="text-[10px] font-bold uppercase leading-relaxed tracking-[0.16em] text-slate-500 sm:text-[11px] sm:tracking-[0.2em]">
                <span className="text-slate-300">Commercial</span>
                <span className="mx-1.5 text-white/15 sm:mx-2">|</span>
                Janitorial
                <span className="mx-1.5 text-white/15 sm:mx-2">|</span>
                Maintenance
              </p>
            </div>
          </AnimatedContent>

          <AnimatedContent delay={80}>
            <div className="space-y-3 sm:space-y-4">
              <h1 className="font-display text-[clamp(2.35rem,11vw,5.75rem)] font-black uppercase leading-[0.88] tracking-[-0.05em] text-white sm:leading-[0.86] sm:tracking-[-0.055em]">
                Facility work
                <span className="barak-title-v2 block">done sharp.</span>
              </h1>

              <p className="max-w-xl text-[15px] leading-7 text-slate-300 sm:text-[17px] sm:leading-8">
                Commercial cleaning, janitorial crews, and maintenance support built for offices,
                apartments, stadium spaces, job sites, and high traffic facilities.
              </p>
            </div>
          </AnimatedContent>

          <AnimatedContent delay={140}>
            <div className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
              <ButtonLink href="/contact#quote" size="lg" className="w-full sm:w-auto">
                Book a walkthrough
              </ButtonLink>
              <ButtonLink href="/services" variant="secondary" size="lg" className="w-full sm:w-auto">
                See the work
              </ButtonLink>
            </div>
          </AnimatedContent>

          <AnimatedContent delay={190}>
            <div className="grid max-w-xl grid-cols-3 overflow-hidden rounded-xl border border-white/10 bg-[#07101f]/60 shadow-[0_20px_65px_rgba(0,0,0,0.38),inset_0_1px_0_rgba(255,255,255,0.09)] backdrop-blur-2xl sm:rounded-[1.35rem]">
              {stats.map(([value, label]) => (
                <div key={label} className="border-r border-white/10 px-2 py-3 last:border-r-0 sm:px-4 sm:py-4">
                  <p className="font-display text-xl font-black leading-none text-white sm:text-3xl">
                    {value}
                  </p>
                  <p className="mt-1.5 text-[9px] font-bold uppercase leading-tight tracking-[0.14em] text-slate-500 sm:mt-2 sm:text-[10px] sm:tracking-[0.18em]">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </AnimatedContent>
        </div>

        <AnimatedContent delay={120} className="order-1 w-full lg:order-none">
          <div className="relative">
            <div className="absolute -inset-3 rounded-[2rem] bg-blue-500/15 blur-3xl sm:-inset-5 sm:rounded-[3rem]" />
            <div className="barak-showcase-card relative overflow-hidden rounded-[1.35rem] p-2 sm:rounded-[2rem] sm:p-2.5 lg:rounded-[2.4rem] lg:p-3">
              <div className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-blue-200/90 to-transparent" />
              <div className="absolute inset-y-10 right-0 w-px bg-gradient-to-b from-transparent via-blue-300/40 to-transparent" />

              <HeroBeforeAfter />

              <div className="mt-2.5 grid grid-cols-2 gap-2.5 sm:mt-3 sm:grid-cols-4 sm:gap-3">
                {services.map((service) => (
                  <div
                    key={service}
                    className="rounded-xl border border-white/10 bg-white/[0.045] px-2 py-2.5 text-center text-[10px] font-bold uppercase tracking-[0.1em] text-slate-300 sm:rounded-2xl sm:px-3 sm:py-3 sm:text-[11px] sm:tracking-[0.13em]"
                  >
                    {service}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </AnimatedContent>
      </div>
    </section>
  );
}
