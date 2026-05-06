import { Plus, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { TripData } from "../types";

export function OwnerSection({ trip: _trip }: { trip: TripData }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="text-xs font-semibold">Supply & Owner Operations</div>
        <Button size="sm" variant="outline" className="h-7 gap-1 px-2 text-xs"><Plus className="h-3 w-3" />New Booking</Button>
      </div>

      <div className="overflow-hidden rounded-xl border bg-card">
        <div className="flex items-center justify-between border-b bg-muted/40 px-2.5 py-1.5">
          <div className="flex min-w-0 items-center gap-1.5">
            <span className="truncate text-xs font-semibold">#122 Suzuki XL7</span>
            <span className="rounded bg-success-soft px-1.5 py-0 text-[9px] font-bold uppercase text-success">Active</span>
          </div>
          <div className="text-right text-[10px]">
            <span className="font-semibold">0/day</span>
            <span className="text-muted-foreground"> · OB 0</span>
          </div>
        </div>
        <div className="px-2.5 py-1 text-[10px] text-muted-foreground">08/03/26 06:00 → 08/06/26 21:00</div>
        <div className="grid grid-cols-2 divide-x border-t text-xs">
          <div className="px-2.5 py-1.5">
            <div className="text-[9px] font-semibold uppercase text-muted-foreground">Allocated</div>
            <div className="text-sm font-bold tabular-nums">0</div>
          </div>
          <div className="px-2.5 py-1.5">
            <div className="text-[9px] font-semibold uppercase text-muted-foreground">Cov. gap</div>
            <div className="text-sm font-bold tabular-nums">59 <span className="text-[10px] font-normal text-muted-foreground">d</span></div>
          </div>
        </div>
        <div className="grid grid-cols-2 divide-x border-t bg-foreground text-background">
          <div className="px-2.5 py-1.5">
            <div className="text-[9px] font-semibold uppercase opacity-70">Income</div>
            <div className="text-sm font-bold tabular-nums">15,000,000</div>
          </div>
          <div className="px-2.5 py-1.5">
            <div className="text-[9px] font-semibold uppercase opacity-70">Margin</div>
            <div className="text-sm font-bold tabular-nums text-success">15,000,000</div>
          </div>
        </div>
        <div className="flex border-t text-xs">
          <button className="flex-1 py-1.5 font-medium hover:bg-muted">Edit Booking</button>
          <button className="border-l px-3 py-1.5 font-medium text-muted-foreground hover:bg-muted">Unlink</button>
        </div>
      </div>

      <div>
        <div className="mb-1 flex items-center justify-between text-[11px]">
          <span className="font-semibold uppercase tracking-wider text-muted-foreground">Shared Trips</span>
          <span className="text-muted-foreground">5</span>
        </div>
        <div className="divide-y overflow-hidden rounded-lg border bg-card">
          {[{ id: "#342", name: "Anna", range: "09/03 → 14/03" }, { id: "#354", name: "Marat", range: "15/03 → 20/03" }].map((t) => (
            <div key={t.id} className="flex items-center gap-2 px-2.5 py-1.5 text-[11px]">
              <Link2 className="h-3 w-3 text-muted-foreground" />
              <span className="font-semibold">{t.id} {t.name}</span>
              <span className="text-muted-foreground">{t.range}</span>
              <span className="ml-auto rounded bg-warning-soft px-1.5 py-0 text-[9px] font-bold uppercase text-warning">Finished</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}