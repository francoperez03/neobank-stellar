import { Outlet, Route, Routes } from "react-router-dom";
import { AppProviders as ProviderStack } from "@/providers/app-providers";
import { Home } from "@/pages/home";
import { AppLayout } from "@/pages/app/layout";
import { AppIndexPage } from "@/pages/app";
import { OnboardingPage } from "@/pages/app/onboarding";
import { AuthPage } from "@/pages/app/auth";

function AppProviders() {
  return (
    <ProviderStack>
      <Outlet />
    </ProviderStack>
  );
}

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/app" element={<AppProviders />}>
        <Route path="auth" element={<AuthPage />} />
        <Route path="onboarding" element={<OnboardingPage />} />
        <Route element={<AppLayout />}> {/* Require KYC */}
          <Route index element={<AppIndexPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
