import { SiteImage } from "@/components/site-image";

type ServiceCardProps = {
  title: string;
  description: string;
  bullets: string[];
  image: string;
  imageAlt: string;
};

export function ServiceCard({ title, description, bullets, image, imageAlt }: ServiceCardProps) {
  return (
    <article className="service-card-modern group flex h-full flex-col">
      <div className="relative aspect-[4/3] shrink-0 overflow-hidden bg-[#050814]">
        <SiteImage
          src={image}
          alt={imageAlt}
          fill
          className="object-cover opacity-[0.82] transition duration-700 group-hover:scale-[1.045] group-hover:opacity-100"
          sizes="(max-width: 640px) 100vw, 50vw"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-[#03050b] via-[#03050b]/26 to-transparent" />
      </div>

      <div className="flex flex-1 flex-col p-6">
        <h3 className="text-[1.15rem] font-semibold leading-tight text-white sm:text-[1.3rem]">
          {title}
        </h3>

        <p className="mt-3 flex-1 text-sm leading-6 text-slate-300">
          {description}
        </p>

        <div className="mt-4 border-t border-white/10 pt-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">Includes</p>
          <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-slate-300 marker:text-slate-500">
            {bullets.map((bullet) => (
              <li key={bullet}>{bullet}</li>
            ))}
          </ul>
        </div>
      </div>
    </article>
  );
}
