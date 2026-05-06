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
    <div className="space-y-2">
      <div className="grid grid-cols-3 gap-1.5">
        <div className="rounded-lg border bg-success-soft/40 px-2 py-1.5">
          <div className="text-[9px] font-bold uppercase tracking-wider text-success">In</div>
          <div className="text-xs font-semibold tabular-nums">{fmt(inUsd, "USD")}</div>
          <div className="text-[10px] text-muted-foreground tabular-nums">{fmt(inVnd, "VND")}</div>
        </div>
        <div className="rounded-lg border bg-destructive-soft/40 px-2 py-1.5">
          <div className="text-[9px] font-bold uppercase tracking-wider text-destructive">Out</div>
          <div className="text-xs font-semibold text-muted-foreground">—</div>
        </div>
        <div className="rounded-lg border bg-muted/40 px-2 py-1.5">
          <div className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Δ VND</div>
          <div className="text-xs font-semibold text-success tabular-nums">{new Intl.NumberFormat("de-DE").format(settled)}</div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-1.5">
        <div className="text-xs font-semibold">Payments</div>
        <div className="flex items-center gap-1">
          <Button size="sm" variant="outline" className="h-7 gap-1 px-2 text-xs"><Plus className="h-3 w-3" />Add</Button>
          <Button size="sm" variant="outline" className="h-7 px-2 text-xs border-success/30 text-success hover:bg-success-soft">Settle 0s</Button>
          <Button size="sm" variant="outline" className="h-7 px-2 text-xs border-primary/30 text-primary hover:bg-primary-soft">Settle Dep</Button>
        </div>
      </div>

      <div className="divide-y overflow-hidden rounded-xl border bg-card">
        {trip.payments.map((p) => (
          <div key={p.id} className="flex items-center gap-2 px-2.5 py-1.5">
            <div
              className={cn(
                "flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
                p.direction === "in" ? "bg-success-soft text-success" : "bg-destructive-soft text-destructive",
              )}
            >
              {p.direction === "in" ? <ArrowDownLeft className="h-3 w-3" /> : <ArrowUpRight className="h-3 w-3" />}
            </div>
            <span className={cn(
              "shrink-0 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider",
              p.type === "RENT" && "bg-primary-soft text-primary",
              p.type === "DEPOSIT" && "bg-success-soft text-success",
              p.type === "EXTRA" && "bg-warning-soft text-warning",
            )}>{p.type}</span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-xs font-medium">{p.party}</div>
              <div className="truncate text-[10px] text-muted-foreground">{p.date} • {p.method}{p.delta !== undefined && ` • Δ ${new Intl.NumberFormat("de-DE").format(p.delta)}`}</div>
            </div>
            <div className="text-right">
              <div className="text-xs font-bold tabular-nums">{fmt(p.amount, p.currency)}</div>
              <div className={cn(
                "inline-flex items-center gap-0.5 text-[10px] font-semibold",
                p.status === "Done" ? "text-success" : "text-warning",
              )}>
                {p.status === "Done" ? <Check className="h-2.5 w-2.5" /> : <AlertCircle className="h-2.5 w-2.5" />}
                {p.status}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}