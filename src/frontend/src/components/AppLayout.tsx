import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  ArrowLeftRight,
  Calendar,
  DollarSign,
  Edit3,
  FileText,
  Heart,
  LayoutDashboard,
  LogOut,
  Package,
  TrendingDown,
  TrendingUp,
  User,
  Users,
} from "lucide-react";

interface AppLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Products", href: "/products", icon: Package },
  { name: "Reps", href: "/reps", icon: Users },
  { name: "Consignments", href: "/consignments", icon: TrendingUp },
  { name: "Sales", href: "/sales", icon: ArrowLeftRight },
  { name: "Returns", href: "/returns", icon: TrendingDown },
  { name: "Payouts", href: "/payouts", icon: DollarSign },
  { name: "Statements", href: "/statements", icon: FileText },
  { name: "Settlement Periods", href: "/settlement-periods", icon: Calendar },
  { name: "Adjustments", href: "/adjustments", icon: Edit3 },
];

/** Shorten a principal string for display: first 5 chars … last 3 chars */
function shortPrincipal(p: string | null): string {
  if (!p) return "Account";
  if (p.length <= 12) return p;
  return `${p.slice(0, 5)}…${p.slice(-3)}`;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const routerState = useRouterState();
  const navigate = useNavigate();
  const currentPath = routerState.location.pathname;
  const currentYear = new Date().getFullYear();
  const appIdentifier =
    typeof window !== "undefined"
      ? encodeURIComponent(window.location.hostname)
      : "consignflow";

  const { principalId, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate({ to: "/login" });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card print:hidden">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Package className="h-6 w-6" />
              </div>
              <span className="text-2xl font-bold tracking-tight">
                ConsignFlow
              </span>
            </Link>

            {/* User menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  data-ocid="header.user.button"
                  variant="outline"
                  size="sm"
                  className="gap-2 max-w-[180px]"
                >
                  <User className="h-4 w-4 shrink-0" />
                  <span className="truncate text-xs font-mono">
                    {shortPrincipal(principalId)}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium">Signed in as</span>
                  <span className="text-xs font-mono text-muted-foreground break-all">
                    {principalId ?? "—"}
                  </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  data-ocid="header.logout.button"
                  className="gap-2 text-destructive focus:text-destructive cursor-pointer"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <nav className="border-b border-border bg-card/50 print:hidden">
        <div className="container mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = currentPath === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-colors",
                    isActive
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:border-border hover:text-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">{children}</main>

      <footer className="mt-16 border-t border-border bg-card/50 py-8 print:hidden">
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
