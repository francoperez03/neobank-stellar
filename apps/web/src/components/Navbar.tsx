import { WalletDisplay } from "@/components/WalletDisplay";

export function Navbar() {
    return (
        <nav className="flex items-center justify-between border-b p-4">
            <span className="text-lg font-semibold">Neobank Stellar</span>
            <WalletDisplay />
        </nav>
    );
}
