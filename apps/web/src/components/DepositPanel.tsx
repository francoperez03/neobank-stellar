"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { useUser } from "@/hooks/use-user";
import { Eyebrow } from "@/components/ui/eyebrow";
import { truncateAddress } from "@/lib/utils";

export function DepositPanel() {
    const { walletAddress } = useUser();
    const [copied, setCopied] = useState(false);

    const copy = async () => {
        if (!walletAddress) return;
        try {
            await navigator.clipboard.writeText(walletAddress);
            setCopied(true);
            toast.success("Address copied");
            setTimeout(() => setCopied(false), 1600);
        } catch {
            toast.error("Couldn't copy address");
        }
    };

    return (
        <div>
            <Eyebrow>Deposit</Eyebrow>
            <h2 className="mt-3 font-display text-2xl font-medium tracking-tight text-ink">
                Receive USDC
            </h2>
            <p className="mt-2 text-sm text-ink-muted">
                Scan the code or share your address to receive funds on Stellar.
            </p>

            <div className="mt-6 flex flex-col items-center gap-5 sm:flex-row sm:items-center">
                {/* QR needs a light, high-contrast surface to scan reliably. */}
                <div className="shrink-0 rounded-2xl bg-white p-3 ring-1 ring-hairline">
                    {walletAddress ? (
                        <QRCodeSVG
                            value={walletAddress}
                            size={132}
                            level="M"
                            bgColor="#ffffff"
                            fgColor="#0f0f0f"
                        />
                    ) : (
                        <div className="size-[132px] animate-pulse rounded-lg bg-surface/60" />
                    )}
                </div>

                <div className="min-w-0 flex-1">
                    <p className="font-mono text-xs uppercase tracking-[0.2em] text-ink-muted">
                        Your address
                    </p>
                    {walletAddress ? (
                        <p className="mt-1.5 break-all font-mono text-sm text-ink">
                            {walletAddress}
                        </p>
                    ) : (
                        <div className="mt-2 h-4 w-48 animate-pulse rounded bg-surface/60" />
                    )}

                    <button
                        type="button"
                        onClick={copy}
                        disabled={!walletAddress}
                        className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-full bg-surface/60 px-4 py-2 text-sm font-medium text-ink ring-1 ring-hairline-strong outline-none transition-all duration-200 hover:bg-surface hover:ring-accent/50 focus-visible:ring-2 focus-visible:ring-accent/60 disabled:pointer-events-none disabled:opacity-40"
                    >
                        {copied ? (
                            <>
                                <Check className="size-4 text-accent" /> Copied
                            </>
                        ) : (
                            <>
                                <Copy className="size-4" /> Copy {walletAddress ? truncateAddress(walletAddress) : "address"}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
