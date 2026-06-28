import { Outlet, Route, Routes } from "react-router-dom";
import { AppProviders as ProviderStack } from "@/providers/app-providers";
import { Home } from "@/pages/home";
import { AppLayout } from "@/pages/app/layout";
import { AppIndexPage } from "@/pages/app";
import { OnboardingPage } from "@/pages/app/onboarding";
import { AuthPage } from "@/pages/app/auth";
import { PreviewPage } from "@/pages/app/preview";
import { PublicInvoiceUpload } from "@/pages/public/invoice-upload";

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
      {/* Public invoice intake — no auth, suppliers upload via link token. */}
      <Route path="/pay/:token" element={<PublicInvoiceUpload />} />
      <Route path="/__preview" element={<AppProviders />}>
        <Route index element={<PreviewPage />} />
      </Route>
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
