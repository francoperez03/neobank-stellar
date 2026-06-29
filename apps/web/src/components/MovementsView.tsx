"use client";

import { useMemo, useState } from "react";
import { ArrowDownLeft, ArrowLeftRight, ArrowUpRight, Search } from "lucide-react";
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

export function MovementsView() {
    const { movements, isLoading } = useMovements();
    const [query, setQuery] = useState("");

    // ponytail: filter client-side over the fetched list — small at demo volume.
    // Push the address filter to the API (?address=) if histories get large.
    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return movements;
        return movements.filter((m) => m.counterparty?.toLowerCase().includes(q));
    }, [movements, query]);

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
                            <MovementRow key={m.id} movement={m} />
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}

function MovementRow({ movement: m }: { movement: Movement }) {
    const { label, icon: Icon } = META[m.type];
    const date = fmtDate(m.createdAt);

    // On-brand signs (no red/green): inflow → lavender, neutral → muted, outflow → ink.
    const sign = m.sign === "+" ? "+" : m.sign === "-" ? "−" : "";
    const amountTone =
        m.sign === "+" ? "text-accent-2" : m.sign === "0" ? "text-ink-muted" : "text-ink";
    const iconTone =
        m.sign === "+" ? "text-accent-2" : m.sign === "0" ? "text-ink-muted" : "text-ink";

    return (
        <li className="flex items-center gap-4 py-3.5">
            <span
                className={cn(
                    "inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-surface/60 ring-1 ring-hairline",
                    iconTone,
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
                <p className={cn("text-sm font-medium tabular-nums", amountTone)}>
                    {sign}
                    {fmtAmount(m.amount)}
                </p>
                <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-ink-muted">
                    USDC
                </p>
            </div>
        </li>
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
