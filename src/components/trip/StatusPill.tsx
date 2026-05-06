import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { TripStatus } from "./types";

const STAGES: { key: TripStatus; label: string }[] = [
  { key: "new", label: "New" },
  { key: "confirmed", label: "Confirmed" },
  { key: "in_rent", label: "In rent" },
  { key: "finished", label: "Finished" },
  { key: "done", label: "Done" },
  { key: "reject", label: "Reject" },
];

const STYLES: Record<TripStatus, string> = {
  new: "bg-primary-soft text-primary",
  confirmed: "bg-accent text-accent-foreground",
  in_rent: "bg-warning-soft text-warning",
  finished: "bg-muted text-foreground",
  done: "bg-success-soft text-success",
  reject: "bg-destructive-soft text-destructive",
};

export function StatusPill({ value, onChange }: { value: TripStatus; onChange: (s: TripStatus) => void }) {
  const current = STAGES.find((s) => s.key === value)!;
  const idx = STAGES.findIndex((s) => s.key === value);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "flex h-7 items-center gap-1 rounded-md px-2 text-[11px] font-bold uppercase tracking-wider transition-all hover:opacity-80",
            STYLES[value],
          )}
        >
          <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-current/20 text-[9px] font-bold">
            {idx + 1}
          </span>
          {current.label}
          <ChevronDown className="h-3 w-3 opacity-70" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        {STAGES.map((s, i) => {
          const active = s.key === value;
          const done = i < idx && s.key !== "reject";
          return (
            <DropdownMenuItem
              key={s.key}
              onClick={() => onChange(s.key)}
              className="flex items-center gap-2 text-xs"
            >
              <span className={cn(
                "flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold",
                active ? "bg-primary text-primary-foreground" : done ? "bg-success text-success-foreground" : "bg-muted text-muted-foreground",
              )}>
                {done ? <Check className="h-2.5 w-2.5" /> : i + 1}
              </span>
              <span className={cn(active && "font-semibold")}>{s.label}</span>
              {active && <span className="ml-auto text-[10px] text-muted-foreground">current</span>}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}