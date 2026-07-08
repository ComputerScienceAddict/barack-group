import Link from "next/link";
import { serviceHighlights } from "@/lib/site-data";

export function ServicesPageContent() {
  return (
    <div className="container">
      <section className="hero" style={{ paddingBottom: "2.5rem" }}>
        <span className="hero-eyebrow">What we do</span>
        <h1 className="hero-title">Services</h1>
        <p className="hero-subtitle">
          Reliable facility services staffed and managed by Barak Group — so
          you can focus on running your business.
        </p>
      </section>

      <section className="section" style={{ borderBottom: "none" }}>
        <div className="service-list">
          {serviceHighlights.map((service) => (
            <div key={service.title} className="service-row">
              <div>
                <h2 className="service-title">{service.title}</h2>
                <p className="service-desc">{service.description}</p>
                <ul className="service-bullets">
                  {service.bullets.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              </div>
              <div />
            </div>
          ))}
        </div>

        <div style={{ marginTop: "3rem", paddingTop: "2rem", borderTop: "1px solid var(--color-border)" }}>
          <p style={{ fontSize: "1rem", color: "var(--color-ink-2)", marginBottom: "1rem" }}>
            Need something not listed here? We handle custom scopes — just ask.
          </p>
          <Link href="/contact" className="btn-primary">
            Request a quote
          </Link>
        </div>
      </section>
    </div>
  );
}
