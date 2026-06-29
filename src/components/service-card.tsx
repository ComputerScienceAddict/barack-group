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
    <article>
      <div className="relative aspect-[3/2] overflow-hidden rounded-xl bg-[#0a0e1c]">
        <Image src={image} alt={imageAlt} fill className="object-cover" sizes="(max-width: 640px) 100vw, 50vw" />
      </div>
      <h3 className="mt-5 font-display text-2xl font-bold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
      <p className="mt-3 text-sm leading-6 text-slate-500">{bullets.join(" · ")}</p>
    </article>
  );
}
