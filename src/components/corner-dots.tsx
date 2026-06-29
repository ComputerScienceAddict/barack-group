export function LitDivider({ className = "" }: { className?: string }) {
  return (
    <div className={`relative ${className}`} aria-hidden>
      <div className="h-px w-full bg-gradient-to-r from-transparent via-white/55 to-transparent" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent blur-[2px]" />
    </div>
  );
}
