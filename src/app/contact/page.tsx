import { locations, phoneNumbers } from "@/lib/site-data";

export const metadata = {
  title: "Contact | Barak Group",
  description: "Phone, email, and office locations for Barak Group in Oregon, Utah, and Idaho.",
};

export default function ContactPage() {
  return (
    <div className="container">
      <section className="hero" style={{ paddingBottom: "2.5rem" }}>
        <span className="hero-eyebrow">Reach out</span>
        <h1 className="hero-title">Contact</h1>
        <p className="hero-subtitle">
          Call the office near you, send a message below, or email us
          directly. We&apos;ll get back to you quickly.
        </p>
      </section>

      <section className="section" style={{ borderBottom: "none" }}>
        <div className="contact-grid">
          {/* Left: info */}
          <div>
            <div style={{ marginBottom: "2rem" }}>
              <p className="contact-label">Phone</p>
              {phoneNumbers.map((line) => (
                <div
                  key={line.state}
                  style={{
                    display: "flex",
                    gap: "1rem",
                    alignItems: "baseline",
                    marginBottom: "0.5rem",
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.8125rem",
                      color: "var(--color-ink-3)",
                      minWidth: "4rem",
                    }}
                  >
                    {line.state}
                  </span>
                  <a
                    href={line.href}
                    style={{
                      fontSize: "0.9375rem",
                      fontWeight: 600,
                      color: "var(--color-ink)",
                    }}
                  >
                    {line.phone}
                  </a>
                </div>
              ))}
            </div>

            <div style={{ marginBottom: "2.5rem" }}>
              <p className="contact-label">Email</p>
              <a
                href="mailto:barakgroupor@gmail.com"
                style={{
                  fontSize: "0.9375rem",
                  fontWeight: 600,
                  color: "var(--color-accent)",
                }}
              >
                barakgroupor@gmail.com
              </a>
            </div>

            <div>
              <p className="contact-label">Offices</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                {locations.map((loc) => (
                  <div key={loc.state}>
                    <p
                      style={{
                        fontSize: "0.875rem",
                        fontWeight: 700,
                        color: "var(--color-ink)",
                        marginBottom: "0.2rem",
                      }}
                    >
                      {loc.state}
                    </p>
                    <p style={{ fontSize: "0.875rem", color: "var(--color-ink-2)", marginBottom: "0.2rem" }}>
                      {loc.address}
                    </p>
                    <a href={loc.href} style={{ fontSize: "0.875rem", color: "var(--color-accent)" }}>
                      {loc.phone}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: form */}
          <div>
            <p className="contact-label">Send a message</p>
            <p
              style={{
                fontSize: "0.875rem",
                color: "var(--color-ink-2)",
                marginBottom: "1.5rem",
              }}
            >
              What needs cleaned, where the job is, and when you&apos;d like to start.
            </p>

            <form style={{ display: "flex", flexDirection: "column" }}>
              <div className="form-field">
                <label>Name</label>
                <input type="text" name="name" autoComplete="name" />
              </div>
              <div className="form-field">
                <label>Email</label>
                <input type="email" name="email" autoComplete="email" />
              </div>
              <div className="form-field">
                <label>Phone</label>
                <input type="tel" name="phone" autoComplete="tel" />
              </div>
              <div className="form-field">
                <label>Message</label>
                <textarea name="message" rows={5} />
              </div>
              <div>
                <button type="submit" className="btn-primary" style={{ cursor: "pointer", border: "none" }}>
                  Send message
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
