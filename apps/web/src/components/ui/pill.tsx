import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary";

const base =
  "group inline-flex cursor-pointer items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium tracking-tight transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0";

const variants: Record<Variant, string> = {
  // Stellar-yellow fill, black ink — the primary action. Glows on hover (no movement).
  primary:
    "bg-accent text-[#0f0f0f] hover:bg-accent-soft hover:shadow-[0_0_0_1px_#fdda24aa,0_10px_30px_-6px_#fdda2466]",
  // Hairline outline over the dark canvas — the quiet action. Soft glow on hover.
  secondary:
    "bg-surface/40 text-ink ring-1 ring-hairline-strong hover:bg-surface hover:ring-accent/50 hover:shadow-[0_8px_24px_-8px_#fdda2433]",
};

interface PillBaseProps {
  variant?: Variant;
  children: ReactNode;
  className?: string;
}

type PillProps =
  | (PillBaseProps & { href: string } & ComponentPropsWithoutRef<"a">)
  | (PillBaseProps & { href?: undefined } & ComponentPropsWithoutRef<"button">);

export function Pill({ variant = "primary", className, children, ...rest }: PillProps) {
  if ("href" in rest && rest.href) {
    return (
      <a className={cn(base, variants[variant], className)} {...(rest as ComponentPropsWithoutRef<"a">)}>
        {children}
      </a>
    );
  }
  return (
    <button className={cn(base, variants[variant], className)} {...(rest as ComponentPropsWithoutRef<"button">)}>
      {children}
    </button>
  );
}
