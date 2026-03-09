import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useAdjustments,
  useConsignments,
  usePayouts,
  useReturns,
  useSales,
} from "@/hooks/useQueries";
import { cn } from "@/lib/utils";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowLeftRight,
  DollarSign,
  RotateCcw,
  SlidersHorizontal,
  TrendingUp,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const LAST_OPENED_KEY = "consignflow-timeline-last-opened";

type EventFilter = "all" | "financial" | "inventory" | "disputes" | "periods";

interface TimelineEvent {
  id: string;
  type: "consign_out" | "sale" | "return" | "payout" | "adjustment";
  label: string;
  description: string;
  timestamp: number;
  href: string;
  dotColor: string;
  filter: EventFilter[];
  Icon: React.ElementType;
}

function formatRelativeDate(ts: number): string {
  const now = new Date();
  const d = new Date(ts);
  const todayStr = now.toDateString();
  const yesterdayDate = new Date(now);
  yesterdayDate.setDate(now.getDate() - 1);
  if (d.toDateString() === todayStr) return "Today";
  if (d.toDateString() === yesterdayDate.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface SystemTimelineProps {
  open: boolean;
  onClose: () => void;
}

export function SystemTimeline({ open, onClose }: SystemTimelineProps) {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<EventFilter>("all");
  const [lastOpened, setLastOpened] = useState<number>(() => {
    try {
      return Number(localStorage.getItem(LAST_OPENED_KEY) ?? "0");
    } catch {
      return 0;
    }
  });

  const consignmentsQ = useConsignments();
  const salesQ = useSales();
  const returnsQ = useReturns();
  const payoutsQ = usePayouts();
  const adjustmentsQ = useAdjustments();

  const events = useMemo<TimelineEvent[]>(() => {
    const result: TimelineEvent[] = [];
    const toMs = (d: bigint) =>
      Number(d) > 1e12 ? Number(d) / 1_000_000 : Number(d) * 1000;

    for (const [i, c] of (consignmentsQ.data ?? []).entries()) {
      result.push({
        id: `consign-${i}`,
        type: "consign_out",
        label: "Consignment created",
        description: `Rep #${c.repId} · ${c.quantity} units`,
        timestamp: toMs(c.date),
        href: "/consignments",
        dotColor: "bg-blue-500",
        filter: ["all", "inventory"],
        Icon: TrendingUp,
      });
    }
    for (const [i, s] of (salesQ.data ?? []).entries()) {
      result.push({
        id: `sale-${i}`,
        type: "sale",
        label: "Sale recorded",
        description: `Rep #${s.repId} · ${s.quantity} × $${(Number(s.unitPrice) / 100).toFixed(2)}`,
        timestamp: toMs(s.date),
        href: "/sales",
        dotColor: "bg-emerald-500",
        filter: ["all", "financial"],
        Icon: ArrowLeftRight,
      });
    }
    for (const [i, r] of (returnsQ.data ?? []).entries()) {
      result.push({
        id: `return-${i}`,
        type: "return",
        label: "Return logged",
        description: `Rep #${r.repId} · ${r.quantity} units`,
        timestamp: toMs(r.date),
        href: "/returns",
        dotColor: "bg-orange-500",
        filter: ["all", "inventory"],
        Icon: RotateCcw,
      });
    }
    for (const [i, p] of (payoutsQ.data ?? []).entries()) {
      result.push({
        id: `payout-${i}`,
        type: "payout",
        label: "Payout released",
        description: `Rep #${p.repId} · $${(Number(p.amount) / 100).toFixed(2)}`,
        timestamp: toMs(p.date),
        href: "/payouts",
        dotColor: "bg-purple-500",
        filter: ["all", "financial"],
        Icon: DollarSign,
      });
    }
    for (const [i, a] of (adjustmentsQ.data ?? []).entries()) {
      result.push({
        id: `adj-${i}`,
        type: "adjustment",
        label: "Adjustment made",
        description: a.notes || `Rep #${a.repId}`,
        timestamp: toMs(a.date),
        href: "/adjustments",
        dotColor: "bg-yellow-500",
        filter: ["all", "disputes"],
        Icon: SlidersHorizontal,
      });
    }
    return result.sort((a, b) => b.timestamp - a.timestamp);
  }, [
    consignmentsQ.data,
    salesQ.data,
    returnsQ.data,
    payoutsQ.data,
    adjustmentsQ.data,
  ]);

  const filtered = useMemo(
    () => events.filter((e) => e.filter.includes(filter)),
    [events, filter],
  );
  const unreadCount = useMemo(
    () => events.filter((e) => e.timestamp > lastOpened).length,
    [events, lastOpened],
  );

  const grouped = useMemo(() => {
    const map: Record<string, TimelineEvent[]> = {};
    for (const ev of filtered) {
      const key = formatRelativeDate(ev.timestamp);
      if (!map[key]) map[key] = [];
      map[key].push(ev);
    }
    return Object.entries(map);
  }, [filtered]);

  const prevOpen = useRef(false);
  useEffect(() => {
    if (open && !prevOpen.current) {
      const now = Date.now();
      setLastOpened(now);
      try {
        localStorage.setItem(LAST_OPENED_KEY, String(now));
      } catch {}
    }
    prevOpen.current = open;
  }, [open]);

  const handleClose = useCallback(() => onClose(), [onClose]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (
        e.key === "t" &&
        !e.ctrlKey &&
        !e.metaKey &&
        !(e.target instanceof HTMLInputElement) &&
        !(e.target instanceof HTMLTextAreaElement)
      ) {
        if (open) handleClose();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, handleClose]);

  return (
    <>
      {open && (
        // biome-ignore lint/a11y/useKeyWithClickEvents: overlay dismiss
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px] print:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed right-0 top-0 z-50 flex h-full w-80 flex-col border-l border-border bg-card shadow-2xl transition-transform duration-300 ease-in-out print:hidden",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-border px-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">Activity</span>
            {unreadCount > 0 && (
              <Badge
                variant="default"
                className="h-5 rounded-full px-1.5 text-[10px]"
              >
                {unreadCount} new
              </Badge>
            )}
          </div>
          <Button
            data-ocid="timeline.close.button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="shrink-0 border-b border-border px-3 py-2">
          <Tabs
            value={filter}
            onValueChange={(v) => setFilter(v as EventFilter)}
          >
            <TabsList className="h-7 w-full gap-0.5 p-0.5">
              <TabsTrigger
                data-ocid="timeline.all.tab"
                value="all"
                className="h-6 flex-1 px-1 text-[10px]"
              >
                All
              </TabsTrigger>
              <TabsTrigger
                data-ocid="timeline.financial.tab"
                value="financial"
                className="h-6 flex-1 px-1 text-[10px]"
              >
                Financial
              </TabsTrigger>
              <TabsTrigger
                data-ocid="timeline.inventory.tab"
                value="inventory"
                className="h-6 flex-1 px-1 text-[10px]"
              >
                Inventory
              </TabsTrigger>
              <TabsTrigger
                data-ocid="timeline.disputes.tab"
                value="disputes"
                className="h-6 flex-1 px-1 text-[10px]"
              >
                Disputes
              </TabsTrigger>
              <TabsTrigger
                data-ocid="timeline.periods.tab"
                value="periods"
                className="h-6 flex-1 px-1 text-[10px]"
              >
                Periods
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <ScrollArea className="flex-1">
          {grouped.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-center text-muted-foreground">
              <SlidersHorizontal className="h-8 w-8 opacity-30" />
              <p className="text-sm">No events yet</p>
              <p className="text-xs">Activity will appear here as you work.</p>
            </div>
          ) : (
            <div className="pb-6">
              {grouped.map(([dateLabel, evts]) => (
                <div key={dateLabel}>
                  <div className="sticky top-0 z-10 bg-card/95 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground backdrop-blur">
                    {dateLabel}
                  </div>
                  {evts.map((ev, idx) => {
                    const isUnread = ev.timestamp > lastOpened;
                    const Icon = ev.Icon;
                    return (
                      <button
                        type="button"
                        key={ev.id}
                        data-ocid={`timeline.item.${idx + 1}`}
                        onClick={() => {
                          navigate({ to: ev.href as never });
                          onClose();
                        }}
                        className={cn(
                          "flex w-full items-start gap-3 border-l-2 px-4 py-3 text-left transition-colors hover:bg-muted/60",
                          isUnread ? "border-primary" : "border-transparent",
                        )}
                      >
                        <div className="mt-0.5 flex shrink-0 flex-col items-center gap-1">
                          <span
                            className={cn(
                              "h-2.5 w-2.5 rounded-full",
                              ev.dotColor,
                            )}
                          />
                          <Icon className="h-3 w-3 text-muted-foreground" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-medium text-foreground">
                            {ev.label}
                          </p>
                          <p className="truncate text-[11px] text-muted-foreground">
                            {ev.description}
                          </p>
                        </div>
                        <span className="shrink-0 text-[10px] text-muted-foreground">
                          {formatTime(ev.timestamp)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </aside>
    </>
  );
}
