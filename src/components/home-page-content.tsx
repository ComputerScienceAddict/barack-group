"use client";

import { HomeHero } from "@/components/home-hero";
import { MediaGridCard } from "@/components/media-grid-card";
import { ServiceCard } from "@/components/service-card";
import { AnimatedContent } from "@/components/reactbits";
import { SectionHeading } from "@/components/section-heading";
import { galleryImages, industries, serviceHighlights, testimonials, type Testimonial } from "@/lib/site-data";

const avatarColors = ["bg-orange-500", "bg-emerald-600", "bg-violet-600"];

function YelpStars() {
  return (
    <div className="flex gap-0.5 text-[#d32323]" aria-label="5 out of 5 stars">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} viewBox="0 0 20 20" className="h-4 w-4 fill-current" aria-hidden>
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function YelpReview({ review, index }: { review: Testimonial; index: number }) {
  const initials = review.author
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const subtitle = review.company ?? review.role;

  return (
    <article className="h-full rounded-lg border border-neutral-200 bg-white p-5 text-left shadow-[0_1px_4px_rgba(0,0,0,0.08)]">
      <div className="flex items-start gap-3">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${avatarColors[index % avatarColors.length]}`}
        >
          {initials}
        </div>
        <div className="min-w-0">
          <p className="truncate font-semibold text-neutral-900">{review.author}</p>
          <p className="truncate text-xs text-neutral-500">{subtitle}</p>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <YelpStars />
        <span className="text-xs text-neutral-400">·</span>
        <span className="text-xs text-neutral-500">5 stars</span>
      </div>

      <p className="mt-3 text-[15px] leading-relaxed text-neutral-800">{review.quote}</p>
    </article>
  );
}

export function HomePageContent() {
  return (
    <>
      <HomeHero />

      {/* SERVICES */}
      <section className="relative bg-[#06080f] px-4 py-24 sm:px-6">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-600/30 to-transparent" />
        <div className="mx-auto w-full max-w-6xl">
          <AnimatedContent>
            <SectionHeading
              index="01"
              eyebrow="Services"
              title="What we do"
              description="Offices, apartments, job sites, and event venues."
              action={{ label: "All services", href: "/services" }}
            />
          </AnimatedContent>

          <div className="mt-12 grid gap-10 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-12">
            {serviceHighlights.map((service, index) => (
              <AnimatedContent key={service.title} delay={index * 60}>
                <ServiceCard {...service} />
              </AnimatedContent>
            ))}
          </div>
        </div>
      </section>

      {/* GALLERY */}
      <section className="relative bg-[#06080f] px-4 py-20 sm:px-6">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-600/30 to-transparent" />
        <div className="mx-auto w-full max-w-6xl">
          <AnimatedContent>
            <SectionHeading
              index="02"
              eyebrow="Gallery"
              title="On the job"
              description="Photos from sites across Oregon, Utah, and Idaho."
            />
          </AnimatedContent>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {galleryImages.map((src, index) => (
              <AnimatedContent key={src} delay={index * 40} className="h-full">
                <MediaGridCard image={src} alt={`Barak Group project photo ${index + 1}`} />
              </AnimatedContent>
            ))}
          </div>
        </div>
      </section>

      {/* INDUSTRIES */}
      <section className="relative bg-[#06080f] px-4 py-20 sm:px-6">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-600/30 to-transparent" />
        <div className="mx-auto w-full max-w-6xl">
          <AnimatedContent>
            <SectionHeading
              index="03"
              eyebrow="Industries"
              title="Where we work"
              description="Apartments, offices, stadiums, kitchens, and vacation rentals."
              action={{ label: "View all", href: "/industries" }}
            />
          </AnimatedContent>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {industries.map((industry, index) => (
              <AnimatedContent key={industry.name} delay={index * 50} className="h-full">
                <MediaGridCard
                  image={industry.image}
                  alt={industry.name}
                  title={industry.name}
                  subtitle={industry.summary}
                  href="/industries"
                />
              </AnimatedContent>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="relative bg-[#080c14] px-4 py-24 sm:px-6">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-600/30 to-transparent" />
        <div className="mx-auto w-full max-w-6xl">
          <AnimatedContent>
            <SectionHeading
              index="04"
              eyebrow="Reviews"
              title="What clients say"
              description="Recent feedback from facilities teams we work with."
            />
          </AnimatedContent>
          <div className="mt-14 grid gap-4 md:grid-cols-3">
            {testimonials.map((item, index) => (
              <AnimatedContent key={item.author} delay={index * 80}>
                <YelpReview review={item} index={index} />
              </AnimatedContent>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
