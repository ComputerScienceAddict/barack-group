import Image from "next/image";
import { heroBeforeAfter } from "@/lib/site-data";

export function HeroBeforeAfter() {
  return (
    <figure className="overflow-hidden rounded-[1.85rem] border border-white/10 bg-[#050814]">
      <div className="relative min-h-[240px] sm:min-h-[360px] lg:min-h-[390px]">
        <Image
          src={heroBeforeAfter.before.src}
          alt={heroBeforeAfter.before.alt}
          fill
          className="object-cover object-center"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
        />

        <Image
          src={heroBeforeAfter.after.src}
          alt={heroBeforeAfter.after.alt}
          fill
          className="animate-hero-crossfade object-cover object-center"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
        />

        <div className="absolute left-4 top-4 rounded-full border border-white/10 bg-black/45 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-white backdrop-blur-xl">
          Live project result
        </div>

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#03050b] via-[#03050b]/15 to-transparent" />

        <div className="pointer-events-none absolute inset-x-0 bottom-0 px-4 pb-4 pt-16 sm:px-5 sm:pb-5 sm:pt-20">
          <div className="flex items-end justify-between gap-4 rounded-2xl border border-white/10 bg-black/35 px-4 py-3 backdrop-blur-xl">
            <div>
              <p className="font-display text-xl font-black uppercase tracking-[-0.02em] text-white">
                Strip & refinish
              </p>
              <p className="mt-0.5 text-xs text-slate-400">
                Concrete floor restoration
              </p>
            </div>

            <p className="shrink-0 text-xs font-black uppercase tracking-[0.16em] text-slate-400">
              <span className="animate-hero-label-before text-white">Before</span>
              <span className="mx-1.5 text-blue-400">/</span>
              <span className="animate-hero-label-after text-white">After</span>
            </p>
          </div>
        </div>
      </div>
    </figure>
  );
}
