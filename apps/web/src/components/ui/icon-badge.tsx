import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface IconBadgeProps {
  icon: LucideIcon;
  tone?: "accent" | "lavender" | "muted";
  className?: string;
}

const tones = {
  accent: "bg-accent/15 text-accent ring-accent/25",
  lavender: "bg-accent-2/15 text-accent-2 ring-accent-2/25",
  muted: "bg-surface text-ink ring-hairline",
} as const;

/** Rounded-square badge holding a single line icon. */
export function IconBadge({ icon: Icon, tone = "accent", className }: IconBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex size-11 items-center justify-center rounded-xl ring-1",
        tones[tone],
        className
      )}
    >
      <Icon className="size-5" strokeWidth={1.6} />
    </span>
  );
}
