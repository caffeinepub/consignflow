import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAdjustments } from "@/hooks/useQueries";
import { cn } from "@/lib/utils";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowLeftRight,
  Calendar,
  DollarSign,
  FileText,
  LayoutDashboard,
  Menu,
  Package,
  Settings,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "consignflow-sidebar-collapsed";

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  ocid: string;
  badge?: boolean;
}

const primaryNav: NavItem[] = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    ocid: "sidebar.dashboard.link",
  },
  {
    name: "Pipeline",
    href: "/consignments",
    icon: TrendingUp,
    ocid: "sidebar.pipeline.link",
  },
  {
    name: "Inventory",
    href: "/products",
    icon: Package,
    ocid: "sidebar.inventory.link",
  },
  {
    name: "Contracts",
    href: "/reps",
    icon: Users,
    ocid: "sidebar.contracts.link",
  },
  {
    name: "Payouts",
    href: "/payouts",
    icon: DollarSign,
    ocid: "sidebar.payouts.link",
  },
  {
    name: "Disputes",
    href: "/adjustments",
    icon: AlertTriangle,
    ocid: "sidebar.disputes.link",
    badge: true,
  },
  {
    name: "Statements",
    href: "/statements",
    icon: FileText,
    ocid: "sidebar.statements.link",
  },
  {
    name: "Periods",
    href: "/settlement-periods",
    icon: Calendar,
    ocid: "sidebar.periods.link",
  },
];

const secondaryNav: NavItem[] = [
  {
    name: "Sales",
    href: "/sales",
    icon: ArrowLeftRight,
    ocid: "sidebar.sales.link",
  },
  {
    name: "Returns",
    href: "/returns",
    icon: TrendingDown,
    ocid: "sidebar.returns.link",
  },
];

const mobileNav = [...primaryNav.slice(0, 4), secondaryNav[0]];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

function NavItemButton({
  item,
  collapsed,
  isActive,
  badgeCount,
}: {
  item: NavItem;
  collapsed: boolean;
  isActive: boolean;
  badgeCount?: number;
}) {
  const Icon = item.icon;
  const inner = (
    <Link
      to={item.href}
      data-ocid={item.ocid}
      className={cn(
        "relative flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all duration-150",
        "group select-none",
        isActive
          ? "bg-primary/10 text-primary border-l-[3px] border-primary pl-[calc(0.75rem-3px)]"
          : "text-muted-foreground hover:bg-muted hover:text-foreground border-l-[3px] border-transparent pl-[calc(0.75rem-3px)]",
        collapsed && "justify-center px-2 pl-2",
      )}
    >
      <Icon className={cn("h-4 w-4 shrink-0", isActive && "text-primary")} />
      {!collapsed && <span className="truncate">{item.name}</span>}
      {item.badge && badgeCount && badgeCount > 0 ? (
        <Badge
          variant="destructive"
          className={cn(
            "ml-auto h-5 min-w-5 rounded-full px-1 text-[10px] font-bold",
            collapsed && "absolute -right-1 -top-1",
          )}
        >
          {badgeCount}
        </Badge>
      ) : null}
    </Link>
  );

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{inner}</TooltipTrigger>
        <TooltipContent side="right" className="font-medium">
          {item.name}
          {item.badge && badgeCount && badgeCount > 0 ? ` (${badgeCount})` : ""}
        </TooltipContent>
      </Tooltip>
    );
  }
  return inner;
}

