import Link from "next/link";
import { industries } from "@/lib/site-data";

export function IndustriesPageContent() {
  return (
    <div className="container">
      <section className="hero" style={{ paddingBottom: "2.5rem" }}>
        <span className="hero-eyebrow">Who we serve</span>
        <h1 className="hero-title">Industries</h1>
        <p className="hero-subtitle">
          We work across environments where consistency, timing, and quality
          are non-negotiable. If it needs to be clean, we can help.
        </p>
      </section>

      <section className="section" style={{ borderBottom: "none" }}>
        <div className="industry-grid" style={{ marginTop: 0 }}>
          {industries.map((ind) => (
            <div key={ind.name} className="industry-item">
              <p className="industry-name">{ind.name}</p>
              <p className="industry-summary">{ind.summary}</p>
            </div>
          ))}
        </div>

        <div style={{ marginTop: "3rem", paddingTop: "2rem", borderTop: "1px solid var(--color-border)" }}>
          <p style={{ fontSize: "1rem", color: "var(--color-ink-2)", marginBottom: "1rem" }}>
            Don&apos;t see your industry? We likely serve it — reach out and let&apos;s talk.
          </p>
          <Link href="/contact" className="btn-primary">
            Get in touch
          </Link>
        </div>
      </section>
    </div>
  );
}
