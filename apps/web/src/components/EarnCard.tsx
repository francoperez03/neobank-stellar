"use client";

import { useState } from "react";
import { useUser } from "@/hooks/use-user";
import { useVault } from "@/hooks/use-vault";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
    CardFooter,
} from "@/components/ui/card";

export function EarnCard() {
    const { wallet } = useUser();
    const {
        apy,
        position,
        isPositionLoading,
        deposit,
        isDepositing,
        withdraw,
        isWithdrawing,
    } = useVault();
    const [amount, setAmount] = useState("");

    const busy = isDepositing || isWithdrawing;

    const run = async (action: (a: string) => Promise<unknown>) => {
        if (!wallet || !amount) return;
        try {
            await action(amount);
            setAmount("");
        } catch {
            // surfaced via toast
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <span>Earn</span>
                    {apy != null && (
                        // DeFindex returns APY as a fraction (e.g. 0.05 = 5%).
                        <span className="text-sm font-normal text-muted-foreground">
                            {(apy * 100).toFixed(2)}% APY
                        </span>
                    )}
                </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
                <p className="text-2xl font-medium">
                    {isPositionLoading ? "—" : position ?? "0"}{" "}
                    <span className="text-sm text-muted-foreground">in vault</span>
                </p>
                <Input
                    type="number"
                    placeholder="Amount (USDC)"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                />
            </CardContent>
            <CardFooter className="gap-2">
                <Button
                    onClick={() => run(deposit)}
                    disabled={!wallet || !amount || busy}
                >
                    {isDepositing ? "Depositing..." : "Deposit"}
                </Button>
                <Button
                    variant="outline"
                    onClick={() => run(withdraw)}
                    disabled={!wallet || !amount || busy}
                >
                    {isWithdrawing ? "Withdrawing..." : "Withdraw"}
                </Button>
            </CardFooter>
        </Card>
    );
}
