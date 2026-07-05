import Link from "next/link";
import type { ReactNode } from "react";

type ButtonLinkProps = {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "white" | "header";
  size?: "sm" | "md" | "lg" | "header";
  className?: string;
  onClick?: () => void;
};

const variants = {
  primary:
    "border border-white/90 bg-white text-[#03050b] shadow-[0_1px_0_rgba(255,255,255,0.65)_inset,0_10px_28px_rgba(0,0,0,0.32)] hover:border-white hover:bg-slate-100 active:translate-y-px",
  secondary:
    "border border-white/18 bg-[#0a101c]/50 text-slate-200 hover:border-white/30 hover:bg-[#0d1528] active:translate-y-px",
  ghost: "text-slate-300 hover:bg-white/5 hover:text-white",
  white: "border border-white/90 bg-white text-slate-900 hover:bg-slate-100",
  header:
    "border border-white/90 bg-white text-[#03050b] shadow-[0_1px_0_rgba(255,255,255,0.5)_inset] hover:bg-slate-100 active:translate-y-px",
};

const sizes = {
  sm: "h-9 gap-1.5 px-4 text-xs",
  md: "h-11 gap-2 px-5 text-sm",
  lg: "h-12 gap-2.5 px-7 text-sm",
  header: "h-10 gap-2 px-5 text-sm",
};

export function ButtonLink({
  href,
  children,
  variant = "primary",
  size = "md",
  className = "",
  onClick,
}: ButtonLinkProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`inline-flex items-center justify-center rounded-md font-display font-semibold tracking-normal transition-all duration-200 ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </Link>
  );
}
