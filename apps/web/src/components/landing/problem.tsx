import { Section } from "./section";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";

const COSTS = [
  {
    fee: "$5+/mo",
    feePlain: "From $5 a month",
    title: "Account maintenance",
    body: "A monthly charge just for keeping your money parked, billed whether you touch the account or not.",
  },
  {
    fee: "Penalties",
    feePlain: "Penalties",
    title: "Minimum balance traps",
    body: "Drop below their threshold and the fees start. Your own liquidity, held hostage by fine print.",
  },
  {
    fee: "Days",
    feePlain: "Days to settle",
    title: "Slow, costly transfers",
    body: "Days to settle, cut-off times, and intermediaries skimming a cut of money that should move instantly.",
  },
];

export function Problem() {
  return (
    <Section id="problem">
      <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
        <Reveal>
          <h2 className="max-w-md text-balance font-display text-h2 font-medium leading-[1.08] tracking-[-0.02em] text-ink">
            Traditional banks charge you to keep your own money.
          </h2>
          <p className="mt-6 max-w-md text-pretty text-lead text-ink-muted">
            Maintenance fees, minimums, and slow rails quietly drain accounts
            every month. None of it keeps your money safer. All of it pads the
            bank’s margin.
          </p>
        </Reveal>

        {/* Row list — deliberately not a card grid */}
        <RevealGroup className="flex flex-col">
          {COSTS.map((c, i) => (
            <RevealItem
              key={c.title}
              className={
                "flex items-baseline gap-5 py-6 sm:gap-8" +
                (i > 0 ? " border-t border-hairline" : "")
              }
            >
              <span
                className="w-24 shrink-0 font-mono text-sm tabular-nums text-accent sm:w-28"
                aria-label={c.feePlain}
              >
                {c.fee}
              </span>
              <div>
                <h3 className="font-display text-xl font-medium text-ink">
                  {c.title}
                </h3>
                <p className="mt-1.5 text-pretty text-sm leading-relaxed text-ink-muted">
                  {c.body}
                </p>
              </div>
            </RevealItem>
          ))}

          <RevealItem className="mt-4 flex items-center gap-3 rounded-2xl bg-accent/10 p-5 ring-1 ring-accent/25">
            <span className="size-2 shrink-0 rounded-full bg-accent" />
            <p className="text-pretty text-sm text-ink sm:text-base">
              <span className="font-semibold text-accent">
                PHOTON charges none of it.
              </span>{" "}
              Hold, move, and spend your balance with zero maintenance cost, on
              open rails you can verify.
            </p>
          </RevealItem>
        </RevealGroup>
      </div>
    </Section>
  );
}
