import { ArrowRight } from "lucide-react";
import { Pill } from "@/components/ui/pill";
import { Reveal } from "@/components/motion/reveal";

export function ClosingCta() {
  return (
    <section id="cta" className="relative overflow-hidden px-5 py-28 sm:py-36">
      {/* yellow glow, bottom-center — bookends the hero */}
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-48 left-1/2 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full opacity-[0.16] blur-3xl"
        style={{ background: "radial-gradient(circle, #fdda24 0%, transparent 60%)" }}
      />
      <Reveal className="relative mx-auto flex max-w-3xl flex-col items-center text-center">
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-accent">
          Open in minutes
        </p>
        <h2 className="mt-5 text-balance font-display text-display font-medium leading-[1.04] tracking-[-0.02em] text-ink">
          One account for{" "}
          <span className="text-accent">every payout.</span>
        </h2>
        <p className="mt-6 max-w-xl text-pretty text-lead text-ink-muted">
          Open a PHOTON business account and start moving invoices, approvals,
          and payouts through a single flow, from day one.
        </p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Pill href="/app/auth" variant="primary">
            Open a business account <ArrowRight />
          </Pill>
          <Pill href="#how" variant="secondary">
            See how it works
          </Pill>
        </div>
      </Reveal>
    </section>
  );
}
