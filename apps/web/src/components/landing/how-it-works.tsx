import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowDownToLine, ShieldCheck, Send } from "lucide-react";
import { Section } from "./section";
import { IconBadge } from "@/components/ui/icon-badge";
import { Reveal } from "@/components/motion/reveal";
import { EASE_OUT } from "@/lib/motion";
import { cn } from "@/lib/utils";

const STEPS = [
  {
    icon: ArrowDownToLine,
    tag: "Deposit",
    title: "You add funds.",
    body: "Top up by card, transfer, or crypto. PHOTON converts and holds your balance as USDC on Stellar, backed 1:1 and available instantly.",
  },
  {
    icon: ShieldCheck,
    tag: "Hold",
    title: "It just sits there. For free.",
    body: "Your money rests in a self-custodial stablecoin account. No maintenance fee, no minimum, no one charging you for the privilege of keeping it.",
  },
  {
    icon: Send,
    tag: "Spend or withdraw",
    title: "You move it in seconds.",
    body: "Pay across MPP and x402, or cash out to your bank whenever you like. Settlement on Stellar clears in seconds for fractions of a cent.",
  },
];

export function HowItWorks() {
  const reduced = useReducedMotion();
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (reduced || paused) return;
    const t = setInterval(() => setActive((a) => (a + 1) % STEPS.length), 4500);
    return () => clearInterval(t);
  }, [reduced, paused]);

  const step = STEPS[active] ?? STEPS[0]!;

  return (
    <Section id="how">
      <Reveal>
        <h2 className="max-w-2xl text-balance font-display text-h2 font-medium leading-tight tracking-[-0.02em] text-ink">
          Deposit, hold, move on.
        </h2>
      </Reveal>

      <div
        className="mt-12 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {/* Left: step list */}
        <ol className="flex flex-col gap-2">
          {STEPS.map((s, i) => {
            const on = i === active;
            return (
              <li key={s.tag}>
                <button
                  onClick={() => setActive(i)}
                  className={cn(
                    "flex w-full items-center gap-4 rounded-xl px-4 py-4 text-left transition-colors",
                    on ? "bg-surface ring-1 ring-hairline" : "hover:bg-surface/40"
                  )}
                >
                  <span
                    className={cn(
                      "font-mono text-sm tabular-nums transition-colors",
                      on ? "text-accent" : "text-ink-muted"
                    )}
                  >
                    0{i + 1}
                  </span>
                  <span
                    className={cn(
                      "font-display text-lg font-medium transition-colors",
                      on ? "text-ink" : "text-ink-muted"
                    )}
                  >
                    {s.tag}
                  </span>
                  {on && !reduced && (
                    <motion.span
                      layoutId="how-progress"
                      className="ml-auto h-1.5 w-1.5 rounded-full bg-accent"
                    />
                  )}
                </button>
              </li>
            );
          })}
        </ol>

        {/* Right: active panel */}
        <div className="relative min-h-[18rem] overflow-hidden rounded-2xl bg-surface/50 p-8 ring-1 ring-hairline sm:p-10">
          <div
            aria-hidden
            className="photon-dot-glow absolute -right-8 -top-8 h-40 w-40 opacity-30"
          />
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={reduced ? false : { opacity: 0, y: 16, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={reduced ? undefined : { opacity: 0, y: -12, filter: "blur(6px)" }}
              transition={{ duration: 0.4, ease: EASE_OUT }}
            >
              <IconBadge icon={step.icon} />
              <p className="mt-6 font-mono text-xs uppercase tracking-[0.2em] text-accent">
                Step 0{active + 1} · {step.tag}
              </p>
              <h3 className="mt-3 font-display text-3xl font-medium leading-tight tracking-tight text-ink">
                {step.title}
              </h3>
              <p className="mt-4 max-w-md text-base leading-relaxed text-ink-muted">
                {step.body}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </Section>
  );
}
