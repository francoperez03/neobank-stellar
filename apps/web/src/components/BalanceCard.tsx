"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowDownToLine, Landmark, Loader2, Plus, RefreshCw, Send } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useUser } from "@/hooks/use-user";
import { DoubleBezel } from "@/components/ui/double-bezel";
import { DepositPanel } from "@/components/DepositPanel";
import { TransferForm } from "@/components/TransferForm";
import { TreasuryPanel } from "@/components/TreasuryPanel";
import { EASE_OUT } from "@/lib/motion";
import { cn } from "@/lib/utils";

export type DashboardPanel = "deposit" | "send" | "treasury";

interface BalanceCardProps {
    activePanel: DashboardPanel | null;
    onToggle: (panel: DashboardPanel) => void;
}

const ACTIONS: { id: DashboardPanel; icon: LucideIcon; label: string }[] = [
    { id: "deposit", icon: ArrowDownToLine, label: "Deposit" },
    { id: "send", icon: Send, label: "Send" },
    { id: "treasury", icon: Landmark, label: "Treasury" },
];

export function BalanceCard({ activePanel, onToggle }: BalanceCardProps) {
    const reduced = useReducedMotion();
    const { wallet, balance, isBalanceLoading, refetchBalance, fundWallet, isFunding } = useUser();

    const ready = !!wallet;
    const numeric = balance != null ? Number(balance) : null;
    const hasBalance = numeric != null && !Number.isNaN(numeric);
    const whole = hasBalance ? Math.trunc(numeric!).toLocaleString("en-US") : "";
    // Loading = wallet not ready yet, or a balance fetch in flight with nothing to show.
    const loading = !ready || (isBalanceLoading && !hasBalance);

    const expand = reduced
        ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
        : {
              initial: { height: 0, opacity: 0 },
              animate: { height: "auto" as const, opacity: 1 },
              exit: { height: 0, opacity: 0 },
          };

    return (
        <div className="relative">
            {/* Static Stellar-yellow dot glow, mirrors the landing hero card. */}
            <div
                aria-hidden
                className="photon-dot-glow pointer-events-none absolute -right-10 -top-10 h-48 w-48 opacity-40"
            />

            <DoubleBezel radius="1.5rem" className="p-6 sm:p-8">
                <div className="flex items-center justify-between">
                    <span className="font-mono text-xs uppercase tracking-[0.2em] text-ink-muted">
                        PHOTON · Account
                    </span>
                    {/* Compact actions: refresh + add test funds. */}
                    <div className="flex items-center gap-1">
                        <button
                            type="button"
                            onClick={refetchBalance}
                            disabled={!ready || isBalanceLoading}
                            aria-label="Refresh balance"
                            title="Refresh balance"
                            className="grid size-8 cursor-pointer place-items-center rounded-lg text-ink-muted outline-none transition-all duration-200 hover:bg-surface hover:text-ink focus-visible:ring-2 focus-visible:ring-accent/60 disabled:pointer-events-none disabled:opacity-40"
                        >
                            <RefreshCw className={isBalanceLoading ? "size-4 animate-spin" : "size-4"} strokeWidth={1.8} />
                        </button>
                        <button
                            type="button"
                            onClick={fundWallet}
                            disabled={!ready || isFunding}
                            aria-label="Add test funds"
                            title="Add test funds (staging)"
                            className="grid size-8 cursor-pointer place-items-center rounded-lg text-accent outline-none transition-all duration-200 hover:bg-surface hover:shadow-[0_0_0_1px_#fdda2433] focus-visible:ring-2 focus-visible:ring-accent/60 disabled:pointer-events-none disabled:opacity-40"
                        >
                            <Plus className={isFunding ? "size-4 animate-pulse" : "size-4"} strokeWidth={2} />
                        </button>
                    </div>
                </div>

                <div className="mt-8">
                    <p className="font-mono text-xs uppercase tracking-[0.2em] text-ink-muted">
                        Operating balance
                    </p>
                    {loading ? (
                        <div
                            className="mt-3 flex items-center gap-3"
                            aria-busy="true"
                            aria-live="polite"
                        >
                            <Loader2 className="size-7 animate-spin text-accent" strokeWidth={2.5} />
                            <span className="font-display text-3xl font-medium tracking-tight text-ink-muted">
                                Retrieving balance
                                <AnimatedDots />
                            </span>
                        </div>
                    ) : (
                        <>
                            <p className="mt-2 font-display text-5xl font-medium tracking-tight text-ink tabular-nums">
                                ${whole}
                                <span className="text-ink-muted">.00</span>
                            </p>
                            <p className="mt-1 text-sm text-accent-2 tabular-nums">≈ {whole} USDC</p>
                        </>
                    )}
                </div>

                <div className="mt-8 grid grid-cols-3 gap-2">
                    {ACTIONS.map(({ id, icon: Icon, label }) => {
                        const active = activePanel === id;
                        return (
                            <button
                                key={id}
                                type="button"
                                onClick={() => onToggle(id)}
                                aria-pressed={active}
                                className={cn(
                                    "flex cursor-pointer flex-col items-center gap-2 rounded-xl py-3 ring-1 outline-none transition-all duration-200 focus-visible:ring-accent/60",
                                    active
                                        ? "bg-accent/15 ring-accent/50 shadow-[0_6px_22px_-8px_#fdda2466]"
                                        : "bg-surface/60 ring-hairline hover:bg-surface hover:ring-accent/45 hover:shadow-[0_6px_22px_-8px_#fdda2455]",
                                )}
                            >
                                <Icon
                                    className={cn("size-4", active ? "text-accent" : "text-accent")}
                                    strokeWidth={1.8}
                                />
                                <span className={cn("text-xs", active ? "text-ink" : "text-ink-muted")}>
                                    {label}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* One unified card: the chosen action expands inline below the grid. */}
                <AnimatePresence initial={false} mode="wait">
                    {activePanel && (
                        <motion.div
                            key={activePanel}
                            {...expand}
                            transition={{ duration: 0.3, ease: EASE_OUT }}
                            className="overflow-hidden"
                        >
                            <div className="mt-6 border-t border-hairline pt-6">
                                {activePanel === "deposit" && <DepositPanel />}
                                {activePanel === "send" && <TransferForm />}
                                {activePanel === "treasury" && <TreasuryPanel />}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </DoubleBezel>
        </div>
    );
}

/** Three dots that pulse in sequence — a small "working…" cue for the loader. */
function AnimatedDots() {
    const reduced = useReducedMotion();
    if (reduced) return <span>…</span>;
    return (
        <span className="inline-flex">
            {[0, 1, 2].map((i) => (
                <motion.span
                    key={i}
                    aria-hidden
                    animate={{ opacity: [0.2, 1, 0.2] }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut", delay: i * 0.2 }}
                >
                    .
                </motion.span>
            ))}
        </span>
    );
}
