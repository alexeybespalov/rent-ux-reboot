import { Plus, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { TripData } from "../types";

export function OwnerSection({ trip: _trip }: { trip: TripData }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold">Supply & Owner Operations</div>
        <Button size="sm" variant="outline" className="h-8 gap-1"><Plus className="h-3.5 w-3.5" />New Booking</Button>
      </div>

      <div className="overflow-hidden rounded-2xl border bg-card">
        <div className="flex items-center justify-between border-b bg-muted/40 px-4 py-2.5">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">#122 Suzuki XL7</span>
            <span className="rounded-full bg-success-soft px-2 py-0.5 text-[10px] font-bold uppercase text-success">Active</span>
          </div>
          <div className="text-right text-xs">
            <div className="font-semibold">0 / day</div>
            <div className="text-muted-foreground">Total OB Cost: 0</div>
          </div>
        </div>
        <div className="px-4 py-2.5 text-xs text-muted-foreground">08/03/26 06:00 → 08/06/26 21:00</div>
        <div className="grid grid-cols-2 divide-x border-t">
          <div className="p-3">
            <div className="text-[10px] font-semibold uppercase text-muted-foreground">Allocated Rent</div>
            <div className="mt-1 text-lg font-bold tabular-nums">0</div>
          </div>
          <div className="p-3">
            <div className="text-[10px] font-semibold uppercase text-muted-foreground">Coverage Gap</div>
            <div className="mt-1 text-lg font-bold tabular-nums">59 <span className="text-xs font-normal text-muted-foreground">days</span></div>
          </div>
        </div>
        <div className="grid grid-cols-2 divide-x border-t bg-foreground text-background">
          <div className="p-3">
            <div className="text-[10px] font-semibold uppercase opacity-70">Total Booking Income</div>
            <div className="mt-1 text-base font-bold tabular-nums">15,000,000</div>
          </div>
          <div className="p-3">
            <div className="text-[10px] font-semibold uppercase opacity-70">💰 Net Margin (Est)</div>
            <div className="mt-1 text-base font-bold tabular-nums text-success">15,000,000</div>
          </div>
        </div>
        <div className="flex border-t">
          <button className="flex-1 py-2.5 text-xs font-medium hover:bg-muted">Edit Booking</button>
          <button className="border-l px-4 py-2.5 text-xs font-medium text-muted-foreground hover:bg-muted">Unlink</button>
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between text-xs">
          <span className="font-semibold uppercase tracking-wider text-muted-foreground">Shared Trips</span>
          <span className="text-muted-foreground">5 total</span>
        </div>
        <div className="space-y-1.5">
          {[{ id: "#342", name: "Anna", range: "09/03/26 → 14/03/26" }, { id: "#354", name: "Marat", range: "15/03/26 → 20/03/26" }].map((t) => (
            <div key={t.id} className="flex items-center gap-3 rounded-lg border bg-card px-3 py-2 text-xs">
              <Link2 className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="font-semibold">{t.id} {t.name}</span>
              <span className="text-muted-foreground">{t.range}</span>
              <span className="ml-auto rounded-full bg-warning-soft px-2 py-0.5 text-[10px] font-bold uppercase text-warning">Finished</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}