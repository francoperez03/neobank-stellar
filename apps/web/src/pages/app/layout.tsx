import { Outlet } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { RequireKYC } from "@/components/require-kyc";

export function AppLayout() {
  return (
    <RequireKYC>
      <div className="min-h-screen bg-bg text-ink">
        <Navbar />
        <Outlet />
      </div>
    </RequireKYC>
  );
}
