import { Plus, ArrowDownLeft, ArrowUpRight, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { TripData } from "../types";

const fmt = (n: number, c: string) => `${new Intl.NumberFormat("en-US").format(n)} ${c}`;

export function PaymentsSection({ trip }: { trip: TripData }) {
  const inUsd = trip.payments.filter((p) => p.direction === "in" && p.currency === "USD" && p.status === "Done").reduce((s, p) => s + p.amount, 0);
  const inVnd = trip.payments.filter((p) => p.direction === "in" && p.currency === "VND" && p.status === "Done").reduce((s, p) => s + p.amount, 0);
  const settled = trip.payments.reduce((s, p) => s + (p.delta || 0), 0);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-xl border bg-success-soft/40 p-3">
          <div className="text-[10px] font-bold uppercase tracking-wider text-success">In (Client)</div>
          <div className="mt-1 text-base font-semibold tabular-nums">{fmt(inUsd, "USD")}</div>
          <div className="text-xs text-muted-foreground tabular-nums">{fmt(inVnd, "VND")}</div>
        </div>
        <div className="rounded-xl border bg-destructive-soft/40 p-3">
          <div className="text-[10px] font-bold uppercase tracking-wider text-destructive">Out (Owner)</div>
          <div className="mt-1 text-base font-semibold text-muted-foreground">—</div>
        </div>
      </div>

      <div className="flex items-center justify-between rounded-xl border bg-muted/40 px-3 py-2">
        <span className="text-xs text-muted-foreground">Settled Δ (VND)</span>
        <span className="text-sm font-semibold text-success tabular-nums">{new Intl.NumberFormat("de-DE").format(settled)}</span>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-sm font-semibold">Payments</div>
        <div className="flex items-center gap-1.5">
          <Button size="sm" variant="outline" className="h-8 gap-1"><Plus className="h-3.5 w-3.5" />Add</Button>
          <Button size="sm" variant="outline" className="h-8 border-success/30 text-success hover:bg-success-soft">Settle 0s</Button>
          <Button size="sm" variant="outline" className="h-8 border-primary/30 text-primary hover:bg-primary-soft">Settle Dep</Button>
        </div>
      </div>

      <div className="space-y-2">
        {trip.payments.map((p) => (
          <div key={p.id} className="overflow-hidden rounded-xl border bg-card">
            <div
              className={cn(
                "flex items-center justify-between px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider",
                p.type === "RENT" && "bg-primary-soft text-primary",
                p.type === "DEPOSIT" && "bg-success-soft text-success",
                p.type === "EXTRA" && "bg-warning-soft text-warning",
              )}
            >
              <span>{p.type}</span>
              {p.delta !== undefined && (
                <span className="font-mono">Δ {new Intl.NumberFormat("de-DE").format(p.delta)}</span>
              )}
            </div>
            <div className="flex items-center gap-3 p-3">
              <div
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                  p.direction === "in" ? "bg-success-soft text-success" : "bg-destructive-soft text-destructive",
                )}
              >
                {p.direction === "in" ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">{p.party}</div>
                <div className="text-xs text-muted-foreground">{p.date} • {p.method}</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold tabular-nums">{fmt(p.amount, p.currency)}</div>
                <div className={cn(
                  "mt-0.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold",
                  p.status === "Done" ? "bg-success-soft text-success" : "bg-warning-soft text-warning",
                )}>
                  {p.status === "Done" ? <Check className="h-2.5 w-2.5" /> : <AlertCircle className="h-2.5 w-2.5" />}
                  {p.status}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}