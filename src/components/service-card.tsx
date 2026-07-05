import Image from "next/image";

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
        <Image
          src={image}
          alt={imageAlt}
          fill
          className="object-cover opacity-[0.82] transition duration-700 group-hover:scale-[1.045] group-hover:opacity-100"
          sizes="(max-width: 640px) 100vw, 50vw"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-[#03050b] via-[#03050b]/26 to-transparent" />
      </div>

      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-display text-xl font-bold leading-tight tracking-tight text-white sm:min-h-[2.75rem] sm:text-[1.65rem]">
          {title}
        </h3>

        <p className="mt-3 flex-1 text-sm leading-6 text-slate-400 sm:min-h-[4.5rem]">
          {description}
        </p>

        <p className="mt-4 border-t border-white/8 pt-4 text-sm leading-relaxed text-slate-500 sm:min-h-[3.25rem]">
          {bullets.join(" · ")}
        </p>
      </div>
    </article>
  );
}
