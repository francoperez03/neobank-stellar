import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionProps {
  id?: string;
  children: ReactNode;
  className?: string;
  /** inner content max width */
  inner?: string;
}

/** Standard landing section: vertical rhythm + centered content column. */
export function Section({ id, children, className, inner }: SectionProps) {
  return (
    <section id={id} className={cn("relative px-5 py-20 sm:py-28", className)}>
      <div className={cn("mx-auto w-full max-w-6xl", inner)}>{children}</div>
    </section>
  );
}
