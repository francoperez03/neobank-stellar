"use client";

import { useState } from "react";
import { useUser } from "@/hooks/use-user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
    CardFooter,
} from "@/components/ui/card";

export function TransferForm() {
    const { wallet, transfer, isTransferring } = useUser();
    const [recipient, setRecipient] = useState("");
    const [amount, setAmount] = useState("");
    const [explorerLink, setExplorerLink] = useState("");

    const handleTransfer = async () => {
        if (!wallet || !recipient || !amount) return;
        try {
            const { explorerLink } = await transfer(recipient, amount);
            setExplorerLink(explorerLink);
            setRecipient("");
            setAmount("");
        } catch {
            // surfaced via toast
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Send USDC</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
                <Input
                    placeholder="Recipient address"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                />
                <Input
                    type="number"
                    placeholder="Amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                />
                {explorerLink && (
                    <a
                        className="text-sm text-primary underline-offset-4 hover:underline"
                        href={explorerLink}
                        target="_blank"
                        rel="noreferrer"
                    >
                        View transaction
                    </a>
                )}
            </CardContent>
            <CardFooter>
                <Button
                    onClick={handleTransfer}
                    disabled={!wallet || !recipient || !amount || isTransferring}
                >
                    {isTransferring ? "Sending..." : "Transfer"}
                </Button>
            </CardFooter>
        </Card>
    );
}
