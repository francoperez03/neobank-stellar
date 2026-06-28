"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
    ArrowLeft,
    ArrowUpRight,
    CheckCircle2,
    ChevronRight,
    Landmark,
    Plus,
    ShieldCheck,
    TrendingUp,
    Wallet,
} from "lucide-react";
import { useUser } from "@/hooks/use-user";
import { useAllocations } from "@/hooks/use-allocations";
import type { Allocation } from "@/lib/allocations";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Pill } from "@/components/ui/pill";
import { Input } from "@/components/ui/input";
import { IconBadge } from "@/components/ui/icon-badge";
import { SavingsProjectionChart } from "@/components/SavingsProjectionChart";
import { EASE_OUT } from "@/lib/motion";

const fmt = (n: number) =>
    n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

type View = { kind: "list" } | { kind: "detail"; id: string } | { kind: "new" };

export function TreasuryPanel() {
    const reduced = useReducedMotion();
    const [view, setView] = useState<View>({ kind: "list" });
    const { allocations, isLoading, apyPct, inTreasury, isVaultLoading } = useAllocations();

    const selected =
        view.kind === "detail" ? allocations.find((a) => a.id === view.id) ?? null : null;
    const inDetailOrNew = view.kind !== "list";

    const slide = (dir: 1 | -1) =>
        reduced
            ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
            : {
                  initial: { opacity: 0, x: dir * 32 },
                  animate: { opacity: 1, x: 0 },
                  exit: { opacity: 0, x: dir * -32 },
              };

    const headerLabel = inDetailOrNew ? "In allocation" : "In Treasury";
    const headerTotal =
        view.kind === "detail" && selected
            ? `$${fmt(Number(selected.amount))}`
            : inTreasury != null
              ? `$${fmt(Number(inTreasury))}`
              : isVaultLoading
                ? "…"
                : "$0.00";

    const headerTitle =
        view.kind === "detail" && selected
            ? selected.name
            : view.kind === "new"
              ? "New allocation"
              : "Treasury";

    return (
        <div className="overflow-hidden">
            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                    {inDetailOrNew ? (
                        <button
                            type="button"
                            onClick={() => setView({ kind: "list" })}
                            className="group inline-flex cursor-pointer items-center gap-1.5 text-sm text-ink-muted outline-none transition-colors hover:text-ink focus-visible:text-ink"
                        >
                            <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
                            All allocations
                        </button>
                    ) : (
                        <Eyebrow>Treasury</Eyebrow>
                    )}
                    <h2 className="mt-3 truncate font-display text-2xl font-medium tracking-tight text-ink">
                        {headerTitle}
                    </h2>
                </div>
                <div className="shrink-0 text-right">
                    <p className="font-mono text-xs uppercase tracking-[0.2em] text-ink-muted">
                        {headerLabel}
                    </p>
                    <p className="mt-1 font-display text-xl font-medium text-ink tabular-nums">
                        {headerTotal}
                    </p>
                </div>
            </div>

            <div className="relative mt-6">
                <AnimatePresence mode="wait" initial={false}>
                    {view.kind === "list" ? (
                        <motion.div key="list" {...slide(-1)} transition={{ duration: 0.32, ease: EASE_OUT }}>
                            <ListView
                                allocations={allocations}
                                isLoading={isLoading}
                                apyPct={apyPct}
                                onSelect={(id) => setView({ kind: "detail", id })}
                                onNew={() => setView({ kind: "new" })}
                            />
                        </motion.div>
                    ) : view.kind === "new" ? (
                        <motion.div key="new" {...slide(1)} transition={{ duration: 0.32, ease: EASE_OUT }}>
                            <NewAllocationView apyPct={apyPct} onDone={() => setView({ kind: "list" })} />
                        </motion.div>
                    ) : (
                        <motion.div key="detail" {...slide(1)} transition={{ duration: 0.32, ease: EASE_OUT }}>
                            {selected && <DetailView allocation={selected} apyPct={apyPct} />}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

function ListView({
    allocations,
    isLoading,
    apyPct,
    onSelect,
    onNew,
}: {
    allocations: Allocation[];
    isLoading: boolean;
    apyPct?: number;
    onSelect: (id: string) => void;
    onNew: () => void;
}) {
    const empty = !isLoading && allocations.length === 0;

    return (
        <div>
            <p className="mb-4 text-sm text-ink-muted">
                Put idle USDC to work. Funds stay liquid, withdraw to your operating
                balance anytime, no lock-up.
            </p>

            {isLoading ? (
                <div className="flex flex-col gap-2">
                    {[0, 1].map((i) => (
                        <div key={i} className="h-[68px] animate-pulse rounded-xl bg-surface/50" />
                    ))}
                </div>
            ) : empty ? (
                <div className="rounded-xl border border-dashed border-hairline-strong px-6 py-10 text-center">
                    <IconBadge icon={Landmark} tone="lavender" className="mx-auto" />
                    <p className="mt-4 text-sm font-medium text-ink">No allocations yet</p>
                    <p className="mt-1 text-sm text-ink-muted">
                        Allocate idle USDC to start earning
                        {apyPct != null ? ` ${apyPct.toFixed(2)}% APY` : " yield"}.
                    </p>
                </div>
            ) : (
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
                                    <p className="truncate text-sm font-medium text-ink">
                                        {allocation.name}
                                    </p>
                                    {apyPct != null && (
                                        <p className="flex items-center gap-1 text-xs text-accent-2">
                                            <TrendingUp className="size-3" /> {apyPct.toFixed(2)}% APY
                                        </p>
                                    )}
                                </div>
                                <span className="font-display text-base text-ink tabular-nums">
                                    ${fmt(Number(allocation.amount))}
                                </span>
                                <ChevronRight className="size-4 shrink-0 text-ink-muted" />
                            </button>
                        </li>
                    ))}
                </ul>
            )}

            <div className="mt-6">
                <Pill variant="primary" onClick={onNew}>
                    <Plus /> New allocation
                </Pill>
            </div>

            <div className="mt-6 flex items-center gap-2 border-t border-hairline pt-4 text-xs text-ink-muted">
                <ShieldCheck className="size-3.5 text-accent" />
                Yield accrues daily. Fully liquid, no lock-up.
            </div>
        </div>
    );
}

function NewAllocationView({ apyPct, onDone }: { apyPct?: number; onDone: () => void }) {
    const { balance } = useUser();
    const { create, isCreating } = useAllocations();
    const [name, setName] = useState("");
    const [amount, setAmount] = useState("");
    const [done, setDone] = useState<{ name: string; amount: string; txId?: string } | null>(null);

    const available = balance != null ? Number(balance) : null;
    const amountNum = amount ? Number(amount) : 0;
    const overBalance = available != null && amountNum > available;
    const canSubmit = name.trim().length > 0 && amountNum > 0 && !overBalance && !isCreating;

    const submit = async () => {
        if (!canSubmit) return;
        try {
            const res = await create({ name: name.trim(), amount });
            setDone({ name: name.trim(), amount, txId: res.txId });
        } catch {
            // surfaced via toast
        }
    };

    if (done) {
        const explorer = done.txId
            ? `https://stellar.expert/explorer/testnet/tx/${done.txId}`
            : undefined;
        return (
            <div className="flex flex-col items-center rounded-xl bg-surface/40 px-6 py-8 text-center ring-1 ring-hairline">
                <span className="grid size-12 place-items-center rounded-full bg-accent/15 ring-1 ring-accent/30">
                    <CheckCircle2 className="size-6 text-accent" strokeWidth={2} />
                </span>
                <h3 className="mt-4 font-display text-xl font-medium tracking-tight text-ink">
                    Allocation created
                </h3>
                <p className="mt-1 text-sm text-ink-muted">
                    <span className="font-medium text-ink tabular-nums">{done.amount} USDC</span> in{" "}
                    <span className="text-ink">{done.name}</span>, now earning yield.
                </p>
                <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                    {explorer && (
                        <a
                            href={explorer}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center justify-center gap-1.5 rounded-full bg-surface/60 px-4 py-2 text-sm font-medium text-ink ring-1 ring-hairline-strong transition-all hover:bg-surface hover:ring-accent/50"
                        >
                            View on explorer <ArrowUpRight className="size-3.5" />
                        </a>
                    )}
                    <button
                        type="button"
                        onClick={onDone}
                        className="cursor-pointer rounded-full px-4 py-2 text-sm font-medium text-ink-muted transition-colors hover:text-ink"
                    >
                        Done
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div>
            <p className="text-sm text-ink-muted">
                Allocate idle USDC to the treasury vault. It earns
                {apyPct != null ? <span className="text-accent"> {apyPct.toFixed(2)}% APY</span> : " yield"}{" "}
                and stays fully liquid.
            </p>

            <div className="mt-6 flex flex-col gap-4">
                <div>
                    <label
                        htmlFor="alloc-name"
                        className="font-mono text-xs uppercase tracking-[0.2em] text-ink-muted"
                    >
                        Name
                    </label>
                    <Input
                        id="alloc-name"
                        className="mt-2 border-transparent bg-surface/50 ring-1 ring-hairline focus-visible:ring-accent/50"
                        placeholder="e.g. Operating reserve"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        maxLength={80}
                    />
                </div>

                <div>
                    <div className="flex items-center justify-between">
                        <label
                            htmlFor="alloc-amount"
                            className="font-mono text-xs uppercase tracking-[0.2em] text-ink-muted"
                        >
                            Amount
                        </label>
                        {available != null && (
                            <span className="inline-flex items-center gap-1 text-xs text-ink-muted">
                                <Wallet className="size-3" /> {fmt(available)} available
                            </span>
                        )}
                    </div>
                    <div className="relative mt-2">
                        <Input
                            id="alloc-amount"
                            type="number"
                            inputMode="decimal"
                            min="0"
                            className="border-transparent bg-surface/50 pr-28 tabular-nums ring-1 ring-hairline focus-visible:ring-accent/50"
                            placeholder="0.00"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                        />
                        <div className="absolute inset-y-0 right-2 flex items-center gap-1.5">
                            {available != null && available > 0 && (
                                <button
                                    type="button"
                                    onClick={() => setAmount(String(available))}
                                    className="cursor-pointer rounded-md bg-accent/15 px-2 py-1 text-xs font-medium text-accent ring-1 ring-accent/25 transition-colors hover:bg-accent/25"
                                >
                                    Max
                                </button>
                            )}
                            <span className="font-mono text-xs text-ink-muted">USDC</span>
                        </div>
                    </div>
                    {overBalance && (
                        <p className="mt-1.5 text-xs text-red-400">
                            Amount exceeds your operating balance.
                        </p>
                    )}
                </div>
            </div>

            {amountNum > 0 && apyPct != null && (
                <div className="mt-6 rounded-xl bg-surface/40 p-4 ring-1 ring-hairline">
                    <SavingsProjectionChart principal={amountNum} apy={apyPct} days={365} />
                </div>
            )}

            <div className="mt-6">
                <Pill variant="primary" onClick={submit} disabled={!canSubmit}>
                    {isCreating ? "Allocating…" : "Confirm allocation"}
                    {!isCreating && <ArrowUpRight />}
                </Pill>
            </div>
        </div>
    );
}

function DetailView({ allocation, apyPct }: { allocation: Allocation; apyPct?: number }) {
    const principal = Number(allocation.amount);
    const apy = apyPct ?? 0;
    const yearEnd = principal * Math.pow(1 + apy / 100 / 365, 365);
    const yearGain = yearEnd - principal;
    const monthly = yearGain / 12;
    const explorer = allocation.depositTx
        ? `https://stellar.expert/explorer/testnet/tx/${allocation.depositTx}`
        : undefined;

    return (
        <div>
            <div className="rounded-xl bg-surface/40 p-4 ring-1 ring-hairline">
                <SavingsProjectionChart principal={principal} apy={apy} days={365} />
            </div>

            <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-4">
                <Stat label="Yield rate" value={`${apy.toFixed(2)}%`} sub="APY" />
                <Stat label="Avg. monthly" value={`+$${fmt(monthly)}`} accent sub="yield" />
                <Stat label="Allocated" value={`$${fmt(principal)}`} />
                <Stat label="In 1 year" value={`$${fmt(yearEnd)}`} />
            </dl>

            {explorer && (
                <a
                    href={explorer}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 inline-flex items-center gap-1 text-sm text-accent underline-offset-4 hover:underline"
                >
                    Funding transaction <ArrowUpRight className="size-3.5" />
                </a>
            )}
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
