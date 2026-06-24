import { Outlet } from "react-router-dom";
import { AppProviders } from "@/providers/app-providers";

export function AppLayout() {
  return (
    <AppProviders>
      <Outlet />
    </AppProviders>
  );
}
