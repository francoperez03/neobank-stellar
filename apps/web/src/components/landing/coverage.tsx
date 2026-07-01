import { Section } from "./section";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";

const COUNTRIES = [
  { code: "AR", name: "Argentina" },
  { code: "BR", name: "Brazil" },
  { code: "MX", name: "Mexico" },
  { code: "CO", name: "Colombia" },
];

export function Coverage() {
  return (
    <Section id="coverage" className="border-y border-hairline bg-surface-deep">
      <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
        <Reveal>
          <h2 className="max-w-md text-balance font-display text-h2 font-medium leading-[1.08] tracking-[-0.02em] text-ink">
            Local payouts, without local accounts.
          </h2>
          <p className="mt-6 max-w-md text-pretty text-lead text-ink-muted">
            PHOTON runs on Stellar under the hood — a global, programmable
            account. Nobody on the other end needs to know that. Your team
            signs in with Google. No wallets, no seed phrases, no private
            keys to manage.
          </p>
        </Reveal>

        <RevealGroup className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {COUNTRIES.map((c) => (
            <RevealItem
              key={c.code}
              className="flex flex-col items-center gap-2 rounded-2xl bg-surface/40 py-8 ring-1 ring-hairline"
            >
              <span className="font-mono text-xs uppercase tracking-[0.16em] text-accent">
                {c.code}
              </span>
              <span className="font-display text-lg font-medium text-ink">
                {c.name}
              </span>
              <span className="text-xs text-ink-muted">Local payout</span>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>

      <p className="mt-8 text-sm text-ink-muted">More of Latin America next.</p>
    </Section>
  );
}
