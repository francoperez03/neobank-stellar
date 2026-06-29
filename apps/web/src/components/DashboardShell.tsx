"use client";

import { useState, type ComponentType } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
    ArrowDownToLine,
    FileText,
    Landmark,
    Loader2,
    Plus,
    Receipt,
    RefreshCw,
    Repeat,
    Send,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useUser } from "@/hooks/use-user";
import { Eyebrow } from "@/components/ui/eyebrow";
import { DepositPanel } from "@/components/DepositPanel";
import { TransferForm } from "@/components/TransferForm";
import { TreasuryPanel } from "@/components/TreasuryPanel";
import { InvoicesPanel } from "@/components/InvoicesPanel";
import { MovementsView } from "@/components/MovementsView";
import { SchedulesView } from "@/components/SchedulesView";
import { EASE_OUT } from "@/lib/motion";
import { cn } from "@/lib/utils";

type ShellPanel = "history" | "deposit" | "send" | "treasury" | "invoices" | "schedules";

const NAV: { id: ShellPanel; icon: LucideIcon; label: string }[] = [
    { id: "history", icon: Receipt, label: "History" },
    { id: "deposit", icon: ArrowDownToLine, label: "Deposit" },
    { id: "send", icon: Send, label: "Send" },
    { id: "schedules", icon: Repeat, label: "Recurring" },
    { id: "treasury", icon: Landmark, label: "Treasury" },
    { id: "invoices", icon: FileText, label: "Invoices" },
];

const PANELS: Record<ShellPanel, ComponentType> = {
    history: MovementsView,
    deposit: DepositPanel,
    send: TransferForm,
    schedules: SchedulesView,
    treasury: TreasuryPanel,
    invoices: InvoicesPanel,
};

export function DashboardShell() {
    // Open on the movements overview — the dashboard's at-a-glance default.
    const [active, setActive] = useState<ShellPanel>("history");
    const reduced = useReducedMotion();
    const Panel = PANELS[active];

    const swap = reduced
        ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
        : {
              initial: { opacity: 0, y: 10 },
              animate: { opacity: 1, y: 0 },
              exit: { opacity: 0, y: -8 },
          };

    return (
        <div className="relative flex min-h-[calc(100vh-3.75rem)]">
            {/* Stellar-yellow glow, anchored top-left behind the sidebar. */}
            <div
                aria-hidden
                className="pointer-events-none absolute -left-24 -top-24 h-[28rem] w-[28rem] rounded-full opacity-[0.14] blur-3xl"
                style={{ background: "radial-gradient(circle, #fdda24 0%, transparent 60%)" }}
            />

            <aside className="sticky top-[3.75rem] flex h-[calc(100vh-3.75rem)] w-64 shrink-0 flex-col border-r border-hairline bg-sidebar px-4 py-6">
                <BalanceSummary />

                <nav className="mt-8 flex flex-col gap-1" aria-label="Dashboard sections">
                    {NAV.map(({ id, icon: Icon, label }) => {
                        const isActive = active === id;
                        return (
                            <button
                                key={id}
                                type="button"
                                onClick={() => setActive(id)}
                                aria-current={isActive ? "page" : undefined}
                                className={cn(
                                    "flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm outline-none transition-all duration-200 focus-visible:ring-2 focus-visible:ring-accent/60",
                                    isActive
                                        ? "bg-accent/15 text-ink ring-1 ring-accent/40"
                                        : "text-ink-muted ring-1 ring-transparent hover:bg-surface/60 hover:text-ink",
                                )}
                            >
                                <Icon
                                    className={cn("size-4 shrink-0", isActive ? "text-accent" : "text-ink-muted")}
                                    strokeWidth={1.8}
                                />
                                {label}
                            </button>
                        );
                    })}
                </nav>

                {/* A quiet end-of-list dot — closes the rail without a label that
                    has nothing to say. */}
                <div className="mt-auto flex justify-center pt-6" aria-hidden>
                    <span className="size-1 rounded-full bg-hairline-strong" />
                </div>
            </aside>

            {/* Detail lives flat on the canvas, left-aligned, filling the pane —
                no floating card. A wide max measure keeps prose readable on
                ultra-wide screens without re-centering the content. */}
            <main className="relative min-w-0 flex-1 px-10 py-12">
                <div className="w-full max-w-5xl">
                    <AnimatePresence mode="wait" initial={false}>
                        <motion.div
                            key={active}
                            {...swap}
                            transition={{ duration: 0.28, ease: EASE_OUT }}
                        >
                            <Panel />
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
}

/** Compact operating-balance block at the top of the sidebar. */
function BalanceSummary() {
    const { wallet, balance, isBalanceLoading, refetchBalance, fundWallet, isFunding } = useUser();
    const ready = !!wallet;
    const numeric = balance != null ? Number(balance) : null;
    const hasBalance = numeric != null && !Number.isNaN(numeric);
    const loading = !ready || (isBalanceLoading && !hasBalance);

    return (
        <div className="rounded-xl bg-surface/50 p-4 ring-1 ring-hairline">
            <div className="flex items-center justify-between">
                <Eyebrow>Balance</Eyebrow>
                <div className="flex items-center gap-1">
                    <button
                        type="button"
                        onClick={refetchBalance}
                        disabled={!ready || isBalanceLoading}
                        aria-label="Refresh balance"
                        title="Refresh balance"
                        className="grid size-7 cursor-pointer place-items-center rounded-lg text-ink-muted outline-none transition-all duration-200 hover:bg-surface hover:text-ink focus-visible:ring-2 focus-visible:ring-accent/60 disabled:pointer-events-none disabled:opacity-40"
                    >
                        <RefreshCw className={isBalanceLoading ? "size-3.5 animate-spin" : "size-3.5"} strokeWidth={1.8} />
                    </button>
                    <button
                        type="button"
                        onClick={fundWallet}
                        disabled={!ready || isFunding}
                        aria-label="Add test funds"
                        title="Add test funds (staging)"
                        className="grid size-7 cursor-pointer place-items-center rounded-lg text-accent outline-none transition-all duration-200 hover:bg-surface hover:shadow-[0_0_0_1px_#fdda2433] focus-visible:ring-2 focus-visible:ring-accent/60 disabled:pointer-events-none disabled:opacity-40"
                    >
                        <Plus className={isFunding ? "size-3.5 animate-pulse" : "size-3.5"} strokeWidth={2} />
                    </button>
                </div>
            </div>

            {loading ? (
                <span className="mt-3 flex items-center gap-2 text-ink-muted">
                    <Loader2 className="size-4 animate-spin text-accent" strokeWidth={2.5} />
                    <span className="font-display text-lg font-medium tracking-tight">Retrieving…</span>
                </span>
            ) : (
                <p className="mt-2 font-display text-2xl font-medium tracking-tight text-ink tabular-nums">
                    ${Math.trunc(numeric!).toLocaleString("en-US")}
                    <span className="text-ink-muted">.00</span>
                </p>
            )}
            <p className="mt-1 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-ink-muted">
                USDC · General
            </p>
        </div>
    );
}
