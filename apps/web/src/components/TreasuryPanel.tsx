"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowLeft, ChevronRight, Landmark, Plus, ShieldCheck, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Pill } from "@/components/ui/pill";
import { IconBadge } from "@/components/ui/icon-badge";
import { SavingsProjectionChart } from "@/components/SavingsProjectionChart";
import { EASE_OUT } from "@/lib/motion";

interface Allocation {
    id: string;
    name: string;
    balance: number;
    apy: number;
}

// Mocked treasury allocations — staging has no real yield product yet.
// Corporate-treasury naming, not consumer savings goals.
const MOCK_ALLOCATIONS: Allocation[] = [
    { id: "operating", name: "Operating reserve", balance: 3200, apy: 4.5 },
    { id: "tax", name: "Tax provision", balance: 1450, apy: 3.8 },
    { id: "payroll", name: "Payroll buffer", balance: 980, apy: 4.2 },
];

const fmt = (n: number) =>
    n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function TreasuryPanel() {
    const reduced = useReducedMotion();
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const total = MOCK_ALLOCATIONS.reduce((sum, a) => sum + a.balance, 0);
    const selected = MOCK_ALLOCATIONS.find((a) => a.id === selectedId) ?? null;

    // Forward (open detail) enters from the right; back exits to the right.
    // Reduced motion collapses both to a plain crossfade.
    const slide = (dir: 1 | -1) =>
        reduced
            ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
            : {
                  initial: { opacity: 0, x: dir * 32 },
                  animate: { opacity: 1, x: 0 },
                  exit: { opacity: 0, x: dir * -32 },
              };

    return (
        <div className="overflow-hidden">
            {/* Header swaps label + total for a back affordance in detail view. */}
            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                    {selected ? (
                        <button
                            type="button"
                            onClick={() => setSelectedId(null)}
                            className="group inline-flex cursor-pointer items-center gap-1.5 text-sm text-ink-muted outline-none transition-colors hover:text-ink focus-visible:text-ink"
                        >
                            <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
                            All allocations
                        </button>
                    ) : (
                        <Eyebrow>Treasury</Eyebrow>
                    )}
                    <h2 className="mt-3 truncate font-display text-2xl font-medium tracking-tight text-ink">
                        {selected ? selected.name : "Treasury"}
                    </h2>
                </div>
                <div className="shrink-0 text-right">
                    <p className="font-mono text-xs uppercase tracking-[0.2em] text-ink-muted">
                        {selected ? "In allocation" : "In Treasury"}
                    </p>
                    <p className="mt-1 font-display text-xl font-medium text-ink tabular-nums">
                        ${fmt(selected ? selected.balance : total)}
                    </p>
                </div>
            </div>

            <div className="relative mt-6">
                <AnimatePresence mode="wait" initial={false}>
                    {selected ? (
                        <motion.div
                            key="detail"
                            {...slide(1)}
                            transition={{ duration: 0.32, ease: EASE_OUT }}
                        >
                            <DetailView allocation={selected} />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="list"
                            {...slide(-1)}
                            transition={{ duration: 0.32, ease: EASE_OUT }}
                        >
                            <ListView allocations={MOCK_ALLOCATIONS} onSelect={setSelectedId} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

function ListView({
    allocations,
    onSelect,
}: {
    allocations: Allocation[];
    onSelect: (id: string) => void;
}) {
    return (
        <div>
            <p className="mb-4 text-sm text-ink-muted">
                Put idle USDC to work. Funds stay liquid — withdraw to your operating
                balance anytime, no lock-up.
            </p>

            <ul className="flex flex-col gap-2">
                {allocations.map((allocation) => (
                    <li key={allocation.id}>
                        <button
                            type="button"
                            onClick={() => onSelect(allocation.id)}
                            className="flex w-full cursor-pointer items-center gap-3 rounded-xl bg-surface/50 p-3 text-left ring-1 ring-hairline outline-none transition-all duration-200 hover:bg-surface hover:ring-accent/40 hover:shadow-[0_6px_22px_-10px_#fdda2455] focus-visible:ring-2 focus-visible:ring-accent/60"
                        >
                            <IconBadge icon={Landmark} tone="lavender" />
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium text-ink">{allocation.name}</p>
                                <p className="flex items-center gap-1 text-xs text-accent-2">
                                    <TrendingUp className="size-3" /> {allocation.apy.toFixed(1)}% APY
                                </p>
                            </div>
                            <span className="font-display text-base text-ink tabular-nums">
                                ${fmt(allocation.balance)}
                            </span>
                            <ChevronRight className="size-4 shrink-0 text-ink-muted" />
                        </button>
                    </li>
                ))}
            </ul>

            <div className="mt-6">
                <Pill
                    variant="primary"
                    onClick={() => toast.message("New allocation — coming soon")}
                >
                    <Plus /> New allocation
                </Pill>
            </div>

            <div className="mt-6 flex items-center gap-2 border-t border-hairline pt-4 text-xs text-ink-muted">
                <ShieldCheck className="size-3.5 text-accent" />
                Yield accrues daily. Fully liquid, no lock-up. Rates shown are illustrative.
            </div>
        </div>
    );
}

function DetailView({ allocation }: { allocation: Allocation }) {
    const yearEnd = allocation.balance * Math.pow(1 + allocation.apy / 100 / 365, 365);
    const yearGain = yearEnd - allocation.balance;
    const monthly = yearGain / 12;

    return (
        <div>
            <div className="rounded-xl bg-surface/40 p-4 ring-1 ring-hairline">
                <SavingsProjectionChart principal={allocation.balance} apy={allocation.apy} days={365} />
            </div>

            <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-4">
                <Stat label="Yield rate" value={`${allocation.apy.toFixed(1)}%`} sub="APY" />
                <Stat label="Avg. monthly" value={`+$${fmt(monthly)}`} accent sub="yield" />
                <Stat label="Allocated" value={`$${fmt(allocation.balance)}`} />
                <Stat label="In 1 year" value={`$${fmt(yearEnd)}`} />
            </dl>

            <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                <Pill
                    variant="primary"
                    onClick={() => toast.message(`Allocate to ${allocation.name} — coming soon`)}
                >
                    <Plus /> Allocate
                </Pill>
                <Pill
                    variant="secondary"
                    onClick={() => toast.message("Withdraw to operating balance — coming soon")}
                >
                    Withdraw
                </Pill>
            </div>
        </div>
    );
}

function Stat({
    label,
    value,
    sub,
    accent,
}: {
    label: string;
    value: string;
    sub?: string;
    accent?: boolean;
}) {
    return (
        <div>
            <dt className="font-mono text-[0.7rem] uppercase tracking-[0.16em] text-ink-muted">
                {label}
            </dt>
            <dd
                className={`mt-1 font-display text-lg tabular-nums ${accent ? "text-accent" : "text-ink"}`}
            >
                {value}
                {sub && <span className="ml-1 text-xs font-normal text-ink-muted">{sub}</span>}
            </dd>
        </div>
    );
}
