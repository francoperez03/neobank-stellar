"use client";

import { useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import {
    ArrowDownLeft,
    ArrowLeft,
    ArrowLeftRight,
    ArrowUpRight,
    Check,
    ChevronRight,
    Copy,
    ExternalLink,
    Search,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useMovements } from "@/hooks/use-movements";
import type { Movement, MovementType } from "@/lib/movements";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Input } from "@/components/ui/input";
import { cn, truncateAddress } from "@/lib/utils";

const META: Record<MovementType, { label: string; icon: LucideIcon }> = {
    deposit: { label: "Deposit received", icon: ArrowDownLeft },
    treasury_deposit: { label: "Treasury deposit", icon: ArrowDownLeft },
    send: { label: "Send", icon: ArrowUpRight },
    pay: { label: "Pay outflow", icon: ArrowUpRight },
    treasury_transfer: { label: "Treasury transfer", icon: ArrowLeftRight },
};

const fmtAmount = (n: string) =>
    Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const fmtDate = (iso: string) => {
    const d = new Date(iso);
    return Number.isNaN(d.getTime())
        ? ""
        : d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const fmtDateTime = (iso: string) => {
    const d = new Date(iso);
    return Number.isNaN(d.getTime())
        ? "—"
        : d.toLocaleString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
          });
};

// On-brand signs (no red/green): inflow → lavender, neutral → muted, outflow → ink.
const signText = (s: Movement["sign"]) => (s === "+" ? "+" : s === "-" ? "−" : "");
const signTone = (s: Movement["sign"]) =>
    s === "+" ? "text-accent-2" : s === "0" ? "text-ink-muted" : "text-ink";

