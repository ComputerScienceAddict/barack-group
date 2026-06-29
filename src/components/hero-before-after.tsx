import Image from "next/image";
import { heroBeforeAfter } from "@/lib/site-data";

export function HeroBeforeAfter() {
  return (
    <figure className="overflow-hidden rounded-xl">
      <div className="relative min-h-[320px] sm:min-h-[400px]">
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
        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#06080f] via-[#06080f]/80 to-transparent px-4 pb-4 pt-20 sm:px-5 sm:pb-5">
          <div className="flex items-end justify-between gap-4">
            <p className="text-sm text-slate-300">Concrete floor strip &amp; refinish</p>
            <p className="shrink-0 text-xs font-medium text-slate-400">
              <span className="animate-hero-label-before text-white">Before</span>
              <span className="mx-1.5 text-slate-600">/</span>
              <span className="animate-hero-label-after text-white">After</span>
            </p>
          </div>
        </div>
      </div>
    </figure>
  );
}