export function GlobalSidebar({ collapsed, onToggle }: SidebarProps) {
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;
  const adjustmentsQuery = useAdjustments();
  const badgeCount = adjustmentsQuery.data?.length ?? 0;

  return (
    <TooltipProvider delayDuration={300}>
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-border bg-card transition-[width] duration-200 ease-in-out print:hidden",
          collapsed ? "w-16" : "w-60",
        )}
      >
        {/* Logo area */}
        <div
          className={cn(
            "flex h-16 shrink-0 items-center border-b border-border px-3",
            collapsed && "justify-center",
          )}
        >
          {!collapsed && (
            <Link
              to="/dashboard"
              className="flex items-center gap-2 overflow-hidden"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <Package className="h-4 w-4" />
              </div>
              <span className="truncate text-sm font-bold tracking-tight">
                ConsignFlow
              </span>
            </Link>
          )}
          {collapsed && (
            <Link to="/dashboard">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <Package className="h-4 w-4" />
              </div>
            </Link>
          )}
        </div>

        {/* Nav */}
        <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-2">
          {primaryNav.map((item) => (
            <NavItemButton
              key={item.href}
              item={item}
              collapsed={collapsed}
              isActive={currentPath === item.href}
              badgeCount={item.badge ? badgeCount : undefined}
            />
          ))}

          <div className="my-1.5 border-t border-border" />

          {secondaryNav.map((item) => (
            <NavItemButton
              key={item.href}
              item={item}
              collapsed={collapsed}
              isActive={currentPath === item.href}
            />
          ))}
        </nav>

        {/* Bottom settings */}
        <div className="shrink-0 border-t border-border p-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                data-ocid="sidebar.settings.link"
                className={cn(
                  "flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground border-l-[3px] border-transparent pl-[calc(0.75rem-3px)]",
                  collapsed && "justify-center px-2 pl-2",
                )}
              >
                <Settings className="h-4 w-4 shrink-0" />
                {!collapsed && <span>Settings</span>}
              </button>
            </TooltipTrigger>
            {collapsed && (
              <TooltipContent side="right">Settings</TooltipContent>
            )}
          </Tooltip>
        </div>

        {/* Toggle button */}
        <button
          type="button"
          data-ocid="sidebar.toggle.button"
          onClick={onToggle}
          title="Toggle sidebar ([)"
          className="absolute -right-3 top-20 z-50 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-sm transition-colors hover:text-foreground"
        >
          <Menu className="h-3 w-3" />
        </button>
      </aside>
    </TooltipProvider>
  );
}

export function MobileBottomNav() {
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;
  const adjustmentsQuery = useAdjustments();
  const badgeCount = adjustmentsQuery.data?.length ?? 0;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-around border-t border-border bg-card px-1 print:hidden md:hidden">
      {mobileNav.map((item) => {
        const Icon = item.icon;
        const isActive = currentPath === item.href;
        return (
          <Link
            key={item.href}
            to={item.href}
            data-ocid={item.ocid}
            className={cn(
              "relative flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition-colors",
              isActive ? "text-primary" : "text-muted-foreground",
            )}
          >
            <Icon className="h-5 w-5" />
            <span>{item.name}</span>
            {item.badge && badgeCount > 0 && (
              <span className="absolute right-1/4 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground">
                {badgeCount}
              </span>
            )}
          </Link>
        );
      })}
      <Sheet>
        <SheetTrigger asChild>
          <button
            type="button"
            className="flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-medium text-muted-foreground"
          >
            <Menu className="h-5 w-5" />
            <span>More</span>
          </button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-auto pb-safe">
          <div className="grid grid-cols-3 gap-2 p-4">
            {[...primaryNav.slice(4), ...secondaryNav.slice(1)].map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  data-ocid={item.ocid}
                  className="flex flex-col items-center gap-1.5 rounded-lg p-3 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <Icon className="h-6 w-6" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        </SheetContent>
      </Sheet>
    </nav>
  );
}

export function useSidebarState() {
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === "true";
    } catch {
      return false;
    }
  });

  const toggle = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY, String(next));
      } catch {}
      return next;
    });
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (
        e.key === "[" &&
        !e.ctrlKey &&
        !e.metaKey &&
        !(e.target instanceof HTMLInputElement) &&
        !(e.target instanceof HTMLTextAreaElement)
      ) {
        toggle();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [toggle]);

  return { collapsed, toggle };
}
