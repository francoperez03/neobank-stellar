import { Check, Minus } from "lucide-react";
import { Section } from "./section";
import { Reveal } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";

const ROWS = [
  { label: "Account maintenance", photon: "$0", bank: "$5 to $25 / mo" },
  { label: "Minimum balance", photon: "None", bank: "Often required" },
  { label: "Transfer settlement", photon: "Seconds", bank: "1 to 3 business days" },
  { label: "Per-transfer fee", photon: "Fractions of a cent", bank: "$0 to $35" },
  { label: "Custody of funds", photon: "Yours", bank: "Bank’s ledger" },
];

export function Pricing() {
  return (
    <Section id="pricing" className="border-y border-hairline bg-surface-deep">
      <Reveal>
        <h2 className="max-w-2xl text-balance font-display text-h2 font-medium leading-tight tracking-[-0.02em] text-ink">
          $0 to keep your money. Always.
        </h2>
      </Reveal>

      <Reveal delay={0.08}>
        <div className="mt-12 overflow-hidden rounded-2xl ring-1 ring-hairline">
          {/* header */}
          <div className="grid grid-cols-[1.4fr_1fr_1fr] bg-surface/60">
            <div className="px-5 py-4 font-mono text-xs uppercase tracking-[0.16em] text-ink-muted">
              What you pay for
            </div>
            <div className="px-5 py-4 text-center font-display text-base font-semibold text-accent">
              PHOTON
            </div>
            <div className="px-5 py-4 text-center font-mono text-xs uppercase tracking-[0.16em] text-ink-muted">
              Traditional bank
            </div>
          </div>

          {ROWS.map((r, i) => (
            <div
              key={r.label}
              className={cn(
                "grid grid-cols-[1.4fr_1fr_1fr] items-center border-t border-hairline",
                i % 2 ? "bg-bg" : "bg-surface/20"
              )}
            >
              <div className="px-5 py-4 text-sm text-ink">{r.label}</div>
              <div className="flex items-center justify-center gap-2 px-5 py-4 text-center text-sm font-medium tabular-nums text-ink">
                <Check className="size-4 shrink-0 text-accent" strokeWidth={2.4} />
                {r.photon}
              </div>
              <div className="flex items-center justify-center gap-2 px-5 py-4 text-center text-sm tabular-nums text-ink-muted">
                <Minus className="size-4 shrink-0 text-ink-muted" strokeWidth={2} />
                {r.bank}
              </div>
            </div>
          ))}
        </div>
      </Reveal>
    </Section>
  );
}
