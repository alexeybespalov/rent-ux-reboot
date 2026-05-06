import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TripStatus } from "./types";

const STAGES: { key: TripStatus; label: string }[] = [
  { key: "new", label: "New" },
  { key: "confirmed", label: "Confirmed" },
  { key: "in_rent", label: "In rent" },
  { key: "finished", label: "Finished" },
  { key: "done", label: "Done" },
];

export function StatusFlow({ value, onChange }: { value: TripStatus; onChange: (s: TripStatus) => void }) {
  const activeIdx = STAGES.findIndex((s) => s.key === value);

  return (
    <div className="flex items-center gap-0.5 overflow-x-auto rounded-lg bg-muted/60 p-0.5 scrollbar-none">
      {STAGES.map((s, i) => {
        const done = i < activeIdx;
        const active = i === activeIdx;
        return (
          <button
            key={s.key}
            onClick={() => onChange(s.key)}
            className={cn(
              "flex min-w-fit flex-1 items-center justify-center gap-1 rounded-md px-2.5 py-1.5 text-[11px] font-medium transition-all",
              active && "bg-card text-foreground shadow-sm",
              done && "text-success",
              !active && !done && "text-muted-foreground hover:text-foreground",
            )}
          >
            {done ? (
              <Check className="h-3 w-3" />
            ) : (
              <span
                className={cn(
                  "flex h-3.5 w-3.5 items-center justify-center rounded-full text-[9px] font-bold",
                  active ? "bg-primary text-primary-foreground" : "bg-muted-foreground/20",
                )}
              >
                {i + 1}
              </span>
            )}
            <span className="whitespace-nowrap">{s.label}</span>
          </button>
        );
      })}
      <button
        onClick={() => onChange("reject")}
        className={cn(
          "min-w-fit rounded-md px-2.5 py-1.5 text-[11px] font-medium transition-all",
          value === "reject"
            ? "bg-destructive-soft text-destructive"
            : "text-muted-foreground hover:text-destructive",
        )}
      >
        Reject
      </button>
    </div>
  );
}