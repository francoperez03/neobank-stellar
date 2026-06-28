"use client";

import { useState } from "react";
import { ArrowUpRight, CheckCircle2, Wallet } from "lucide-react";
import { useUser } from "@/hooks/use-user";
import { Pill } from "@/components/ui/pill";
import { Input } from "@/components/ui/input";
import { Eyebrow } from "@/components/ui/eyebrow";
import { truncateAddress } from "@/lib/utils";

const fmt = (n: number) =>
    n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function TransferForm() {
    const { wallet, balance, transfer, isTransferring } = useUser();
    const [recipient, setRecipient] = useState("");
    const [amount, setAmount] = useState("");
    const [sent, setSent] = useState<{ explorerLink: string; amount: string; to: string } | null>(null);

    const available = balance != null ? Number(balance) : null;
    const amountNum = amount ? Number(amount) : 0;
    const overBalance = available != null && amountNum > available;
    const canSend =
        !!wallet && recipient.trim().length > 0 && amountNum > 0 && !overBalance && !isTransferring;

    const handleTransfer = async () => {
        if (!canSend) return;
        try {
            const { explorerLink } = await transfer(recipient, amount);
            setSent({ explorerLink, amount, to: recipient });
            setRecipient("");
            setAmount("");
        } catch {
            // surfaced via toast
        }
    };

    // Success state — a confirmation card instead of a loose link.
    if (sent) {
        return (
            <div>
                <Eyebrow>Send</Eyebrow>
                <div className="mt-4 flex flex-col items-center rounded-xl bg-surface/40 px-6 py-8 text-center ring-1 ring-hairline">
                    <span className="grid size-12 place-items-center rounded-full bg-accent/15 ring-1 ring-accent/30">
                        <CheckCircle2 className="size-6 text-accent" strokeWidth={2} />
                    </span>
                    <h2 className="mt-4 font-display text-xl font-medium tracking-tight text-ink">
                        Transfer sent
                    </h2>
                    <p className="mt-1 text-sm text-ink-muted">
                        <span className="font-medium text-ink tabular-nums">{sent.amount} USDC</span> to{" "}
                        <span className="font-mono text-ink">{truncateAddress(sent.to)}</span>
                    </p>
                    <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                        <a
                            href={sent.explorerLink}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center justify-center gap-1.5 rounded-full bg-surface/60 px-4 py-2 text-sm font-medium text-ink ring-1 ring-hairline-strong transition-all hover:bg-surface hover:ring-accent/50"
                        >
                            View on explorer <ArrowUpRight className="size-3.5" />
                        </a>
                        <button
                            type="button"
                            onClick={() => setSent(null)}
                            className="cursor-pointer rounded-full px-4 py-2 text-sm font-medium text-ink-muted transition-colors hover:text-ink"
                        >
                            Send another
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div>
            <Eyebrow>Send</Eyebrow>
            <h2 className="mt-3 font-display text-2xl font-medium tracking-tight text-ink">
                Send USDC
            </h2>
            <p className="mt-2 text-sm text-ink-muted">
                Transfer USDC to any Stellar address. Network fees are on us.
            </p>

            <div className="mt-6 flex flex-col gap-4">
                <div>
                    <label
                        htmlFor="send-recipient"
                        className="font-mono text-xs uppercase tracking-[0.2em] text-ink-muted"
                    >
                        Recipient
                    </label>
                    <Input
                        id="send-recipient"
                        className="mt-2 border-transparent bg-surface/50 font-mono text-sm ring-1 ring-hairline focus-visible:ring-accent/50"
                        placeholder="G… Stellar address"
                        value={recipient}
                        onChange={(e) => setRecipient(e.target.value)}
                        autoComplete="off"
                        spellCheck={false}
                    />
                </div>

                <div>
                    <div className="flex items-center justify-between">
                        <label
                            htmlFor="send-amount"
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
                            id="send-amount"
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
                            Amount exceeds your available balance.
                        </p>
                    )}
                </div>
            </div>

            <div className="mt-6">
                <Pill variant="primary" onClick={handleTransfer} disabled={!canSend}>
                    {isTransferring ? "Sending…" : "Transfer"}
                    {!isTransferring && <ArrowUpRight />}
                </Pill>
            </div>
        </div>
    );
}
