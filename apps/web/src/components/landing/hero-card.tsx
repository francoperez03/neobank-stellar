import { useRef } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
} from "motion/react";
import { ArrowDownToLine, ArrowUpFromLine, Zap } from "lucide-react";
import { DoubleBezel } from "@/components/ui/double-bezel";
import { EASE_OUT } from "@/lib/motion";

const SPRING = { stiffness: 150, damping: 18, mass: 0.6 } as const;

/**
 * The hero account-card mock, alive:
 *   - one-time entrance (opacity / y / rotate)
 *   - idle breathe (slow y loop)
 *   - 3D tilt that follows the pointer (springed rotateX / rotateY)
 *   - a Stellar-yellow glow that pulses and parallaxes against the tilt
 *   - the status icon pulses
 * All loops + tilt are suppressed under prefers-reduced-motion.
 */
export function HeroCard() {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);

  // Pointer position, normalized to -0.5..0.5 over the card.
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const rotateX = useSpring(useTransform(py, [-0.5, 0.5], [7, -7]), SPRING);
  const rotateY = useSpring(useTransform(px, [-0.5, 0.5], [-7, 7]), SPRING);
  // Glow drifts opposite to the tilt for a sense of depth.
  const glowX = useSpring(useTransform(px, [-0.5, 0.5], [16, -16]), SPRING);
  const glowY = useSpring(useTransform(py, [-0.5, 0.5], [16, -16]), SPRING);

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    if (reduced) return;
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    px.set((e.clientX - r.left) / r.width - 0.5);
    py.set((e.clientY - r.top) / r.height - 0.5);
  }
  function onLeave() {
    px.set(0);
    py.set(0);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, rotate: -1 }}
      animate={{ opacity: 1, y: 0, rotate: 0 }}
      transition={{ duration: 0.8, ease: EASE_OUT, delay: 0.25 }}
      className="relative"
      style={{ perspective: 1000 }}
    >
      {/* Glow — pulses, and parallaxes against the tilt */}
      <motion.div
        aria-hidden
        className="photon-dot-glow absolute -right-10 -top-10 h-48 w-48"
        style={reduced ? { opacity: 0.4 } : { x: glowX, y: glowY }}
        animate={reduced ? undefined : { opacity: [0.25, 0.5, 0.25] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Idle breathe + pointer tilt wrapper */}
      <motion.div
        ref={ref}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        style={reduced ? undefined : { rotateX, rotateY, transformPerspective: 1000 }}
        animate={reduced ? undefined : { y: [0, -7, 0] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <DoubleBezel radius="1.5rem" className="p-6 sm:p-8">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-ink-muted">
              PHOTON · Account
            </span>
            <motion.span
              animate={reduced ? undefined : { opacity: [1, 0.5, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <Zap className="size-4 text-accent" strokeWidth={2} />
            </motion.span>
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
    </motion.div>
  );
}
