import { SectionHeading } from "@/components/section-heading";
import { locations, phoneNumbers } from "@/lib/site-data";

export const metadata = {
  title: "Contact | Barak Group",
  description: "Phone, email, and office locations for Barak Group in Oregon, Utah, and Idaho.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6 lg:py-20">
      <SectionHeading
        eyebrow="Contact"
        title="Get in touch"
        description="Call the office near you, email us, or send a message below."
      />

      <div className="mt-10 space-y-8 border-y border-white/10 py-10">
        <div>
          <h2 className="text-sm font-semibold text-white">Phone</h2>
          <ul className="mt-3 space-y-2">
            {phoneNumbers.map((line) => (
              <li key={line.state} className="flex flex-wrap items-baseline gap-x-3 text-sm">
                <span className="w-14 text-slate-500">{line.state}</span>
                <a href={line.href} className="font-medium tabular-nums text-white hover:text-blue-300">
                  {line.phone}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-white">Email</h2>
          <a
            href="mailto:barakgroupor@gmail.com"
            className="mt-3 inline-block text-sm font-medium text-white hover:text-blue-300"
          >
            barakgroupor@gmail.com
          </a>
        </div>
      </div>

      <section id="quote" className="mt-10">
        <h2 className="font-display text-2xl font-bold text-white">Send a message</h2>
        <p className="mt-2 text-sm text-slate-400">
          What needs cleaned, where the job is, and when you want to start.
        </p>

        <form className="mt-6 space-y-5">
          <label className="block">
            <span className="mb-1.5 block text-sm text-slate-400">Name</span>
            <input
              type="text"
              name="name"
              autoComplete="name"
              className="w-full rounded-lg bg-[#0a0e1c] px-3 py-2.5 text-sm text-white outline-none ring-1 ring-white/10 focus:ring-blue-500/40"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm text-slate-400">Email</span>
            <input
              type="email"
              name="email"
              autoComplete="email"
              className="w-full rounded-lg bg-[#0a0e1c] px-3 py-2.5 text-sm text-white outline-none ring-1 ring-white/10 focus:ring-blue-500/40"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm text-slate-400">Phone</span>
            <input
              type="tel"
              name="phone"
              autoComplete="tel"
              className="w-full rounded-lg bg-[#0a0e1c] px-3 py-2.5 text-sm text-white outline-none ring-1 ring-white/10 focus:ring-blue-500/40"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm text-slate-400">Message</span>
            <textarea
              name="message"
              rows={5}
              className="w-full rounded-lg bg-[#0a0e1c] px-3 py-2.5 text-sm text-white outline-none ring-1 ring-white/10 focus:ring-blue-500/40"
            />
          </label>
          <button
            type="submit"
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-500"
          >
            Send
          </button>
        </form>
      </section>

      <section className="mt-14 border-t border-white/10 pt-10">
        <h2 className="font-display text-xl font-bold text-white">Offices</h2>
        <ul className="mt-6 divide-y divide-white/10">
          {locations.map((location) => (
            <li key={location.state} className="py-5 first:pt-0">
              <p className="text-sm font-medium text-white">{location.state}</p>
              <p className="mt-1 text-sm leading-6 text-slate-400">{location.address}</p>
              <a href={location.href} className="mt-2 inline-block text-sm text-blue-300 hover:text-blue-200">
                {location.phone}
              </a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
