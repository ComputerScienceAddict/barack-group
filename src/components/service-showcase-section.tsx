import Link from "next/link";
import { serviceHighlights } from "@/lib/site-data";

export function ServiceShowcaseSection() {
  return (
    <section className="barak-services-section">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="barak-services-header">
          <p className="barak-services-eyebrow">What we do</p>
          <h2 className="barak-services-title">Services we provide</h2>
          <p className="barak-services-desc">
            From daily office janitorial to stadium events and post-construction cleanup — crews
            staffed and managed by Barak Group.
          </p>
        </div>

        <div className="barak-services-grid">
          {serviceHighlights.map((service) => (
            <article key={service.title} className="barak-service-card">
              <div className="barak-service-card-image-wrap">
                <img
                  src={service.image}
                  alt={service.imageAlt}
                  className="barak-service-card-image"
                  loading="lazy"
                />
              </div>
              <div className="barak-service-card-body">
                <h3 className="barak-service-card-title">{service.title}</h3>
                <p className="barak-service-card-desc">{service.description}</p>
                <ul className="barak-service-card-bullets">
                  {service.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>

        <div className="barak-services-footer">
          <Link href="/services" className="barak-btn-secondary px-5 py-2.5 text-sm font-semibold">
            View all services
          </Link>
        </div>
      </div>
    </section>
  );
}
