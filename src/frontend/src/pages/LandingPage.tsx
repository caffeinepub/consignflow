import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link } from "@tanstack/react-router";
import {
  CheckCircle,
  FileCheck,
  Heart,
  Package,
  Shield,
  Zap,
} from "lucide-react";

export default function LandingPage() {
  const currentYear = new Date().getFullYear();
  const appIdentifier =
    typeof window !== "undefined"
      ? encodeURIComponent(window.location.hostname)
      : "consignflow";

  const valueBlocks = [
    {
      icon: CheckCircle,
      title: "Transparent for consignors",
      description:
        "Show each partner exactly what sold, what's pending, and what was paid—so you spend less time explaining numbers and more time growing inventory.",
    },
    {
      icon: Shield,
      title: "Payouts you can trust",
      description:
        "Codified rules compute commissions and fees the same way, every time, turning end-of-period settlement into a single review click instead of a spreadsheet marathon.",
    },
    {
      icon: Zap,
      title: "Designed for the floor, not the back office",
      description:
        "Simple item and returns flows, clean dashboards, and zero accounting jargon keep your team moving—even on the busiest days.",
    },
    {
      icon: FileCheck,
      title: "Audit-ready by default",
      description:
        "Every adjustment, settlement, and return is logged, so you can justify any number in seconds when partners or accountants ask.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Package className="h-6 w-6" />
              </div>
              <span className="text-2xl font-bold tracking-tight">
                ConsignFlow
              </span>
            </div>
            <Link to="/login">
              <Button
                data-ocid="landing.signin.button"
                variant="outline"
                size="sm"
              >
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            Consign smarter. Settle faster. Grow together.
          </h1>
          <p className="mt-6 text-lg text-muted-foreground sm:text-xl md:text-2xl">
            A focused workspace for consignment shops and brands to track
            inventory, calculate commissions, and release payouts with
            confidence—without spreadsheets or chaos.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link to="/login">
              <Button
                data-ocid="landing.open_draft.primary_button"
                size="lg"
                className="w-full sm:w-auto"
              >
                Open Draft
              </Button>
            </Link>
            <Link to="/login">
              <Button
                data-ocid="landing.demo.secondary_button"
                size="lg"
                variant="outline"
                className="w-full sm:w-auto"
              >
                View Live Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Value Blocks */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {valueBlocks.map((block, index) => {
            const Icon = block.icon;
            return (
              <Card key={index} className="border-border">
                <CardHeader>
                  <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl">{block.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    {block.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-20 border-t border-border bg-card/50 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © {currentYear}. Built with{" "}
          <Heart className="inline h-4 w-4 text-accent fill-accent" /> using{" "}
          <a
            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appIdentifier}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-foreground hover:text-primary transition-colors"
          >
            caffeine.ai
          </a>
        </div>
      </footer>
    </div>
  );
}
