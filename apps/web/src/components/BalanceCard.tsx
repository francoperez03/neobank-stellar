"use client";

import { useUser } from "@/hooks/use-user";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
    CardFooter,
} from "@/components/ui/card";

export function BalanceCard() {
    const { wallet, balance, isBalanceLoading, refetchBalance, fundWallet, isFunding } = useUser();

    return (
        <Card>
            <CardHeader>
                <CardTitle>USDC Balance</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-2xl font-medium">
                    {balance ?? "—"} <span className="text-sm text-muted-foreground">USDC</span>
                </p>
            </CardContent>
            <CardFooter className="gap-2">
                <Button
                    variant="outline"
                    onClick={refetchBalance}
                    disabled={!wallet || isBalanceLoading}
                >
                    {isBalanceLoading ? "Refreshing..." : "Refresh"}
                </Button>
                <Button
                    variant="ghost"
                    onClick={fundWallet}
                    disabled={!wallet || isFunding}
                >
                    Add test funds (staging)
                </Button>
            </CardFooter>
        </Card>
    );
}
