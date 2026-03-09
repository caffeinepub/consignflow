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
import { useNavigate } from "@tanstack/react-router";
import { Clock, Heart, LogOut, User } from "lucide-react";
import { useState } from "react";
import { CommandPalette } from "./CommandPalette";
import {
  GlobalSidebar,
  MobileBottomNav,
  useSidebarState,
} from "./GlobalSidebar";
import { SystemTimeline } from "./SystemTimeline";

interface AppLayoutProps {
  children: React.ReactNode;
}

/** Shorten a principal string for display: first 5 chars … last 3 chars */
function shortPrincipal(p: string | null): string {
  if (!p) return "Account";
  if (p.length <= 12) return p;
  return `${p.slice(0, 5)}…${p.slice(-3)}`;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();
  const appIdentifier =
    typeof window !== "undefined"
      ? encodeURIComponent(window.location.hostname)
      : "consignflow";

  const { principalId, logout } = useAuth();
  const { collapsed, toggle } = useSidebarState();
  const [timelineOpen, setTimelineOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate({ to: "/login" });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar (desktop) */}
      <div className="hidden md:block">
        <GlobalSidebar collapsed={collapsed} onToggle={toggle} />
      </div>

      {/* System Timeline Drawer */}
      <SystemTimeline
        open={timelineOpen}
        onClose={() => setTimelineOpen(false)}
      />

      {/* Main area wrapper */}
      <div
        className={cn(
          "flex min-h-screen flex-col transition-[margin] duration-200 ease-in-out",
          "md:ml-16",
          !collapsed && "md:ml-60",
        )}
      >
        {/* Top header */}
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-border bg-card px-4 print:hidden">
          <div className="flex items-center gap-3">
            {/* Mobile: logo */}
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground md:hidden">
              <span className="text-xs font-bold">CF</span>
            </div>
            <span className="text-sm font-bold tracking-tight md:hidden">
              ConsignFlow
            </span>

            {/* Desktop: search/command */}
            <div className="hidden md:block">
              <CommandPalette />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Timeline toggle */}
            <Button
              data-ocid="header.timeline.button"
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setTimelineOpen((o) => !o)}
              title="Activity timeline (T)"
            >
              <Clock className="h-4 w-4" />
            </Button>

            {/* User menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  data-ocid="header.user.button"
                  variant="outline"
                  size="sm"
                  className="gap-2 max-w-[160px]"
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
        </header>

        {/* Page content */}
        <main className="flex-1 px-4 py-8 pb-20 md:pb-8">{children}</main>

        {/* Footer */}
        <footer className="border-t border-border bg-card/50 py-6 print:hidden">
          <div className="px-4 text-center text-sm text-muted-foreground">
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

      {/* Mobile bottom nav */}
      <MobileBottomNav />
    </div>
  );
}
