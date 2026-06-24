import { useEffect } from "react";
import {
  animate,
  motion,
  useMotionValue,
  useTransform,
  useReducedMotion,
} from "motion/react";
import { ArrowDownToLine, ArrowUpFromLine, Zap } from "lucide-react";
import { DoubleBezel } from "@/components/ui/double-bezel";
import { EASE_OUT } from "@/lib/motion";

const TARGET = 12480;

/**
 * The hero account-card mock. Mostly still: a one-time entrance, the balance
 * counts up from 0 to its value on load, and the three actions glow on hover.
 */
export function HeroCard() {
  const reduced = useReducedMotion();
  const count = useMotionValue(reduced ? TARGET : 0);
  const balance = useTransform(count, (v) =>
    Math.round(v).toLocaleString("en-US")
  );

  useEffect(() => {
    if (reduced) return;
    const controls = animate(count, TARGET, {
      duration: 0.9,
      ease: "easeOut",
      delay: 0.35,
    });
    return () => controls.stop();
  }, [reduced, count]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, rotate: -1 }}
      animate={{ opacity: 1, y: 0, rotate: 0 }}
      transition={{ duration: 0.8, ease: EASE_OUT, delay: 0.25 }}
      className="relative"
    >
      {/* Static Stellar-yellow glow */}
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
            $<motion.span>{balance}</motion.span>
            <span className="text-ink-muted">.00</span>
          </p>
          <p className="mt-1 text-sm text-accent-2 tabular-nums">
            ≈ <motion.span>{balance}</motion.span> USDC
          </p>
        </div>

        <div className="mt-8 grid grid-cols-3 gap-2">
          {[
            { icon: ArrowDownToLine, label: "Deposit" },
            { icon: ArrowUpFromLine, label: "Withdraw" },
            { icon: Zap, label: "Pay" },
          ].map(({ icon: Icon, label }) => (
            <button
              key={label}
              type="button"
              className="flex cursor-pointer flex-col items-center gap-2 rounded-xl bg-surface/60 py-3 ring-1 ring-hairline outline-none transition-all duration-200 hover:bg-surface hover:ring-accent/45 hover:shadow-[0_6px_22px_-8px_#fdda2455] focus-visible:ring-accent/60"
            >
              <Icon className="size-4 text-accent" strokeWidth={1.8} />
              <span className="text-xs text-ink-muted">{label}</span>
            </button>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-hairline pt-4">
          <span className="text-sm text-ink-muted">Monthly maintenance fee</span>
          <span className="font-mono text-sm font-semibold text-accent">$0.00</span>
        </div>
      </DoubleBezel>
    </motion.div>
  );
}
