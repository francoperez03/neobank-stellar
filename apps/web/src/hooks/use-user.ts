import { useCallback, useEffect, useMemo, useRef } from "react";
import { useCrossmintAuth, useWallet } from "@crossmint/client-sdk-react-ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createApiClient } from "@/lib/api-client";
import { useUserOverride } from "@/hooks/use-user-override";

type AuthContext = ReturnType<typeof useCrossmintAuth>;
type WalletContext = ReturnType<typeof useWallet>;

type AuthStatus = AuthContext["status"];
type WalletStatus = WalletContext["status"];

interface UserProfile {
  id: string;
  crossmintUserId: string;
  email: string | null;
  kycStatus: string;
}

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

const profileKey = ["user-profile"] as const;

export function useUser(): UseUserResult {
  const override = useUserOverride();
  const real = useUserReal();
  return override ?? real;
}

function useUserReal(): UseUserResult {
  const { user, status: authStatus, jwt, login, logout } = useCrossmintAuth();
  const { wallet, status: walletStatus } = useWallet();
  const queryClient = useQueryClient();
  const walletAddress = wallet?.address;

  // Stable refs so interceptors always see the latest values without re-creating the client
  const jwtRef = useRef(jwt);
  jwtRef.current = jwt;

  const onUnauthorizedRef = useRef<() => void>(null!);
  onUnauthorizedRef.current = () => {
    queryClient.removeQueries({ queryKey: profileKey });
    void logout();
  };

  const apiFetch = useMemo(
    () => createApiClient(() => jwtRef.current, () => onUnauthorizedRef.current()),
    [],
  );

  // The Crossmint Stellar wallet is created client-side; register its address with
  // the backend once it exists so server-side vault routes can act as that wallet.
  const registeredAddressRef = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (!walletAddress || !jwt || authStatus !== "logged-in") return;
    if (registeredAddressRef.current === walletAddress) return;
    registeredAddressRef.current = walletAddress;
    apiFetch("/api/me/wallet", { method: "POST", data: { address: walletAddress } }).catch(() => {
      registeredAddressRef.current = undefined; // allow a retry on the next render
    });
  }, [walletAddress, jwt, authStatus, apiFetch]);

  const profileQuery = useQuery({
    queryKey: profileKey,
    queryFn: () => apiFetch<UserProfile>("/api/me"),
    enabled: authStatus === "logged-in" && !!jwt,
    staleTime: 30_000,
  });

  const isKycApproved = profileQuery.data?.kycStatus === "approved";

  const markKycApprovedMutation = useMutation({
    mutationFn: () => apiFetch("/api/kyc/approve", { method: "POST" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: profileKey }),
    onError: () => toast.error("Failed to submit KYC"),
  });

  const markKycApproved = useCallback(
    () => markKycApprovedMutation.mutate(),
    [markKycApprovedMutation],
  );

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
    queryClient.removeQueries({ queryKey: profileKey });
    return logout();
  }, [logout, queryClient]);

  return {
    user,
    wallet,
    authStatus,
    walletStatus,
    isAuthenticated: authStatus === "logged-in",
    isAuthLoading:
      authStatus === "initializing" ||
      authStatus === "in-progress" ||
      (authStatus === "logged-in" && profileQuery.isLoading),
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
