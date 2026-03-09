import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useFirstRun } from "@/hooks/useFirstRun";
import { useNavigate } from "@tanstack/react-router";
import { CheckCircle, Package } from "lucide-react";

export default function WelcomeScreen() {
  const navigate = useNavigate();
  const { markWelcomeCompleted } = useFirstRun();

  const capabilities = [
    "Capture consignment terms and commission rules once, reuse everywhere.",
    "Track items from intake to sale to payout with clear statuses.",
    "Generate settlement statements that collaborators actually understand.",
    "Keep a living history of every change—no more lost context in email.",
  ];

  const handleContinue = () => {
    markWelcomeCompleted();
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Package className="h-10 w-10" />
          </div>
          <CardTitle className="text-3xl">Welcome to ConsignFlow</CardTitle>
          <CardDescription className="text-lg mt-2">
            What you can do here
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <ul className="space-y-4">
            {capabilities.map((capability, index) => (
              <li key={index} className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 shrink-0 text-primary mt-0.5" />
                <span className="text-base leading-relaxed">{capability}</span>
              </li>
            ))}
          </ul>
          <div className="flex justify-center pt-4">
            <Button
              size="lg"
              onClick={handleContinue}
              className="w-full sm:w-auto"
            >
              Get Started
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
