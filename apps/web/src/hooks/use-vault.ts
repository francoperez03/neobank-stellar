import { useMemo, useRef } from "react";
import { useCrossmintAuth, useWallet } from "@crossmint/client-sdk-react-ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createApiClient } from "@/lib/api-client";
import {
  getVaultInfo,
  getBalance,
  deposit as depositToVault,
  withdraw as withdrawFromVault,
  fromSmallestUnit,
} from "@/lib/defindex";

export interface UseVaultResult {
  apy?: number;
  isInfoLoading: boolean;
  position?: string;
  isPositionLoading: boolean;
  refetchPosition: () => void;
  deposit: (amount: string) => Promise<unknown>;
  isDepositing: boolean;
  /** `shares` is in vault-share units (the vault withdraws by shares). */
  withdraw: (shares: string) => Promise<unknown>;
  isWithdrawing: boolean;
}

const vaultInfoKey = ["vault-info"] as const;
const vaultPositionKey = (address?: string) => ["vault-position", address] as const;

export function useVault(): UseVaultResult {
  const { jwt } = useCrossmintAuth();
  const { wallet } = useWallet();
  const queryClient = useQueryClient();
  const walletAddress = wallet?.address;

  const jwtRef = useRef(jwt);
  jwtRef.current = jwt;

  const apiFetch = useMemo(() => createApiClient(() => jwtRef.current), []);

  const infoQuery = useQuery({
    queryKey: vaultInfoKey,
    queryFn: () => getVaultInfo(apiFetch),
    enabled: !!jwt,
    staleTime: 60_000,
  });

  const positionQuery = useQuery({
    queryKey: vaultPositionKey(walletAddress),
    queryFn: () => getBalance(apiFetch),
    enabled: !!jwt && !!walletAddress,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: vaultPositionKey(walletAddress) });
    // The wallet's spendable balance changed too — refresh BalanceCard's view.
    queryClient.invalidateQueries({ queryKey: ["wallet-balances"] });
  };

  const depositMutation = useMutation({
    mutationFn: (amount: string) => {
      if (!wallet) throw new Error("Wallet not ready");
      const vault = infoQuery.data?.vault;
      if (!vault) throw new Error("Vault not loaded yet");
      return depositToVault(wallet, vault, { amount });
    },
    onSuccess: () => {
      invalidate();
      toast.success("Deposited to vault");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Deposit failed"),
  });

  const withdrawMutation = useMutation({
    mutationFn: (shares: string) => {
      if (!wallet) throw new Error("Wallet not ready");
      const vault = infoQuery.data?.vault;
      if (!vault) throw new Error("Vault not loaded yet");
      return withdrawFromVault(wallet, vault, { shares });
    },
    onSuccess: () => {
      invalidate();
      toast.success("Withdrawn from vault");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Withdraw failed"),
  });

  return {
    apy: infoQuery.data?.apy,
    isInfoLoading: infoQuery.isLoading,
    position: positionQuery.data != null ? fromSmallestUnit(positionQuery.data) : undefined,
    isPositionLoading: positionQuery.isFetching,
    refetchPosition: () => positionQuery.refetch(),
    deposit: (amount) => depositMutation.mutateAsync(amount),
    isDepositing: depositMutation.isPending,
    withdraw: (shares) => withdrawMutation.mutateAsync(shares),
    isWithdrawing: withdrawMutation.isPending,
  };
}
