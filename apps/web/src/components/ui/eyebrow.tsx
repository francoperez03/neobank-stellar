import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface EyebrowProps {
  children: ReactNode;
  className?: string;
}

/**
 * Section eyebrow: a small uppercase label with a leading Stellar-yellow square
 * bullet. Wide tracking, mono-ish for a technical feel.
 */
export function Eyebrow({ children, className }: EyebrowProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.22em] text-ink-muted",
        className
      )}
    >
      <span aria-hidden className="size-1.5 rounded-[2px] bg-accent" />
      {children}
    </span>
  );
}
