import { Outlet } from "react-router-dom";
import { AppProviders } from "@/providers/app-providers";
import { Navbar } from "@/components/Navbar";

export function AppLayout() {
  return (
    <AppProviders>
      <Navbar />
      <Outlet />
    </AppProviders>
  );
}
