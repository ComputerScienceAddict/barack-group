"use client";

import { useEffect, useState } from "react";
import { heroCarouselSlides } from "@/lib/site-data";

const INTERVAL_MS = 4500;

export function HeroImageCarousel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % heroCarouselSlides.length);
    }, INTERVAL_MS);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="barak-hero-carousel" aria-roledescription="carousel" aria-label="Barak Group work photos">
      {heroCarouselSlides.map((slide, slideIndex) => (
        <img
          key={slide.src}
          src={slide.src}
          alt={slide.alt}
          className={`barak-hero-carousel-slide ${slideIndex === index ? "is-active" : ""}`}
          aria-hidden={slideIndex !== index}
        />
      ))}

      <div className="barak-hero-carousel-dots">
        {heroCarouselSlides.map((slide, slideIndex) => (
          <button
            key={slide.src}
            type="button"
            className={`barak-hero-carousel-dot ${slideIndex === index ? "is-active" : ""}`}
            aria-label={`Show photo ${slideIndex + 1} of ${heroCarouselSlides.length}`}
            aria-current={slideIndex === index ? "true" : undefined}
            onClick={() => setIndex(slideIndex)}
          />
        ))}
      </div>
    </div>
  );
}
