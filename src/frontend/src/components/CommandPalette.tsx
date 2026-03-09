import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowLeftRight,
  Calendar,
  DollarSign,
  FileText,
  LayoutDashboard,
  Package,
  Plus,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Pipeline", href: "/consignments", icon: TrendingUp },
  { label: "Inventory", href: "/products", icon: Package },
  { label: "Contracts & Reps", href: "/reps", icon: Users },
  { label: "Payouts", href: "/payouts", icon: DollarSign },
  {
    label: "Disputes & Adjustments",
    href: "/adjustments",
    icon: AlertTriangle,
  },
  { label: "Statements", href: "/statements", icon: FileText },
  { label: "Settlement Periods", href: "/settlement-periods", icon: Calendar },
  { label: "Sales", href: "/sales", icon: ArrowLeftRight },
  { label: "Returns", href: "/returns", icon: TrendingDown },
];

const quickActions = [
  { label: "New Product", href: "/products", icon: Package },
  { label: "New Consignment", href: "/consignments", icon: TrendingUp },
  { label: "New Payout", href: "/payouts", icon: DollarSign },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const handleSelect = (href: string) => {
    setOpen(false);
    navigate({ to: href as never });
  };

  return (
    <>
      <button
        type="button"
        data-ocid="command_palette.command_palette_open"
        onClick={() => setOpen(true)}
        className={cn(
          "hidden items-center gap-2 rounded-md border border-border bg-muted px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted/80 md:flex",
        )}
      >
        <span>Search...</span>
        <kbd className="rounded border border-border bg-background px-1 text-[10px] font-mono">
          ⌘K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Navigate or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Pages">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <CommandItem
                  key={item.href}
                  value={item.label}
                  onSelect={() => handleSelect(item.href)}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {item.label}
                </CommandItem>
              );
            })}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Quick Actions">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <CommandItem
                  key={`action-${action.label}`}
                  value={action.label}
                  onSelect={() => handleSelect(action.href)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  <Icon className="mr-2 h-4 w-4" />
                  {action.label}
                </CommandItem>
              );
            })}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
