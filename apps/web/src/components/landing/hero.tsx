import { ArrowRight, ArrowDownToLine, ArrowUpFromLine, Zap } from "lucide-react";
import { motion } from "motion/react";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Pill } from "@/components/ui/pill";
import { DoubleBezel } from "@/components/ui/double-bezel";
import { Reveal } from "@/components/motion/reveal";
import { EASE_OUT } from "@/lib/motion";

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden px-5 pt-36 pb-20 sm:pt-44 sm:pb-28">
      {/* Stellar-yellow radial glow, top-center */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-[40rem] w-[40rem] -translate-x-1/2 rounded-full opacity-[0.18] blur-3xl"
        style={{ background: "radial-gradient(circle, #fdda24 0%, transparent 60%)" }}
      />

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

        {/* Account card mock */}
        <motion.div
          initial={{ opacity: 0, y: 30, rotate: -1 }}
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          transition={{ duration: 0.8, ease: EASE_OUT, delay: 0.25 }}
          className="relative"
        >
          <div
            aria-hidden
            className="photon-dot-glow absolute -right-10 -top-10 h-48 w-48 opacity-40"
          />
          <DoubleBezel radius="1.5rem" className="p-6 sm:p-8">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-ink-muted">
                PHOTON · Account
              </span>
              <Zap className="size-4 text-accent" strokeWidth={2} />
            </div>

            <div className="mt-8">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-ink-muted">
                Available balance
              </p>
              <p className="mt-2 font-display text-5xl font-medium tracking-tight text-ink tabular-nums">
                $12,480<span className="text-ink-muted">.00</span>
              </p>
              <p className="mt-1 text-sm text-accent-2">≈ 12,480 USDC</p>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-2">
              {[
                { icon: ArrowDownToLine, label: "Deposit" },
                { icon: ArrowUpFromLine, label: "Withdraw" },
                { icon: Zap, label: "Pay" },
              ].map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex flex-col items-center gap-2 rounded-xl bg-surface/60 py-3 ring-1 ring-hairline"
                >
                  <Icon className="size-4 text-accent" strokeWidth={1.8} />
                  <span className="text-xs text-ink-muted">{label}</span>
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-hairline pt-4">
              <span className="text-sm text-ink-muted">Monthly maintenance fee</span>
              <span className="font-mono text-sm font-semibold text-accent">$0.00</span>
            </div>
          </DoubleBezel>
        </motion.div>
      </div>
    </section>
  );
}
