"use client";

import { AnimatedContent } from "@/components/reactbits";
import { SectionHeading } from "@/components/section-heading";
import { ServiceCard } from "@/components/service-card";
import { serviceHighlights } from "@/lib/site-data";

export function ServicesPageContent() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
      <AnimatedContent>
        <SectionHeading
          eyebrow="Services"
          title="What we do"
          description="Offices, apartments, job sites, and event venues."
        />
      </AnimatedContent>

      <div className="mt-12 grid items-stretch gap-10 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-12">
        {serviceHighlights.map((service, index) => (
          <AnimatedContent key={service.title} delay={index * 60} className="h-full">
            <ServiceCard {...service} />
          </AnimatedContent>
        ))}
      </div>
    </div>
  );
}
