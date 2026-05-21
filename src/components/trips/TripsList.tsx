import { useMemo, useRef, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  X,
  AlertTriangle,
  CheckSquare,
  Square,
  Phone,
  MessageCircle,
  Trash2,
  Filter,
  Plus,
  CalendarDays,
  Sparkles,
  Ban,
  Home as HomeIcon,
  Car as CarIcon,
  CheckCheck,
  Flag,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { mockTrips, type TripRow, type TripStatus } from "./mockTrips";

/* ---------- helpers ---------- */

const STATUS_META: Record<TripStatus, { label: string; rail: string; text: string }> = {
  new:       { label: "new",       rail: "bg-primary",          text: "text-primary" },
  confirmed: { label: "confirmed", rail: "bg-warning",          text: "text-warning" },
  in_rent:   { label: "in_rent",   rail: "bg-success",          text: "text-success" },
  finished:  { label: "finished",  rail: "bg-sky-400",          text: "text-sky-600" },
  done:      { label: "done",      rail: "bg-muted-foreground", text: "text-muted-foreground" },
  reject:    { label: "reject",    rail: "bg-destructive",      text: "text-destructive" },
};

function fmtDM(iso: string) {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}`;
}
function fmtTime(iso: string) {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2,"0")}h`;
}

/* ---------- conflict detection: same car overlapping ---------- */
function detectConflicts(rows: TripRow[]): Set<number> {
  const out = new Set<number>();
  const byCar = new Map<string, TripRow[]>();
  for (const r of rows) {
    if (!r.plate) continue;
    const k = r.plate;
    if (!byCar.has(k)) byCar.set(k, []);
    byCar.get(k)!.push(r);
  }
  for (const [, list] of byCar) {
    if (list.length < 2) continue;
    for (let i = 0; i < list.length; i++) {
      for (let j = i+1; j < list.length; j++) {
        const a = list[i], b = list[j];
        const as = +new Date(a.start), ae = +new Date(a.end);
        const bs = +new Date(b.start), be = +new Date(b.end);
        if (as < be && bs < ae) { out.add(a.id); out.add(b.id); }
      }
    }
  }
  return out;
}

/* ---------- filter chips ---------- */

type ChipKey = "home" | "issues" | "done" | "reject";
const CHIPS: { key: ChipKey; icon: any; label: string; tone?: string }[] = [
  { key: "home",   icon: HomeIcon, label: "All" },
  { key: "issues", icon: Sparkles, label: "Issues", tone: "text-warning" },
  { key: "done",   icon: CheckCheck, label: "Done", tone: "text-success" },
  { key: "reject", icon: Ban, label: "Reject", tone: "text-destructive" },
];

type RangeKey = "today" | "tomorrow" | "7d" | "all";

/* ---------- main component ---------- */

