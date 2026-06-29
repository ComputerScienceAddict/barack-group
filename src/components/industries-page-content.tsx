"use client";

import { AnimatedContent } from "@/components/reactbits";
import { MediaGridCard } from "@/components/media-grid-card";
import { SectionHeading } from "@/components/section-heading";
import { industries } from "@/lib/site-data";

export function IndustriesPageContent() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
      <AnimatedContent>
        <SectionHeading
          eyebrow="Industries"
          title="Where we work"
          description="Apartments, offices, stadiums, kitchens, and vacation rentals."
        />
      </AnimatedContent>

      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {industries.map((industry, index) => (
          <AnimatedContent key={industry.name} delay={index * 60} className="h-full">
            <MediaGridCard
              image={industry.image}
              alt={industry.name}
              title={industry.name}
              subtitle={industry.summary}
            />
          </AnimatedContent>
        ))}
      </div>
    </div>
  );
}
