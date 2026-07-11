import { SuppliesRequestForm } from "@/components/supplies-request-form";

export const metadata = {
  title: "Supplies Request | Barak Group",
  description: "Submit a supplies request with your name, location, and item list.",
};

export default function SuppliesRequestPage() {
  return (
    <div className="container">
      <section className="hero" style={{ paddingBottom: "2.5rem" }}>
        <span className="hero-eyebrow">Internal request</span>
        <h1 className="hero-title">Supplies request</h1>
        <p className="hero-subtitle">
          Add each supply you need, review the list, and submit. We&apos;ll email the request to the
          supplies team.
        </p>
      </section>

      <section className="section supplies-request-section">
        <SuppliesRequestForm />
      </section>
    </div>
  );
}
