export function Crown({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 40" className={className} fill="currentColor" aria-hidden>
      <path d="M4 36 L10 12 L24 26 L32 6 L40 26 L54 12 L60 36 Z" />
      <circle cx="10" cy="8" r="4" />
      <circle cx="32" cy="3" r="4" />
      <circle cx="54" cy="8" r="4" />
    </svg>
  );
}

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2 select-none">
      <div className="relative">
        <Crown className={`${compact ? "w-7 h-7" : "w-9 h-9"} text-lima absolute -top-3 left-1/2 -translate-x-1/2`} />
        <span
          className={`font-display font-bold leading-none tracking-tight ${
            compact ? "text-xl" : "text-2xl md:text-3xl"
          }`}
        >
          EL REY
        </span>
      </div>
      <span
        className={`font-display font-bold leading-none tracking-tight text-lima ${
          compact ? "text-xl" : "text-2xl md:text-3xl"
        }`}
      >
        DEL PAN
      </span>
    </div>
  );
}
