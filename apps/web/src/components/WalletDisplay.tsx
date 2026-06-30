"use client";

import { Copy } from "lucide-react";
import { toast } from "sonner";
import { useUser } from "@/hooks/use-user";
import { Pill } from "@/components/ui/pill";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { truncateAddress } from "@/lib/utils";

export function WalletDisplay() {
    const { user, wallet, authStatus, isWalletLoading, login, logout } = useUser();

    if (authStatus !== "logged-in") {
        return (
            <Pill onClick={() => login()} disabled={authStatus === "in-progress"}>
                {authStatus === "in-progress" ? "Logging in..." : "Log in"}
            </Pill>
        );
    }

    const name = user?.email ?? "Account";

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 rounded-lg p-1.5 hover:bg-muted">
                    <Avatar>
                        <AvatarFallback>{name.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="text-left">
                        <p className="text-sm font-medium leading-none">{name}</p>
                        <p className="text-xs text-muted-foreground">
                            {isWalletLoading
                                ? "Creating wallet..."
                                : wallet
                                    ? truncateAddress(wallet.address)
                                    : "No wallet connected"}
                        </p>
                    </div>
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {wallet && (
                    <DropdownMenuItem
                        onClick={() => {
                            void navigator.clipboard.writeText(wallet.address);
                            toast.success("Address copied");
                        }}
                    >
                        <Copy /> Copy address
                    </DropdownMenuItem>
                )}
                <DropdownMenuItem variant="destructive" onClick={logout}>
                    Log out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
