import { SiteImage } from "@/components/site-image";
import Link from "next/link";

type MediaGridCardProps = {
  image: string;
  alt: string;
  title?: string;
  subtitle?: string;
  href?: string;
  index?: number;
  variant?: "gallery" | "industry";
  className?: string;
};

export function MediaGridCard({
  image,
  alt,
  title,
  subtitle,
  href,
  index,
  variant = "gallery",
  className = "",
}: MediaGridCardProps) {
  const isIndustry = variant === "industry" && title;

  const card = isIndustry ? (
    <article className={`media-card-industry group ${className}`}>
      <div className="relative aspect-[3/4] overflow-hidden sm:aspect-[4/5]">
        <SiteImage
          src={image}
          alt={alt}
          fill
          className="object-cover transition duration-700 group-hover:scale-[1.04]"
          sizes="(max-width: 640px) 100vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f1829]/95 via-[#0f1829]/35 to-[#0f1829]/10 transition duration-500 group-hover:via-[#0f1829]/45" />

        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
          <h3 className="font-display text-xl font-bold leading-tight tracking-tight text-white sm:text-2xl">
            {title}
          </h3>
          {subtitle ? (
            <p className="mt-2 max-w-[18rem] text-sm leading-6 text-slate-300">{subtitle}</p>
          ) : null}
          {href ? (
            <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 transition group-hover:gap-2.5 group-hover:text-white">
              Learn more
              <span aria-hidden>→</span>
            </span>
          ) : null}
        </div>
      </div>
    </article>
  ) : (
    <article className={`media-card-gallery group ${className}`}>
      <div className="relative aspect-[4/3] overflow-hidden">
        <SiteImage
          src={image}
          alt={alt}
          fill
          className="object-cover transition duration-700 group-hover:scale-[1.05]"
          sizes="(max-width: 640px) 100vw, 33vw"
        />
        <div className="absolute inset-0 bg-[#0f1829]/0 transition duration-500 group-hover:bg-[#0f1829]/20" />
        {typeof index === "number" ? (
          <span className="absolute left-4 top-4 font-display text-sm font-bold text-white/40 transition group-hover:text-white/70">
            {String(index + 1).padStart(2, "0")}
          </span>
        ) : null}
      </div>
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
