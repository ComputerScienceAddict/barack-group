import Image from "next/image";
import Link from "next/link";

type MediaGridCardProps = {
  image: string;
  alt: string;
  title?: string;
  subtitle?: string;
  href?: string;
  className?: string;
};

export function MediaGridCard({
  image,
  alt,
  title,
  subtitle,
  href,
  className = "",
}: MediaGridCardProps) {
  const card = (
    <article
      className={`overflow-hidden rounded-2xl bg-[#0a0e1c] ring-1 ring-white/10 transition duration-300 hover:ring-blue-500/25 ${className}`}
    >
      <div className="relative aspect-[4/3]">
        <Image src={image} alt={alt} fill className="object-cover opacity-85 transition duration-300 hover:opacity-100" />
      </div>
      {title ? (
        <div className="border-t border-white/8 px-4 py-3.5">
          <h3 className="font-display text-lg font-bold text-white">{title}</h3>
          {subtitle ? <p className="mt-1 text-sm leading-5 text-slate-500">{subtitle}</p> : null}
        </div>
      ) : null}
    </article>
  );

  if (href) {
    return (
      <Link href={href} className="block h-full">
        {card}
      </Link>
    );
  }

  return card;
}
