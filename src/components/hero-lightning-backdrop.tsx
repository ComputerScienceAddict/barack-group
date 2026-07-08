"use client";

import { Lightning } from "@/components/lightning";

export function HeroLightningBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden>
      <Lightning
        hue={218}
        xOffset={-0.28}
        speed={0.3}
        intensity={0.3}
        size={1.4}
        className="barak-hero-lightning absolute inset-y-0 left-[-18%] h-full w-[48%]"
      />
      <div className="barak-hero-lightning-veil absolute inset-0" />
    </div>
  );
}
