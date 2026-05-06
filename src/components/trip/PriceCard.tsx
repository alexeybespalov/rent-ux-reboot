import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import type { TripData } from "./types";

const fmt = (n: number) => new Intl.NumberFormat("en-US").format(n);

export function PriceCard({ trip, sticky = true }: { trip: TripData; sticky?: boolean }) {
  const { base, insurance, extras, afterHours, lateBooking, taxRate } = trip.price;
  const subtotal = base + insurance + extras + afterHours + lateBooking;
  const tax = Math.round(subtotal * taxRate);
  const total = subtotal + tax;

  const lines = [
    { label: "Base", value: base },
    { label: "Insurance", value: insurance },
    { label: "Extras", value: extras },
    { label: "After-hours pickup", value: afterHours },
    { label: "Late booking", value: lateBooking },
  ];

  return (
    <div className={sticky ? "lg:sticky lg:top-4" : ""}>
      <div className="overflow-hidden rounded-2xl border bg-card shadow-[var(--shadow-md)]">
        <div className="border-b bg-gradient-to-br from-primary-soft to-card px-4 py-3">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-primary">Live Price</div>
          <div className="mt-0.5 text-xs text-muted-foreground">
            priced as: <span className="font-medium text-foreground">{trip.car.name}</span>
          </div>
        </div>
        <div className="space-y-2 px-4 py-3 text-sm">
          {lines.map((l) => (
            <div key={l.label} className="flex items-baseline justify-between">
              <span className="text-muted-foreground">{l.label}</span>
              <span className="font-medium tabular-nums">{fmt(l.value)}</span>
            </div>
          ))}
          <div className="!mt-3 flex items-baseline justify-between border-t pt-2.5">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-semibold tabular-nums">{fmt(subtotal)}</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-muted-foreground">Tax ({Math.round(taxRate * 100)}%)</span>
            <span className="font-medium tabular-nums">{fmt(tax)}</span>
          </div>
          <div className="!mt-3 flex items-baseline justify-between rounded-xl bg-primary px-3 py-2.5 text-primary-foreground">
            <span className="text-xs font-bold uppercase tracking-wider">Total</span>
            <span className="text-lg font-bold tabular-nums">{fmt(total)}</span>
          </div>
        </div>
        <div className="border-t bg-muted/40 p-3">
          <Button className="h-10 w-full gap-2" size="sm">
            <Save className="h-4 w-4" /> Save changes
          </Button>
        </div>
      </div>
    </div>
  );
}