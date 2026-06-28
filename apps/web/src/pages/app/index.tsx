import { useState } from "react";
import { BalanceCard, type DashboardPanel } from "@/components/BalanceCard";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Reveal } from "@/components/motion/reveal";

export function AppIndexPage() {
  const [activePanel, setActivePanel] = useState<DashboardPanel | null>(null);

  // Accordion: tapping the active action collapses it; another switches content.
  const toggle = (panel: DashboardPanel) =>
    setActivePanel((current) => (current === panel ? null : panel));

  return (
    <main className="relative overflow-hidden">
      {/* Stellar-yellow glow at top center, same treatment as the landing hero. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-[40rem] w-[40rem] -translate-x-1/2 rounded-full opacity-[0.18] blur-3xl"
        style={{ background: "radial-gradient(circle, #fdda24 0%, transparent 60%)" }}
      />

      <div className="relative mx-auto w-full max-w-2xl px-5 py-16">
        <Reveal>
          <Eyebrow>Your account</Eyebrow>
          <h1 className="mt-3 font-display text-3xl font-medium tracking-tight text-ink sm:text-4xl">
            Overview
          </h1>
        </Reveal>

        <div className="mt-10">
          <Reveal delay={0.08}>
            <BalanceCard activePanel={activePanel} onToggle={toggle} />
          </Reveal>
        </div>
      </div>
    </main>
  );
}
