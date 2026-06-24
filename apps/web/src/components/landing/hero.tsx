import { ArrowRight } from "lucide-react";
import {
  motion,
  useMotionValue,
  useSpring,
  useReducedMotion,
} from "motion/react";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Pill } from "@/components/ui/pill";
import { Reveal } from "@/components/motion/reveal";
import { HeroCard } from "./hero-card";
import { EASE_OUT } from "@/lib/motion";

const GLOW_SPRING = { stiffness: 60, damping: 20, mass: 0.8 } as const;

export function Hero() {
  const reduced = useReducedMotion();
  // Radial glow drifts a little with the pointer (parallax of light).
  const gx = useSpring(useMotionValue(0), GLOW_SPRING);
  const gy = useSpring(useMotionValue(0), GLOW_SPRING);

  function onMove(e: React.MouseEvent<HTMLElement>) {
    if (reduced) return;
    const r = e.currentTarget.getBoundingClientRect();
    gx.set(((e.clientX - r.left) / r.width - 0.5) * 40);
    gy.set(((e.clientY - r.top) / r.height - 0.5) * 24);
  }

  return (
    <section
      id="top"
      onMouseMove={onMove}
      className="relative overflow-hidden px-5 pt-36 pb-20 sm:pt-44 sm:pb-28"
    >
      {/* Stellar-yellow radial glow, top-center, drifts with the pointer */}
      <motion.div
        aria-hidden
        style={{ x: gx, y: gy }}
        className="pointer-events-none absolute -top-40 left-1/2 h-[40rem] w-[40rem] -translate-x-1/2 rounded-full opacity-[0.18] blur-3xl"
      >
        <div
          className="h-full w-full rounded-full"
          style={{ background: "radial-gradient(circle, #fdda24 0%, transparent 60%)" }}
        />
      </motion.div>

      <div className="relative mx-auto grid w-full max-w-6xl items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <Reveal>
            <Eyebrow>Neobank · Built on Stellar</Eyebrow>
          </Reveal>

          <motion.h1
            initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.7, ease: EASE_OUT, delay: 0.08 }}
            className="mt-5 text-balance font-display text-display font-medium leading-[1.02] tracking-[-0.02em] text-ink"
          >
            Banking that never charges you{" "}
            <span className="text-accent">to exist.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE_OUT, delay: 0.2 }}
            className="mt-6 max-w-xl text-pretty text-lead text-ink-muted"
          >
            PHOTON keeps your money in stablecoins on Stellar. No account
            maintenance, no minimums, no fee for holding your own money. Deposit,
            withdraw, and pay. Settled in seconds.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE_OUT, delay: 0.3 }}
            className="mt-9 flex flex-wrap items-center gap-3"
          >
            <Pill href="#cta" variant="primary">
              Open account <ArrowRight />
            </Pill>
            <Pill href="#how" variant="secondary">
              See how it works
            </Pill>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="mt-6 font-mono text-xs uppercase tracking-[0.18em] text-ink-muted"
          >
            $0 maintenance · self-custodial · USDC on Stellar
          </motion.p>
        </div>

        <HeroCard />
      </div>
    </section>
  );
}
