import { Link } from "react-router-dom";
import { PhotonWordmark } from "@/components/brand/photon-mark";
import { WalletDisplay } from "@/components/WalletDisplay";

export function Navbar() {
    return (
        <nav className="sticky top-0 z-40 flex items-center justify-between border-b border-hairline bg-bg/80 px-5 py-3.5 backdrop-blur-md">
            <Link to="/" aria-label="PHOTON home">
                <PhotonWordmark />
            </Link>
            <WalletDisplay />
        </nav>
    );
}
