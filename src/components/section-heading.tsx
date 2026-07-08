import Link from "next/link";
import type { ReactNode } from "react";

type SectionHeadingProps = {
  index?: string;
  eyebrow?: string;
  title: string;
  description?: string;
  action?: { label: string; href: string };
  children?: ReactNode;
};

export function SectionHeading({ index, eyebrow, title, description, action, children }: SectionHeadingProps) {
  return (
    <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
      <div className="flex gap-4 sm:gap-5">
        {index ? (
          <span className="font-display text-5xl font-bold leading-none text-white/10 sm:text-7xl lg:text-8xl">{index}</span>
        ) : null}
        <div className="space-y-2">
          {eyebrow ? (
            <p className="font-display text-xs font-bold uppercase tracking-[0.2em] text-slate-500">{eyebrow}</p>
          ) : null}
          <h2 className="font-display text-3xl font-bold leading-[0.95] tracking-tight text-white sm:text-4xl lg:text-5xl">
            {title}
          </h2>
          {description ? <p className="max-w-xl text-base leading-7 text-slate-400">{description}</p> : null}
          {children}
        </div>
      </div>
      {action ? (
        <Link
          href={action.href}
          className="shrink-0 text-sm font-semibold text-slate-300 transition hover:text-white"
        >
          {action.label} →
        </Link>
      ) : null}
    </div>
  );
}
