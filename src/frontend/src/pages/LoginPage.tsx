import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "@tanstack/react-router";
import { Loader2, LogIn, Package } from "lucide-react";
import { useEffect } from "react";

export default function LoginPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isInitializing, isLoggingIn, login } = useAuth();

  // Redirect to dashboard once authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate({ to: "/dashboard" });
    }
  }, [isAuthenticated, navigate]);

  const isPending = isInitializing || isLoggingIn;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-sm shadow-lg">
        <CardHeader className="text-center space-y-3">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow">
            <Package className="h-8 w-8" />
          </div>
          <CardTitle className="text-2xl">Sign in to ConsignFlow</CardTitle>
          <CardDescription>
            Use Internet Identity to securely access your consignment workspace.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 pb-6">
          <Button
            data-ocid="login.primary_button"
            size="lg"
            className="w-full gap-2"
            onClick={login}
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <LogIn className="h-5 w-5" />
            )}
            {isLoggingIn ? "Connecting…" : "Login with Internet Identity"}
          </Button>

          <Button
            data-ocid="login.secondary_button"
            size="lg"
            variant="outline"
            className="w-full gap-2 opacity-60 cursor-not-allowed"
            disabled
          >
            Continue with Email
            <span className="ml-auto text-xs font-normal text-muted-foreground">
              Coming soon
            </span>
          </Button>

          <p className="text-center text-xs text-muted-foreground pt-2">
            Internet Identity is a decentralised, password-free authentication
            system on the Internet Computer.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
