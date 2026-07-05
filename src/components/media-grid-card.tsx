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
    <article className={`industry-card group ${className}`}>
      <div className="relative aspect-[4/3] overflow-hidden bg-[#050814]">
        <Image
          src={image}
          alt={alt}
          fill
          className="object-cover opacity-[0.88] transition duration-500 group-hover:scale-[1.03] group-hover:opacity-100"
          sizes="(max-width: 640px) 100vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#03050b]/75 via-[#03050b]/10 to-transparent" />
      </div>

      {title ? (
        <div className="relative border-t border-white/8 px-5 py-4">
          <h3 className="font-display text-lg font-bold leading-snug tracking-tight text-white">
            {title}
          </h3>
          {subtitle ? (
            <p className="mt-1.5 text-sm leading-6 text-slate-400">{subtitle}</p>
          ) : null}
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
