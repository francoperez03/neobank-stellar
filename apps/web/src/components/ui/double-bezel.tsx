import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface DoubleBezelProps {
  children: ReactNode;
  className?: string;
  outerClassName?: string;
  radius?: "1.25rem" | "1.5rem" | "2rem";
}

/** Nested-border card: outer hairline ring + inset inner surface. */
export function DoubleBezel({
  children,
  className,
  outerClassName,
  radius = "1.5rem",
}: DoubleBezelProps) {
  const innerRadius = `calc(${radius} - 0.5rem)`;
  return (
    <div
      className={cn("bg-surface p-2 ring-1 ring-hairline", outerClassName)}
      style={{ borderRadius: radius }}
    >
      <div
        className={cn(
          "bg-bg shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)]",
          className
        )}
        style={{ borderRadius: innerRadius }}
      >
        {children}
      </div>
    </div>
  );
}