export function MovementsView() {
    const { movements, isLoading } = useMovements();
    const [query, setQuery] = useState("");
    const [selected, setSelected] = useState<Movement | null>(null);

    // ponytail: filter client-side over the fetched list — small at demo volume.
    // Push the address filter to the API (?address=) if histories get large.
    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return movements;
        return movements.filter((m) => m.counterparty?.toLowerCase().includes(q));
    }, [movements, query]);

    if (selected) {
        return <MovementDetail movement={selected} onBack={() => setSelected(null)} />;
    }

    return (
        <div>
            <Eyebrow>Activity</Eyebrow>
            <h2 className="mt-3 font-display text-2xl font-medium tracking-tight text-ink">
                Movements
            </h2>
            <p className="mt-2 text-sm text-ink-muted">
                Deposits, sends, treasury moves and payouts. Search by the address you interacted with.
            </p>

            <div className="relative mt-6">
                <Search
                    className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted"
                    strokeWidth={1.8}
                />
                <Input
                    type="search"
                    className="h-11 border-transparent bg-surface/50 pl-9 font-mono text-sm ring-1 ring-hairline focus-visible:ring-accent/50"
                    placeholder="Search by address (G…)"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    autoComplete="off"
                    spellCheck={false}
                    aria-label="Search movements by counterparty address"
                />
            </div>

            <div className="mt-6">
                {isLoading ? (
                    <SkeletonRows />
                ) : filtered.length === 0 ? (
                    <p className="py-12 text-center text-sm text-ink-muted">
                        {query ? "No movements match that address." : "No movements yet."}
                    </p>
                ) : (
                    <ul className="divide-y divide-hairline">
                        {filtered.map((m) => (
                            <MovementRow key={m.id} movement={m} onSelect={() => setSelected(m)} />
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}

function MovementRow({ movement: m, onSelect }: { movement: Movement; onSelect: () => void }) {
    const { label, icon: Icon } = META[m.type];
    const date = fmtDate(m.createdAt);

    return (
        <li>
            <button
                type="button"
                onClick={onSelect}
                className="group flex w-full cursor-pointer items-center gap-4 rounded-xl px-2 py-3.5 text-left outline-none transition-colors hover:bg-surface/40 focus-visible:ring-2 focus-visible:ring-accent/50"
                aria-label={`${m.label ?? label} — view detail`}
            >
                <span
                    className={cn(
                        "inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-surface/60 ring-1 ring-hairline",
                        signTone(m.sign),
                    )}
                >
                    <Icon className="size-4" strokeWidth={1.8} />
                </span>

                <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink">{m.label ?? label}</p>
                    <p className="mt-0.5 truncate font-mono text-xs text-ink-muted">
                        {m.counterparty ? truncateAddress(m.counterparty) : label}
                        {date && <span className="text-ink-muted"> · {date}</span>}
                    </p>
                </div>

                <div className="shrink-0 text-right">
                    <p className={cn("text-sm font-medium tabular-nums", signTone(m.sign))}>
                        {signText(m.sign)}
                        {fmtAmount(m.amount)}
                    </p>
                    <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-ink-muted">
                        USDC
                    </p>
                </div>

                <ChevronRight
                    className="size-4 shrink-0 text-ink-muted/60 transition-transform group-hover:translate-x-0.5 group-hover:text-ink-muted"
                    strokeWidth={1.8}
                />
            </button>
        </li>
    );
}

function MovementDetail({ movement: m, onBack }: { movement: Movement; onBack: () => void }) {
    const { label, icon: Icon } = META[m.type];
    const isInternal = m.type === "treasury_transfer" || m.type === "treasury_deposit";
    const explorerLink = m.txId
        ? `https://stellar.expert/explorer/testnet/tx/${m.txId}`
        : null;

    return (
        <div>
            <button
                type="button"
                onClick={onBack}
                className="inline-flex cursor-pointer items-center gap-1.5 text-sm text-ink-muted outline-none transition-colors hover:text-ink focus-visible:text-ink"
            >
                <ArrowLeft className="size-4" strokeWidth={1.8} />
                Back to movements
            </button>

            <div className="mt-6 flex items-center gap-4">
                <span
                    className={cn(
                        "inline-flex size-12 shrink-0 items-center justify-center rounded-2xl bg-surface/60 ring-1 ring-hairline",
                        signTone(m.sign),
                    )}
                >
                    <Icon className="size-5" strokeWidth={1.8} />
                </span>
                <div className="min-w-0">
                    <Eyebrow>{label}</Eyebrow>
                    <p className={cn("mt-1 font-display text-3xl font-medium tracking-tight tabular-nums", signTone(m.sign))}>
                        {signText(m.sign)}
                        {fmtAmount(m.amount)}
                        <span className="ml-2 align-middle font-sans text-sm font-normal text-ink-muted">USDC</span>
                    </p>
                </div>
            </div>

            {m.sign === "0" && (
                <p className="mt-4 rounded-xl bg-surface/40 px-4 py-3 text-sm text-ink-muted ring-1 ring-hairline">
                    Internal reallocation between treasury buckets — funds stayed in your treasury,
                    so this is neither an inflow nor an outflow.
                </p>
            )}

            <dl className="mt-8 divide-y divide-hairline">
                <Field term="Operation" desc={m.label ?? label} />
                <Field term="Type" desc={label} />
                <Field term="Date" desc={fmtDateTime(m.createdAt)} />
                {m.method && <Field term="Method" desc={m.method} className="capitalize" />}
                <Field
                    term="Counterparty"
                    desc={
                        m.counterparty ? (
                            <CopyValue value={m.counterparty} />
                        ) : (
                            <span className="text-ink-muted">{isInternal ? "Internal — your treasury" : "—"}</span>
                        )
                    }
                />
                <Field
                    term="Transaction"
                    desc={
                        m.txId ? (
                            <span className="flex flex-wrap items-center gap-3">
                                <CopyValue value={m.txId} display={truncateAddress(m.txId, 8, 8)} />
                                {explorerLink && (
                                    <a
                                        href={explorerLink}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-1 text-xs font-medium text-accent outline-none hover:underline focus-visible:underline"
                                    >
                                        Explorer <ExternalLink className="size-3" />
                                    </a>
                                )}
                            </span>
                        ) : (
                            <span className="text-ink-muted">No on-chain transaction</span>
                        )
                    }
                />
            </dl>
        </div>
    );
}

function Field({
    term,
    desc,
    className,
}: {
    term: string;
    desc: ReactNode;
    className?: string;
}) {
    return (
        <div className="flex items-start justify-between gap-6 py-3.5">
            <dt className="font-mono text-xs uppercase tracking-[0.2em] text-ink-muted">{term}</dt>
            <dd className={cn("min-w-0 break-words text-right text-sm text-ink", className)}>{desc}</dd>
        </div>
    );
}

function CopyValue({ value, display }: { value: string; display?: string }) {
    const [copied, setCopied] = useState(false);
    const copy = async () => {
        try {
            await navigator.clipboard.writeText(value);
            setCopied(true);
            toast.success("Copied");
            setTimeout(() => setCopied(false), 1500);
        } catch {
            toast.error("Could not copy");
        }
    };
    return (
        <button
            type="button"
            onClick={copy}
            className="inline-flex max-w-full cursor-pointer items-center gap-1.5 font-mono text-sm text-ink outline-none transition-colors hover:text-accent focus-visible:text-accent"
            title={value}
        >
            <span className="truncate">{display ?? value}</span>
            {copied ? (
                <Check className="size-3.5 shrink-0 text-accent" strokeWidth={2} />
            ) : (
                <Copy className="size-3.5 shrink-0 opacity-60" strokeWidth={1.8} />
            )}
        </button>
    );
}

function SkeletonRows() {
    return (
        <ul className="divide-y divide-hairline" aria-hidden>
            {[0, 1, 2, 3].map((i) => (
                <li key={i} className="flex items-center gap-4 py-3.5">
                    <span className="size-10 shrink-0 animate-pulse rounded-xl bg-surface/60" />
                    <div className="flex-1 space-y-2">
                        <span className="block h-3 w-32 animate-pulse rounded bg-surface/60" />
                        <span className="block h-2.5 w-24 animate-pulse rounded bg-surface/40" />
                    </div>
                    <span className="h-3 w-16 animate-pulse rounded bg-surface/60" />
                </li>
            ))}
        </ul>
    );
}
