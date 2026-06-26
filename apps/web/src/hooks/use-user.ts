import { useCallback, useState } from "react";
import { useCrossmintAuth, useWallet } from "@crossmint/client-sdk-react-ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

type AuthContext = ReturnType<typeof useCrossmintAuth>;
type WalletContext = ReturnType<typeof useWallet>;

type AuthStatus = AuthContext["status"];
type WalletStatus = WalletContext["status"];

export interface UseUserResult {
    user?: AuthContext["user"];
    wallet?: WalletContext["wallet"];
    authStatus: AuthStatus;
    walletStatus: WalletStatus;
    isAuthenticated: boolean;
    isAuthLoading: boolean;
    isWalletLoading: boolean;
    isKycApproved: boolean;
    walletAddress?: string;
    login: (defaultEmail?: string) => void;
    logout: () => Promise<void>;
    markKycApproved: () => void;
    balance?: string;
    isBalanceLoading: boolean;
    refetchBalance: () => void;
    fundWallet: () => void;
    isFunding: boolean;
    transfer: (recipient: string, amount: string) => Promise<{ explorerLink: string }>;
    isTransferring: boolean;
}

const walletBalancesKey = (address?: string) =>
    ["wallet-balances", address] as const;

export function useUser(): UseUserResult {
    const { user, status: authStatus, login, logout } = useCrossmintAuth();
    const { wallet, status: walletStatus } = useWallet();
    const queryClient = useQueryClient();
    const walletAddress = wallet?.address;

    const [isKycApproved, setIsKycApproved] = useState(
        () => localStorage.getItem("kyc_status") === "approved"
    );

    const markKycApproved = useCallback(() => {
        localStorage.setItem("kyc_status", "approved");
        setIsKycApproved(true);
    }, []);

    const balanceQuery = useQuery({
        queryKey: walletBalancesKey(walletAddress),
        // stagingFund() only mints Crossmint's test stablecoin (USDXM) — staging
        // environments can't fund real USDC. We read the USDXM balance here so
        // "Add test funds" actually moves the number on screen; the UI still
        // labels it "USDC" since this app treats USDXM as the demo stand-in.
        queryFn: async () => {
            const { tokens } = await wallet!.balances(["usdxm"]);
            return tokens.find((token) => token.symbol === "usdxm")?.amount ?? "0";
        },
        enabled: !!wallet,
    });

    const invalidateBalance = () =>
        queryClient.invalidateQueries({ queryKey: walletBalancesKey(walletAddress) });

    const fundMutation = useMutation({
        mutationFn: async () => {
            if (!wallet) throw new Error("Wallet not ready");
            await wallet.stagingFund(10);
        },
        onSuccess: () => {
            invalidateBalance();
            toast.success("Test funds added");
        },
        onError: () => {
            toast.error("Failed to add test funds");
        },
    });

    const transferMutation = useMutation({
        mutationFn: ({ recipient, amount }: { recipient: string; amount: string }) => {
            if (!wallet) throw new Error("Wallet not ready");
            return wallet.send(recipient, "usdc", amount);
        },
        onSuccess: () => {
            invalidateBalance();
            toast.success("Transfer sent");
        },
        onError: (error) => {
            toast.error(error instanceof Error ? error.message : "Transfer failed");
        },
    });

    const logoutWithCleanup = useCallback(async () => {
        localStorage.removeItem("kyc_status");
        setIsKycApproved(false);
        return logout();
    }, [logout]);

    return {
        user,
        wallet,
        authStatus,
        walletStatus,
        isAuthenticated: authStatus === "logged-in",
        isAuthLoading: authStatus === "initializing" || authStatus === "in-progress",
        isWalletLoading: walletStatus === "in-progress",
        isKycApproved,
        walletAddress,
        login,
        logout: logoutWithCleanup,
        markKycApproved,
        balance: balanceQuery.data,
        isBalanceLoading: balanceQuery.isFetching,
        refetchBalance: () => balanceQuery.refetch(),
        fundWallet: () => fundMutation.mutate(),
        isFunding: fundMutation.isPending,
        transfer: (recipient, amount) => transferMutation.mutateAsync({ recipient, amount }),
        isTransferring: transferMutation.isPending,
    };
}