export default function TripsList() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [chip, setChip] = useState<ChipKey>("home");
  const [range, setRange] = useState<RangeKey>("all");
  const [statusFilter, setStatusFilter] = useState<Set<TripStatus>>(new Set());
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [activeId, setActiveId] = useState<number | null>(null);
  const [selectMode, setSelectMode] = useState(false);

  const conflicts = useMemo(() => detectConflicts(mockTrips), []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return mockTrips.filter((r) => {
      if (statusFilter.size > 0 && !statusFilter.has(r.status)) return false;
      if (chip === "done" && r.status !== "done" && r.status !== "finished") return false;
      if (chip === "reject" && r.status !== "reject") return false;
      if (chip === "issues" && !conflicts.has(r.id)) return false;
      if (range !== "all") {
        const today = new Date(); today.setHours(0,0,0,0);
        const s = new Date(r.start); s.setHours(0,0,0,0);
        const diff = Math.round((s.getTime()-today.getTime())/86400000);
        if (range === "today" && diff !== 0) return false;
        if (range === "tomorrow" && diff !== 1) return false;
        if (range === "7d" && (diff < 0 || diff > 7)) return false;
      }
      if (!q) return true;
      return (
        String(r.id).includes(q) ||
        r.client.toLowerCase().includes(q) ||
        r.car.toLowerCase().includes(q) ||
        r.plate.toLowerCase().includes(q) ||
        (r.note ?? "").toLowerCase().includes(q)
      );
    });
  }, [query, chip, range, statusFilter, conflicts]);

  /* flat list sorted by start */
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => +new Date(a.start) - +new Date(b.start));
  }, [filtered]);

  const toggleSelect = (id: number) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
    if (next.size === 0) setSelectMode(false);
  };

  /* long-press → enter select mode */
  const pressTimer = useRef<number | null>(null);
  const onPressStart = (id: number) => {
    pressTimer.current = window.setTimeout(() => {
      setSelectMode(true);
      toggleSelect(id);
    }, 380);
  };
  const onPressEnd = () => {
    if (pressTimer.current) { clearTimeout(pressTimer.current); pressTimer.current = null; }
  };

  const active = useMemo(() => mockTrips.find((t) => t.id === activeId), [activeId]);

  return (
    <div className="min-h-screen bg-background">
      {/* Top toolbar */}
      <header className="sticky top-0 z-30 border-b bg-card/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center gap-1.5 px-2 py-1.5 sm:px-3">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search id, client, car, plate, note…"
              className="h-8 w-full rounded-md border bg-background pl-7 pr-7 text-xs outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
            />
            {query && (
              <button onClick={() => setQuery("")} className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted-foreground hover:bg-muted">
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
          <Link to="/" className="hidden h-8 items-center gap-1 rounded-md border bg-background px-2 text-[11px] font-medium text-muted-foreground hover:bg-muted sm:inline-flex">
            <HomeIcon className="h-3.5 w-3.5" /> Trip
          </Link>
          <button className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-[var(--shadow-sm)] hover:opacity-90">
            <Plus className="h-4 w-4" />
          </button>
          <button className="inline-flex h-8 w-8 items-center justify-center rounded-md border bg-background text-foreground hover:bg-muted">
            <CalendarDays className="h-4 w-4" />
          </button>
        </div>

        {/* chips row */}
        <div className="-mx-px flex items-center gap-1 overflow-x-auto border-t bg-background/60 px-2 py-1 sm:px-3">
          {CHIPS.map((c) => {
            const Icon = c.icon;
            const active = chip === c.key;
            return (
              <button
                key={c.key}
                onClick={() => setChip(c.key)}
                className={cn(
                  "inline-flex h-6 shrink-0 items-center gap-1 rounded-full border px-2 text-[10px] font-semibold uppercase tracking-wider transition-colors",
                  active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:bg-muted",
                  !active && c.tone,
                )}
              >
                <Icon className="h-3 w-3" /> {c.label}
              </button>
            );
          })}
          <span className="mx-1 h-3 w-px bg-border" />
          {(["today","tomorrow","7d","all"] as RangeKey[]).map((k) => (
            <button
              key={k}
              onClick={() => setRange(k)}
              className={cn(
                "h-6 shrink-0 rounded-full border px-2 text-[10px] font-semibold uppercase tracking-wider transition-colors",
                range === k ? "border-foreground bg-foreground text-background" : "border-border bg-card hover:bg-muted",
              )}
            >
              {k === "today" ? "Today" : k === "tomorrow" ? "Tomorrow" : k === "7d" ? "7D" : "All"}
            </button>
          ))}
          <span className="mx-1 h-3 w-px bg-border" />
          {(Object.keys(STATUS_META) as TripStatus[]).map((s) => {
            const on = statusFilter.has(s);
            return (
              <button
                key={s}
                onClick={() => {
                  const n = new Set(statusFilter);
                  on ? n.delete(s) : n.add(s);
                  setStatusFilter(n);
                }}
                className={cn(
                  "inline-flex h-6 shrink-0 items-center gap-1 rounded-full border px-2 text-[10px] font-semibold lowercase tracking-wide transition-colors",
                  on ? "border-foreground bg-foreground text-background" : "border-border bg-card hover:bg-muted",
                )}
              >
                <span className={cn("h-1.5 w-1.5 rounded-full", STATUS_META[s].rail)} />
                {s.replace("_", " ")}
              </button>
            );
          })}
          <span className="ml-auto inline-flex h-6 shrink-0 items-center gap-1 rounded-full bg-muted px-2 text-[10px] font-bold tabular-nums text-muted-foreground">
            <Filter className="h-3 w-3" /> {filtered.length}
          </span>
        </div>

        {/* bulk action bar */}
        {selectMode && selected.size > 0 && (
          <div className="flex items-center gap-2 border-t bg-primary-soft px-3 py-1.5 text-xs">
            <span className="font-bold text-primary">{selected.size} selected</span>
            <button className="ml-auto inline-flex h-7 items-center gap-1 rounded-md bg-card px-2 font-medium hover:bg-muted">
              <CheckCheck className="h-3.5 w-3.5" /> Mark done
            </button>
            <button className="inline-flex h-7 items-center gap-1 rounded-md bg-card px-2 font-medium text-destructive hover:bg-destructive-soft">
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </button>
            <button
              onClick={() => { setSelected(new Set()); setSelectMode(false); }}
              className="inline-flex h-7 w-7 items-center justify-center rounded-md hover:bg-card"
              title="Cancel"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </header>

      {/* Body: master / detail on lg */}
      <div className="mx-auto grid max-w-7xl grid-cols-1 lg:grid-cols-[1fr_380px]">
        <main className="min-w-0">
          {sorted.length === 0 && (
            <div className="p-10 text-center text-xs text-muted-foreground">No trips match the filters.</div>
          )}
          <ul className="divide-y divide-border/70">
            {sorted.map((r) => {
              const meta = STATUS_META[r.status];
                  const isSel = selected.has(r.id);
                  const isActive = activeId === r.id;
                  const hasConflict = conflicts.has(r.id);
                  return (
                    <li
                      key={r.id}
                      onClick={() => {
                        if (selectMode) toggleSelect(r.id);
                        else if (window.matchMedia("(min-width: 1024px)").matches) setActiveId(r.id);
                        else navigate("/");
                      }}
                      onMouseDown={() => onPressStart(r.id)}
                      onMouseUp={onPressEnd}
                      onMouseLeave={onPressEnd}
                      onTouchStart={() => onPressStart(r.id)}
                      onTouchEnd={onPressEnd}
                      className={cn(
                        "group relative flex cursor-pointer items-stretch gap-1.5 pl-0 pr-2 transition-colors",
                        isActive ? "bg-muted/60" : isSel ? "bg-primary-soft/30" : "hover:bg-muted/40",
                      )}
                    >
                      {/* status rail */}
                      <span className={cn("w-[2px] shrink-0", meta.rail)} />

                      {/* checkbox in select mode */}
                      {selectMode && (
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleSelect(r.id); }}
                          className="flex items-center pl-1 text-primary"
                        >
                          {isSel ? <CheckSquare className="h-3.5 w-3.5" /> : <Square className="h-3.5 w-3.5 text-muted-foreground" />}
                        </button>
                      )}

                      {/* main content — ultra-dense, monochrome */}
                      <div className="min-w-0 flex-1 py-[5px]">
                        {/* row 1: id · status · client · meta */}
                        <div className="flex items-center gap-1.5 text-[11px] leading-tight">
                          <span className="shrink-0 font-bold tabular-nums text-muted-foreground">#{r.id}</span>
                          <span className={cn("shrink-0 text-[10px] font-semibold lowercase", meta.text)}>
                            {r.status.replace("_"," ")}
                          </span>
                          <span className="min-w-0 flex-1 truncate font-semibold text-foreground">
                            {r.flag && <Flag className="mr-1 inline h-2.5 w-2.5 fill-destructive text-destructive" />}
                            {r.client}
                          </span>
                          {r.daysLeft != null && (
                            <span className="shrink-0 tabular-nums text-[10px] text-muted-foreground">{r.daysLeft}d</span>
                          )}
                          {r.badges?.map((b) => (
                            <span key={b} className="shrink-0 rounded border border-border px-1 text-[9px] font-semibold text-muted-foreground">{b}</span>
                          ))}
                          {hasConflict && (
                            <AlertTriangle className="h-3 w-3 shrink-0 text-destructive" />
                          )}
                        </div>
                        {/* row 2: dates · car */}
                        <div className="mt-0.5 flex items-center gap-1.5 text-[10.5px] leading-tight text-muted-foreground">
                          <span className="shrink-0 tabular-nums">{fmtDM(r.start)}–{fmtDM(r.end)}</span>
                          <span className="shrink-0 text-muted-foreground/60">·</span>
                          <span className="min-w-0 flex-1 truncate">
                            <CarIcon className={cn("mr-1 inline h-2.5 w-2.5", r.carIcon === "ok" ? "text-success" : "text-muted-foreground/60")} />
                            {r.car || "—"} <span className="tabular-nums text-muted-foreground/80">{r.plate}</span>
                          </span>
                          {r.note && (
                            <span className="ml-1 shrink truncate max-w-[40%] text-warning/80">{r.note}</span>
                          )}
                        </div>
                      </div>

                      {/* quick actions desktop hover */}
                      <div className="hidden items-center gap-0.5 self-center opacity-0 transition-opacity group-hover:opacity-100 lg:flex">
                        <button onClick={(e) => e.stopPropagation()} className="inline-flex h-6 w-6 items-center justify-center rounded hover:bg-card" title="Call">
                          <Phone className="h-3 w-3" />
                        </button>
                        <button onClick={(e) => e.stopPropagation()} className="inline-flex h-6 w-6 items-center justify-center rounded hover:bg-card" title="WhatsApp">
                          <MessageCircle className="h-3 w-3 text-success" />
                        </button>
                      </div>
                </li>
              );
            })}
          </ul>
        </main>

        {/* desktop master-detail preview */}
        <aside className="sticky top-[80px] hidden h-[calc(100vh-80px)] border-l bg-card/40 lg:block">
          {active ? <DetailPreview row={active} hasConflict={conflicts.has(active.id)} /> : (
            <div className="flex h-full items-center justify-center p-6 text-center text-xs text-muted-foreground">
              Pick a trip to preview it here.
            </div>
          )}
        </aside>
      </div>

      {/* mobile detail bottom-sheet */}
    </div>
  );
}

/* ---------- preview panel ---------- */

function DetailPreview({ row, hasConflict, onClose }: { row: TripRow; hasConflict: boolean; onClose?: () => void }) {
  const meta = STATUS_META[row.status];
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b px-3 py-2">
        <span className={cn("h-2 w-2 rounded-full", meta.rail)} />
        <span className="text-sm font-bold">#{row.id}</span>
        <span className={cn("text-[10px] font-bold uppercase tracking-wider", meta.text)}>
          {row.status.replace("_"," ")}
        </span>
        {hasConflict && (
          <span className="inline-flex items-center gap-1 rounded bg-destructive-soft px-1.5 py-0.5 text-[10px] font-bold text-destructive">
            <AlertTriangle className="h-3 w-3" /> conflict
          </span>
        )}
        <Link to="/" className="ml-auto text-[11px] font-semibold text-primary hover:underline">Open →</Link>
        {onClose && (
          <button onClick={onClose} className="ml-1 rounded p-1 hover:bg-muted"><X className="h-3.5 w-3.5" /></button>
        )}
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto p-3 text-xs">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Client</div>
          <div className="text-sm font-semibold">{row.client}</div>
        </div>
        <div className="grid grid-cols-2 gap-2 rounded-lg border bg-background p-2">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Pick up</div>
            <div className="font-semibold tabular-nums">{fmtDM(row.start)} {fmtTime(row.start)}</div>
            <div className="text-muted-foreground">{row.pickup}</div>
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Return</div>
            <div className="font-semibold tabular-nums">{fmtDM(row.end)} {fmtTime(row.end)}</div>
            <div className="text-muted-foreground">{row.dropoff}</div>
          </div>
        </div>
        <div className="rounded-lg border bg-background p-2">
          <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Car</div>
          <div className="flex items-center gap-2">
            <CarIcon className={cn("h-3.5 w-3.5", row.carIcon === "ok" ? "text-success" : "text-muted-foreground")} />
            <span className="font-semibold">{row.car || "—"}</span>
            <span className="ml-auto tabular-nums text-muted-foreground">{row.plate}</span>
          </div>
        </div>
        {row.note && (
          <div className="rounded-lg border border-warning/30 bg-warning-soft/60 p-2">
            <div className="text-[10px] font-bold uppercase tracking-wider text-warning">Note</div>
            <div className="text-foreground">{row.note}</div>
          </div>
        )}
        {row.priceVnd && (
          <div className="rounded-lg border bg-background p-2">
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Price</div>
            <div className="text-sm font-bold tabular-nums">{new Intl.NumberFormat("en-US").format(row.priceVnd)} VND</div>
          </div>
        )}
        <div className="grid grid-cols-3 gap-1.5">
          <button className="inline-flex h-9 items-center justify-center gap-1 rounded-lg bg-primary text-xs font-semibold text-primary-foreground"><Phone className="h-3.5 w-3.5" /> Call</button>
          <button className="inline-flex h-9 items-center justify-center gap-1 rounded-lg bg-success text-xs font-semibold text-success-foreground"><MessageCircle className="h-3.5 w-3.5" /> WhatsApp</button>
          <button className="inline-flex h-9 items-center justify-center gap-1 rounded-lg border bg-card text-xs font-semibold text-destructive"><Trash2 className="h-3.5 w-3.5" /> Delete</button>
        </div>
      </div>
    </div>
  );
}