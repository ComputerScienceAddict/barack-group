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
  primary: "bg-blue-600 text-white hover:bg-blue-500 active:bg-blue-700",
  secondary: "border border-white/20 text-white hover:border-white/40 hover:bg-white/5",
  ghost: "text-slate-300 hover:text-white hover:bg-white/5",
  white: "bg-white text-slate-900 hover:bg-slate-100",
};

const sizes = {
  sm: "h-9 px-4 text-sm",
  md: "h-10 px-5 text-sm",
  lg: "h-11 px-6 text-sm",
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
      className={`inline-flex items-center justify-center rounded-lg font-medium transition-colors ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </Link>
  );
}
