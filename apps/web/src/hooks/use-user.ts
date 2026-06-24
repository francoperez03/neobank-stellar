import { useCrossmintAuth, useWallet } from "@crossmint/client-sdk-react-ui";

type AuthContext = ReturnType<typeof useCrossmintAuth>;
type WalletContext = ReturnType<typeof useWallet>;

export type AuthStatus = AuthContext["status"];
export type WalletStatus = WalletContext["status"];

export interface UseUserResult {
    user?: AuthContext["user"];
    wallet?: WalletContext["wallet"];
    authStatus: AuthStatus;
    walletStatus: WalletStatus;
    isAuthenticated: boolean;
    isWalletLoading: boolean;
    walletAddress?: string;
    login: (defaultEmail?: string) => void;
    logout: () => Promise<void>;
}

export function useUser(): UseUserResult {
    const { user, status: authStatus, login, logout } = useCrossmintAuth();
    const { wallet, status: walletStatus } = useWallet();

    return {
        user,
        wallet,
        authStatus,
        walletStatus,
        isAuthenticated: authStatus === "logged-in",
        isWalletLoading: walletStatus === "in-progress",
        walletAddress: wallet?.address,
        login,
        logout,
    };
}
