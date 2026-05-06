import { useEffect, useState } from "react";
import { CalendarClock, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

function fmt(d: Date) {
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}

export function TripProgress({ start, end, days }: { start: string; end: string; days: number }) {
  const startMs = new Date(start).getTime();
  const endMs = new Date(end).getTime();
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(t);
  }, []);

  const total = endMs - startMs;
  const elapsed = Math.max(0, Math.min(total, now - startMs));
  const pct = total > 0 ? (elapsed / total) * 100 : 0;
  const phase: "upcoming" | "active" | "ended" =
    now < startMs ? "upcoming" : now > endMs ? "ended" : "active";

  const dayMs = 24 * 60 * 60 * 1000;
  const currentDay = Math.min(days, Math.max(1, Math.ceil(elapsed / dayMs) || 1));

  const label =
    phase === "upcoming"
      ? `Starts in ${Math.ceil((startMs - now) / dayMs)}d`
      : phase === "ended"
        ? "Trip ended"
        : `Day ${currentDay} of ${days} · ${Math.round(pct)}%`;

  const tone =
    phase === "active" ? "bg-success" : phase === "ended" ? "bg-muted-foreground" : "bg-primary";

  return (
    <div className="rounded-xl border bg-card px-3 py-2">
      <div className="mb-1.5 flex items-center justify-between text-[11px]">
        <div className="flex items-center gap-1.5 font-semibold">
          {phase === "active" ? (
            <Clock className="h-3 w-3 text-success" />
          ) : (
            <CalendarClock className="h-3 w-3 text-muted-foreground" />
          )}
          {label}
        </div>
        <div className="text-[10px] tabular-nums text-muted-foreground">
          {fmt(new Date(start))} → {fmt(new Date(end))}
        </div>
      </div>
      <div className="relative h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className={cn("absolute inset-y-0 left-0 rounded-full transition-all", tone)}
          style={{ width: `${Math.max(2, pct)}%` }}
        />
        {phase === "active" && (
          <div
            className="absolute -top-0.5 h-2.5 w-2.5 -translate-x-1/2 rounded-full border-2 border-card bg-success shadow"
            style={{ left: `${pct}%` }}
          />
        )}
        {/* Day ticks */}
        {Array.from({ length: days - 1 }).map((_, i) => (
          <div
            key={i}
            className="absolute top-0 h-full w-px bg-card"
            style={{ left: `${((i + 1) / days) * 100}%` }}
          />
        ))}
      </div>
    </div>
  );
}