import { useMemo, useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
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

const STATUS_META: Record<TripStatus, { label: string; rail: string; tint: string; text: string }> = {
  new:       { label: "new",       rail: "bg-primary",     tint: "bg-primary-soft/40",  text: "text-primary" },
  confirmed: { label: "confirmed", rail: "bg-warning",     tint: "bg-warning-soft/40",  text: "text-warning" },
  in_rent:   { label: "in_rent",   rail: "bg-success",     tint: "bg-success-soft/30",  text: "text-success" },
  finished:  { label: "finished",  rail: "bg-sky-400",     tint: "bg-sky-50",           text: "text-sky-600" },
  done:      { label: "done",      rail: "bg-muted-foreground", tint: "bg-muted/40",    text: "text-muted-foreground" },
  reject:    { label: "reject",    rail: "bg-destructive", tint: "bg-destructive-soft/40", text: "text-destructive" },
};

const BADGE_STYLE: Record<string, string> = {
  "D+": "bg-orange-500 text-white",
  "R+": "bg-rose-500 text-white",
  "OA": "bg-amber-500 text-white",
  "H":  "bg-violet-500 text-white",
};

function fmtDM(iso: string) {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}`;
}
function fmtTime(iso: string) {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2,"0")}h`;
}
function dayKey(iso: string) {
  const d = new Date(iso);
  return d.toISOString().slice(0,10);
}
function dayLabel(iso: string) {
  const today = new Date(); today.setHours(0,0,0,0);
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate()+1);
  const d = new Date(iso); d.setHours(0,0,0,0);
  const diff = Math.round((d.getTime()-today.getTime())/86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff === -1) return "Yesterday";
  const w = d.toLocaleDateString("en-US",{weekday:"short"});
  const m = d.toLocaleDateString("en-US",{month:"short",day:"numeric"});
  return `${w} · ${m}`;
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

  /* group by start day */
  const groups = useMemo(() => {
    const map = new Map<string, TripRow[]>();
    for (const r of filtered) {
      const k = dayKey(r.start);
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(r);
    }
    return Array.from(map.entries()).sort(([a],[b]) => a < b ? -1 : 1);
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
          {groups.length === 0 && (
            <div className="p-10 text-center text-xs text-muted-foreground">No trips match the filters.</div>
          )}
          {groups.map(([k, rows]) => (
            <section key={k}>
              <div className="sticky top-[76px] z-20 flex items-center gap-2 border-b bg-background/95 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground backdrop-blur sm:top-[80px]">
                <span className="text-foreground">{dayLabel(rows[0].start)}</span>
                <span className="text-muted-foreground/70">· {fmtDM(rows[0].start)}</span>
                <span className="ml-auto rounded bg-muted px-1.5 py-0.5 tabular-nums">{rows.length}</span>
              </div>
              <ul className="divide-y divide-border/70">
                {rows.map((r) => {
                  const meta = STATUS_META[r.status];
                  const isSel = selected.has(r.id);
                  const isActive = activeId === r.id;
                  const hasConflict = conflicts.has(r.id);
                  return (
                    <li
                      key={r.id}
                      onClick={() => {
                        if (selectMode) toggleSelect(r.id);
                        else setActiveId(r.id);
                      }}
                      onMouseDown={() => onPressStart(r.id)}
                      onMouseUp={onPressEnd}
                      onMouseLeave={onPressEnd}
                      onTouchStart={() => onPressStart(r.id)}
                      onTouchEnd={onPressEnd}
                      className={cn(
                        "group relative flex cursor-pointer items-stretch gap-2 pl-0 pr-2 transition-colors",
                        isActive ? "bg-primary-soft/60" : isSel ? "bg-primary-soft/40" : "hover:bg-muted/50",
                      )}
                    >
                      {/* status rail */}
                      <span className={cn("w-[3px] shrink-0", meta.rail)} />

                      {/* checkbox in select mode */}
                      {selectMode && (
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleSelect(r.id); }}
                          className="flex items-center pl-1 text-primary"
                        >
                          {isSel ? <CheckSquare className="h-3.5 w-3.5" /> : <Square className="h-3.5 w-3.5 text-muted-foreground" />}
                        </button>
                      )}

                      {/* main content — ultra-dense */}
                      <div className="min-w-0 flex-1 py-1">
                        {/* row 1 */}
                        <div className="flex items-center gap-1.5 text-[11px] leading-tight">
                          <span className="shrink-0 font-bold tabular-nums">#{r.id}</span>
                          <span className={cn("shrink-0 rounded px-1 text-[9px] font-bold uppercase tracking-wider", meta.tint, meta.text)}>
                            {r.status.replace("_"," ")}
                          </span>
                          {r.daysLeft != null && (
                            <span className="shrink-0 rounded bg-muted px-1 text-[9px] font-bold tabular-nums text-muted-foreground">({r.daysLeft})</span>
                          )}
                          {r.badges?.map((b) => (
                            <span key={b} className={cn("shrink-0 rounded px-1 text-[9px] font-bold", BADGE_STYLE[b] ?? "bg-muted text-foreground")}>{b}</span>
                          ))}
                          {hasConflict && (
                            <span title="Car overlap conflict" className="shrink-0 inline-flex items-center gap-0.5 rounded bg-destructive-soft px-1 text-[9px] font-bold text-destructive">
                              <AlertTriangle className="h-2.5 w-2.5" /> conflict
                            </span>
                          )}
                          <span className="ml-auto shrink-0 truncate font-semibold text-foreground">{r.client}</span>
                        </div>
                        {/* row 2 */}
                        <div className="mt-0.5 flex items-center gap-1.5 text-[10.5px] leading-tight text-muted-foreground">
                          <span className="shrink-0 tabular-nums">{fmtDM(r.start)} {fmtTime(r.start)}</span>
                          <span className="shrink-0">→</span>
                          <span className="shrink-0 font-semibold tabular-nums text-foreground">{fmtDM(r.end)} {fmtTime(r.end)}</span>
                          <span className="mx-1 hidden h-3 w-px bg-border sm:inline" />
                          <span className="hidden truncate sm:inline">{r.pickup}{r.dropoff && r.pickup !== r.dropoff ? ` → ${r.dropoff}` : ""}</span>
                          <span className="ml-auto flex min-w-0 shrink items-center gap-1 truncate">
                            {r.flag && <Flag className="h-2.5 w-2.5 shrink-0 fill-destructive text-destructive" />}
                            <CarIcon className={cn("h-2.5 w-2.5 shrink-0", r.carIcon === "ok" ? "text-success" : "text-muted-foreground")} />
                            <span className="truncate text-foreground">{r.car}</span>
                            <span className="shrink-0 tabular-nums">{r.plate}</span>
                          </span>
                        </div>
                        {/* row 3 note */}
                        {r.note && (
                          <div className="mt-0.5 truncate text-[10.5px] leading-tight text-warning/90">
                            <span className="mr-1">📝</span>{r.note}
                          </div>
                        )}
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
            </section>
          ))}
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
      {active && (
        <div className="lg:hidden">
          <div onClick={() => setActiveId(null)} className="fixed inset-0 z-40 bg-black/40 animate-fade-in" />
          <div className="fixed inset-x-0 bottom-0 z-50 max-h-[80vh] overflow-y-auto rounded-t-2xl border-t bg-card pb-[max(env(safe-area-inset-bottom),0.75rem)] shadow-[var(--shadow-lg)] animate-slide-in-right">
            <div className="mx-auto my-2 h-1 w-10 rounded-full bg-muted" />
            <DetailPreview row={active} hasConflict={conflicts.has(active.id)} onClose={() => setActiveId(null)} />
          </div>
        </div>
      )}
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
        <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider", meta.tint, meta.text)}>
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