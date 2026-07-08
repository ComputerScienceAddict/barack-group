import Image from "next/image";
import { heroBeforeAfter } from "@/lib/site-data";

export function HeroBeforeAfter() {
  return (
    <figure className="vintage-photo-frame overflow-hidden rounded-[1.35rem] p-2 sm:rounded-[1.65rem] sm:p-2.5">
      <div className="relative min-h-[265px] overflow-hidden rounded-[1rem] bg-[#090d14] sm:min-h-[360px] sm:rounded-[1.2rem] lg:min-h-[410px]">
        <Image
          src={heroBeforeAfter.before.src}
          alt={heroBeforeAfter.before.alt}
          fill
          className="object-cover object-center vintage-photo-base"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
        />

        <Image
          src={heroBeforeAfter.after.src}
          alt={heroBeforeAfter.after.alt}
          fill
          className="object-cover object-center vintage-after-wipe"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
        />

        <div className="vintage-wipe-line" />

        <div className="pointer-events-none absolute inset-0 vintage-photo-grade" />
        <div className="pointer-events-none absolute inset-0 hero-vintage-grain" />

        <div className="pointer-events-none absolute left-4 top-4 sm:left-5 sm:top-5">
          <div className="vintage-ticket">
            Field Log 014
          </div>
        </div>

        <div className="pointer-events-none absolute right-4 top-4 sm:right-5 sm:top-5">
          <div className="vintage-tag">
            6 Day Turnover
          </div>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 px-4 pb-4 pt-20 sm:px-5 sm:pb-5">
          <div className="vintage-photo-caption">
            <div>
              <div className="mb-2 h-px w-12 bg-[#d6bd86]" />
              <p className="font-display text-xl font-black uppercase leading-none tracking-[-0.02em] text-[#fff7e8] sm:text-2xl">
                Concrete Floor Reset
              </p>
              <p className="mt-2 text-[12px] font-medium uppercase tracking-[0.14em] text-[#c9bda5]">
                Strip · Scrub · Seal · Polish
              </p>
            </div>

            <div className="vintage-before-after-badge">
              <span className="animate-hero-label-before">Before</span>
              <span className="text-[#d6bd86]">/</span>
              <span className="animate-hero-label-after">After</span>
            </div>
          </div>
        </div>
      </div>
    </figure>
  );
}
