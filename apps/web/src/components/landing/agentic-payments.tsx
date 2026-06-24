import { Cpu, Globe } from "lucide-react";
import { Section } from "./section";
import { DoubleBezel } from "@/components/ui/double-bezel";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";

const PILLARS = [
  {
    icon: Cpu,
    name: "MPP",
    full: "Machine Payments Protocol",
    body: "The open standard from Stripe and Tempo that lets AI agents pay on their own, no checkout, no human in the loop.",
  },
  {
    icon: Globe,
    name: "x402",
    full: "The open HTTP 402 standard",
    body: "Pay for any API or resource the moment it asks for it. One request, settled, resource delivered.",
  },
];

// 402 payment handshake, the shape both MPP and x402 share.
const HANDSHAKE = [
  { who: "agent", dir: "out", text: "GET /api/compute" },
  { who: "server", dir: "in", text: "402 Payment Required", tag: "0.02 USDC" },
  { who: "agent", dir: "out", text: "pay from PHOTON", ok: true },
  { who: "server", dir: "in", text: "200 OK", tag: "resource delivered" },
];

export function AgenticPayments() {
  return (
    <Section id="pay">
      <div className="grid items-center gap-12 lg:grid-cols-[1fr_1fr] lg:gap-16">
        {/* Left: narrative + two pillars as rows (no card grid) */}
        <div>
          <Reveal>
            <h2 className="max-w-md text-balance font-display text-h2 font-medium leading-[1.1] tracking-[-0.02em] text-ink">
              Money your agents can spend.
            </h2>
            <p className="mt-5 max-w-md text-pretty text-lead text-ink-muted">
              PHOTON speaks the two open standards for machine payments, so an AI
              agent or a service can pay straight from your balance the instant it
              needs to, settled in USDC on Stellar.
            </p>
          </Reveal>

          <RevealGroup className="mt-10 flex flex-col">
            {PILLARS.map((p, i) => (
              <RevealItem
                key={p.name}
                className={
                  "flex gap-5 py-6" + (i > 0 ? " border-t border-hairline" : "")
                }
              >
                <p.icon
                  className="mt-1 size-6 shrink-0 text-accent"
                  strokeWidth={1.6}
                />
                <div>
                  <div className="flex items-baseline gap-2">
                    <h3 className="font-display text-xl font-medium text-ink">
                      {p.name}
                    </h3>
                    <span className="font-mono text-xs uppercase tracking-[0.14em] text-ink-muted">
                      {p.full}
                    </span>
                  </div>
                  <p className="mt-1.5 text-pretty text-sm leading-relaxed text-ink-muted">
                    {p.body}
                  </p>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>

        {/* Right: the 402 handshake, visualized */}
        <Reveal delay={0.1}>
          <div className="relative">
            <div
              aria-hidden
              className="photon-dot-glow absolute -right-8 -top-10 h-44 w-44 opacity-30"
            />
            <DoubleBezel radius="1.5rem" className="p-5 sm:p-6">
              <div className="flex items-center justify-between border-b border-hairline pb-4">
                <span className="font-mono text-xs uppercase tracking-[0.2em] text-ink-muted">
                  402 handshake
                </span>
                <span className="flex gap-1.5">
                  <span className="size-2 rounded-full bg-hairline-strong" />
                  <span className="size-2 rounded-full bg-hairline-strong" />
                  <span className="size-2 rounded-full bg-accent" />
                </span>
              </div>

              <ul className="mt-4 flex flex-col gap-3 font-mono text-sm">
                {HANDSHAKE.map((line, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <span className="w-14 shrink-0 text-xs uppercase tracking-[0.12em] text-ink-muted">
                      {line.who}
                    </span>
                    <span
                      aria-hidden
                      className={
                        "shrink-0 " +
                        (line.dir === "out" ? "text-accent-2" : "text-accent")
                      }
                    >
                      {line.dir === "out" ? "→" : "←"}
                    </span>
                    <span
                      className={
                        "tabular-nums " +
                        (line.dir === "in" && i === 1
                          ? "text-accent"
                          : line.ok
                            ? "text-ink"
                            : "text-ink")
                      }
                    >
                      {line.text}
                      {line.ok && <span className="ml-1.5 text-accent">✓</span>}
                    </span>
                    {line.tag && (
                      <span className="ml-auto rounded-md bg-surface px-2 py-0.5 text-xs text-ink-muted ring-1 ring-hairline">
                        {line.tag}
                      </span>
                    )}
                  </li>
                ))}
              </ul>

              <p className="mt-5 border-t border-hairline pt-4 text-xs leading-relaxed text-ink-muted">
                The same request, pay, deliver loop powers both MPP and x402.
                PHOTON sponsors the network fee, so the agent pays only the amount
                it was asked for.
              </p>
            </DoubleBezel>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
