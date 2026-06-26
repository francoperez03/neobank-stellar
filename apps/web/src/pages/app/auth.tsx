import { Navigate, Link } from "react-router-dom";
import { useUser } from "@/hooks/use-user";
import { PhotonWordmark } from "@/components/brand/photon-mark";
import { Button } from "@/components/ui/button";
import { FullScreenLoader } from "@/components/ui/full-screen-loader";

export function AuthPage() {
  const { authStatus, login, isAuthLoading } = useUser();

  if (isAuthLoading) {
    return <FullScreenLoader />;
  }

  if (authStatus === "logged-in") {
    return <Navigate to="/app" replace />;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-bg px-6">
      <div className="w-full max-w-sm space-y-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <PhotonWordmark />
          <div className="space-y-1">
            <h1 className="text-xl font-semibold text-ink">Sign in to continue</h1>
            <p className="text-muted-foreground text-sm">
              Use your email or Google to access your PHOTON account.
            </p>
          </div>
        </div>

        <Button className="w-full" size="lg" onClick={() => login()}>
          Continue
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          <Link to="/" className="hover:text-ink underline underline-offset-4 transition-colors">
            Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
