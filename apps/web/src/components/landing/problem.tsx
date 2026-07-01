import { Section } from "./section";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";

const COSTS = [
  {
    fee: "Scattered",
    feePlain: "Scattered across channels",
    title: "Requests everywhere",
    body: "Invoices and payment requests land in inboxes, spreadsheets, and chats — with no single source of truth.",
  },
  {
    fee: "2x review",
    feePlain: "Reviewed twice",
    title: "Duplicated approvals",
    body: "Accounting checks it, then management checks it again, with no shared record of who approved what.",
  },
  {
    fee: "Manual",
    feePlain: "Manual execution",
    title: "Bank-by-bank execution",
    body: "Someone has to log into a different bank or provider for every country, every currency, every payout.",
  },
  {
    fee: "+1/country",
    feePlain: "One more provider per country",
    title: "The international multiplier",
    body: "Stripe to collect, Wise or Takenos to pay out, plus a local bank per country — each with its own fees and reconciliation.",
  },
];

export function Problem() {
  return (
    <Section id="problem">
      <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
        <Reveal>
          <h2 className="max-w-md text-balance font-display text-h2 font-medium leading-[1.08] tracking-[-0.02em] text-ink">
            Growth breaks your accounting process.
          </h2>
          <p className="mt-6 max-w-md text-pretty text-lead text-ink-muted">
            As a company scales, invoices and payment requests start arriving
            from everywhere — employees, suppliers, clients, emails,
            spreadsheets, different banks. Accounting checks amounts, due
            dates, and bank details. Management reviews it again and approves.
            Then someone still has to execute the payment manually, bank by
            bank, country by country.
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
                PHOTON replaces all of it with one flow.
              </span>{" "}
              From the moment an invoice arrives to the moment it's paid, every
              step lives in a single, auditable account.
            </p>
          </RevealItem>
        </RevealGroup>
      </div>
    </Section>
  );
}
