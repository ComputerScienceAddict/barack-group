import Link from "next/link";
import type { ReactNode } from "react";

type ButtonLinkProps = {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "white";
  size?: "sm" | "md" | "lg";
  className?: string;
};

const variants = {
  primary:
    "bg-white text-[#06080f] shadow-[0_4px_24px_rgba(0,0,0,0.35)] hover:bg-slate-100 hover:shadow-[0_6px_28px_rgba(0,0,0,0.4)] active:scale-[0.98]",
  secondary:
    "bg-transparent text-slate-200 ring-1 ring-inset ring-white/20 hover:bg-white/[0.06] hover:text-white hover:ring-white/35 active:scale-[0.98]",
  ghost: "text-slate-300 hover:bg-white/5 hover:text-white",
  white: "bg-white text-slate-900 hover:bg-slate-100",
};

const sizes = {
  sm: "h-9 gap-1.5 px-4 text-sm",
  md: "h-11 gap-2 px-5 text-sm",
  lg: "h-12 gap-2 px-7 text-[15px] font-semibold tracking-wide",
};

export function ButtonLink({
  href,
  children,
  variant = "primary",
  size = "md",
  className = "",
}: ButtonLinkProps) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center rounded-full font-medium transition-all duration-200 ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </Link>
  );
}
