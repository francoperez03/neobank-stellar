import { PhotonMark } from "@/components/brand/photon-mark";

const LINKS = [
  { label: "Why PHOTON", href: "#problem" },
  { label: "How it works", href: "#how" },
  { label: "Agent payments", href: "#pay" },
  { label: "Pricing", href: "#pricing" },
];

export function Footer() {
  return (
    <footer className="border-t border-hairline bg-surface-deep px-5 py-14">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="inline-flex items-center gap-2">
            <PhotonMark className="size-6 text-accent" />
            <span className="text-[1.05rem] font-semibold tracking-[0.18em] text-ink">
              PHOTON
            </span>
          </span>
          <p className="mt-3 max-w-xs text-sm text-ink-muted">
            A neobank with no maintenance fees, built on Stellar.
          </p>
          <p className="mt-4 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] text-ink-muted">
            <span className="size-1.5 rounded-full bg-accent" />
            Built on Stellar
          </p>
        </div>

        <nav className="flex flex-wrap gap-x-8 gap-y-3">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm text-ink-muted transition-colors hover:text-ink"
            >
              {l.label}
            </a>
          ))}
        </nav>
      </div>

      <div className="mx-auto mt-10 w-full max-w-6xl border-t border-hairline pt-6">
        <p className="text-xs text-ink-muted">
          © 2026 PHOTON. Self-custodial. USDC settled on Stellar. Not a bank;
          banking-style services provided through stablecoin rails.
        </p>
      </div>
    </footer>
  );
}
