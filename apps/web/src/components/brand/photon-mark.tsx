import { cn } from "@/lib/utils";

/**
 * PHOTON mark — a particle of light: a bright core with two orbit rings.
 * Drawn in currentColor so it inherits the accent / ink context.
 */
export function PhotonMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden
      className={cn("size-7", className)}
    >
      <ellipse
        cx="16"
        cy="16"
        rx="14"
        ry="6"
        stroke="currentColor"
        strokeWidth="1.6"
        opacity="0.55"
      />
      <ellipse
        cx="16"
        cy="16"
        rx="14"
        ry="6"
        stroke="currentColor"
        strokeWidth="1.6"
        opacity="0.55"
        transform="rotate(60 16 16)"
      />
      <circle cx="16" cy="16" r="4.5" fill="currentColor" />
    </svg>
  );
}

export function PhotonWordmark({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <PhotonMark className="size-6 text-accent" />
      <span className="text-[1.05rem] font-semibold tracking-[0.18em] text-ink">
        PHOTON
      </span>
    </span>
  );
}
