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
  MapPin,
  Clock,
  Globe2,
  ArrowRight,
  Plane,
  Building2,
  Anchor,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { mockTrips, type TripRow, type TripStatus } from "./mockTrips";
import { mockTrip } from "@/components/trip/mockData";
import { PriceCard } from "@/components/trip/PriceCard";
import {
  Mail,
  Languages,
  Menu,
  Command as CommandIcon,
  Sun,
  Sunrise,
  CalendarRange,
  Infinity as InfinityIcon,
  ListChecks,
  FileText,
  RotateCw,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

/* ---------- helpers ---------- */

/* Все статусы — пастель + цветной рейл. Текст статуса не показываем (цвет = статус). */
const STATUS_META: Record<TripStatus, { label: string; rail: string; text: string; rowBg: string; dot: string }> = {
  new:       { label: "new",       rail: "bg-indigo-400",  text: "text-indigo-700",  rowBg: "bg-indigo-50/60 hover:bg-indigo-50",   dot: "bg-indigo-400" },
  confirmed: { label: "confirmed", rail: "bg-amber-400",   text: "text-amber-700",   rowBg: "bg-amber-50/60 hover:bg-amber-50",     dot: "bg-amber-400" },
  in_rent:   { label: "in rent",   rail: "bg-emerald-500", text: "text-emerald-700", rowBg: "bg-emerald-50/60 hover:bg-emerald-50", dot: "bg-emerald-500" },
  finished:  { label: "finished",  rail: "bg-sky-400",     text: "text-sky-700",     rowBg: "bg-sky-50/60 hover:bg-sky-50",         dot: "bg-sky-400" },
  done:      { label: "done",      rail: "bg-slate-400",   text: "text-slate-700",   rowBg: "bg-slate-50/70 hover:bg-slate-100/60", dot: "bg-slate-400" },
  reject:    { label: "reject",    rail: "bg-rose-400",    text: "text-rose-700",    rowBg: "bg-rose-50/60 hover:bg-rose-50",       dot: "bg-rose-400" },
};

/* ---------- badge palette (color-coded so OA / D+ / R+ / H not blend) ---------- */
const BADGE_STYLE: Record<string, string> = {
  "D+": "border-emerald-300 bg-emerald-50 text-emerald-700",   // Deposit paid
  "R+": "border-blue-300 bg-blue-50 text-blue-700",            // Rent paid
  "OA": "border-amber-300 bg-amber-50 text-amber-700",         // Owner action
  "H":  "border-violet-300 bg-violet-50 text-violet-700",      // Handover / hold
};
const BADGE_TITLE: Record<string, string> = {
  "D+": "Deposit paid",
  "R+": "Rent paid",
  "OA": "Owner action",
  "H":  "Handover",
};

function fmtDM(iso: string) {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}`;
}
function fmtTime(iso: string) {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2,"0")}h`;
}
function daysBetween(a: string, b: string) {
  return Math.max(1, Math.round((+new Date(b) - +new Date(a)) / 86400000));
}
function fmtVnd(v: number) {
  return new Intl.NumberFormat("en-US").format(v);
}

/* ---------- pickup / dropoff visual helpers ---------- */
/* Tone per location keyword — pastel chip, so locations don't blend. */
function locTone(loc: string): { bg: string; text: string; icon: any; short: string } {
  const s = (loc || "").toLowerCase();
  if (!loc || loc === "—") return { bg: "bg-muted", text: "text-muted-foreground", icon: MapPin, short: "—" };
  if (s.includes("cam ranh"))   return { bg: "bg-sky-100",     text: "text-sky-700",     icon: Plane,     short: "Cam Ranh" };
  if (s.includes("tan son"))    return { bg: "bg-sky-100",     text: "text-sky-700",     icon: Plane,     short: "TSN" };
  if (s.includes("airport"))    return { bg: "bg-sky-100",     text: "text-sky-700",     icon: Plane,     short: loc };
  if (s.includes("vinrent"))    return { bg: "bg-violet-100",  text: "text-violet-700",  icon: Building2, short: "VinRent" };
  if (s.includes("nha trang"))  return { bg: "bg-emerald-100", text: "text-emerald-700", icon: Anchor,    short: "Nha Trang" };
  return { bg: "bg-amber-100", text: "text-amber-700", icon: MapPin, short: loc };
}

function LocChip({ loc }: { loc: string }) {
  const t = locTone(loc);
  const Icon = t.icon;
  return (
    <span
      title={loc || "—"}
      className={cn(
        "inline-flex min-w-0 max-w-[44%] shrink items-center gap-1 rounded px-1.5 py-[1px] text-[10px] font-semibold leading-none",
        t.bg, t.text,
      )}
    >
      <Icon className="h-2.5 w-2.5 shrink-0" />
      <span className="truncate">{t.short}</span>
    </span>
  );
}

function RouteLine({ pickup, dropoff }: { pickup: string; dropoff: string }) {
  const same = pickup && dropoff && pickup.trim().toLowerCase() === dropoff.trim().toLowerCase();
  return (
    <div className="mt-0.5 flex items-center gap-1 text-[10px] leading-tight">
      <LocChip loc={pickup} />
      {same ? (
        <span className="text-[9px] font-medium uppercase tracking-wider text-muted-foreground/70">round-trip</span>
      ) : (
        <>
          <ArrowRight className="h-2.5 w-2.5 shrink-0 text-muted-foreground/70" />
          <LocChip loc={dropoff} />
        </>
      )}
    </div>
  );
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

/* ---------- filter chips (icon-only with tooltips) ---------- */

type ChipKey = "home" | "issues" | "done" | "reject";
const CHIPS: { key: ChipKey; icon: any; title: string; tone?: string }[] = [
  { key: "home",   icon: ListChecks, title: "All trips" },
  { key: "issues", icon: Sparkles,   title: "Issues / conflicts", tone: "text-warning" },
  { key: "done",   icon: CheckCheck, title: "Done & finished",    tone: "text-success" },
  { key: "reject", icon: Ban,        title: "Rejected",           tone: "text-destructive" },
];

type RangeKey = "today" | "tomorrow" | "7d" | "all";
const RANGES: { key: RangeKey; icon: any; title: string }[] = [
  { key: "today",    icon: Sun,           title: "Today" },
  { key: "tomorrow", icon: Sunrise,       title: "Tomorrow" },
  { key: "7d",       icon: CalendarRange, title: "Next 7 days" },
  { key: "all",      icon: InfinityIcon,  title: "Any date" },
];

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
        <div className="mx-auto flex max-w-7xl items-center gap-1 px-2 py-1.5 sm:px-3">
          {/* App menu (mobile + desktop) */}
          <Sheet>
            <SheetTrigger asChild>
              <button className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border bg-background text-foreground hover:bg-muted" title="Menu">
                <Menu className="h-4 w-4" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-3">
              <div className="mb-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Navigation</div>
              <nav className="space-y-1 text-sm">
                <Link to="/trips" className="flex items-center gap-2 rounded-md bg-primary-soft px-2 py-2 font-semibold text-primary">
                  <ListChecks className="h-4 w-4" /> Trips
                </Link>
                <Link to="/" className="flex items-center gap-2 rounded-md px-2 py-2 text-foreground hover:bg-muted">
                  <FileText className="h-4 w-4" /> Trip editor
                </Link>
                <button className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-foreground hover:bg-muted">
                  <CalendarDays className="h-4 w-4" /> Calendar
                </button>
                <button className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-foreground hover:bg-muted">
                  <Sparkles className="h-4 w-4" /> Issues
                </button>
                <button className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-foreground hover:bg-muted">
                  <RotateCw className="h-4 w-4" /> Refresh
                </button>
              </nav>
            </SheetContent>
          </Sheet>

          <Link to="/" className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border bg-background text-muted-foreground hover:bg-muted" title="Open trip editor">
            <HomeIcon className="h-4 w-4" />
          </Link>

          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search id, client, car, plate, note…"
              className="h-8 w-full rounded-md border bg-background pl-7 pr-7 text-xs outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
            />
            {query && (
              <button onClick={() => setQuery("")} className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted-foreground hover:bg-muted" title="Clear">
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          <button className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-md border bg-background text-muted-foreground hover:bg-muted sm:inline-flex" title="Command palette (⌘K)">
            <CommandIcon className="h-4 w-4" />
          </button>
          <button className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border bg-background text-foreground hover:bg-muted" title="Calendar view">
            <CalendarDays className="h-4 w-4" />
          </button>
          <button className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-[var(--shadow-sm)] hover:opacity-90" title="New trip">
            <Plus className="h-4 w-4" />
          </button>
        </div>

        {/* chips row */}
        <div className="-mx-px flex items-center gap-0.5 overflow-x-auto border-t bg-background/60 px-2 py-1 sm:px-3">
          {/* Preset chips — icon-only */}
          {CHIPS.map((c) => {
            const Icon = c.icon;
            const isActive = chip === c.key;
            return (
              <button
                key={c.key}
                onClick={() => setChip(c.key)}
                title={c.title}
                aria-label={c.title}
                className={cn(
                  "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md border transition-colors",
                  isActive ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:bg-muted",
                  !isActive && c.tone,
                )}
              >
                <Icon className="h-3.5 w-3.5" />
              </button>
            );
          })}

          <span className="mx-1 h-4 w-px bg-border" />

          {/* Date range — icon-only */}
          {RANGES.map((r) => {
            const Icon = r.icon;
            const isActive = range === r.key;
            return (
              <button
                key={r.key}
                onClick={() => setRange(r.key)}
                title={r.title}
                aria-label={r.title}
                className={cn(
                  "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md border transition-colors",
                  isActive ? "border-foreground bg-foreground text-background" : "border-border bg-card hover:bg-muted",
                )}
              >
                <Icon className="h-3.5 w-3.5" />
              </button>
            );
          })}

          <span className="mx-1 h-4 w-px bg-border" />

          {/* Status filters — color dot only */}
          {(Object.keys(STATUS_META) as TripStatus[]).map((s) => {
            const on = statusFilter.has(s);
            const m = STATUS_META[s];
            return (
              <button
                key={s}
                onClick={() => {
                  const n = new Set(statusFilter);
                  on ? n.delete(s) : n.add(s);
                  setStatusFilter(n);
                }}
                title={m.label}
                aria-label={`Filter: ${m.label}`}
                className={cn(
                  "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md border transition-colors",
                  on ? "border-foreground bg-foreground" : "border-border bg-card hover:bg-muted",
                )}
              >
                <span className={cn("h-2.5 w-2.5 rounded-full", m.dot)} />
              </button>
            );
          })}

          <span className="ml-auto inline-flex h-7 shrink-0 items-center gap-1 rounded-md bg-muted px-2 text-[10px] font-bold tabular-nums text-muted-foreground" title="Visible trips">
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
                        isActive
                          ? "bg-muted/60"
                          : isSel
                          ? "bg-primary-soft/30"
                          : meta.rowBg,
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
                          {/* status — только цветная точка, без текста (цвет фона + рейл уже сигналят) */}
                          <span title={meta.label} className={cn("h-1.5 w-1.5 shrink-0 rounded-full", meta.dot)} />
                          <span className="min-w-0 flex-1 truncate font-semibold text-foreground">
                            {r.flag && <Flag className="mr-1 inline h-2.5 w-2.5 fill-destructive text-destructive" />}
                            {r.client}
                          </span>
                          {r.daysLeft != null && (
                            <span className="shrink-0 tabular-nums text-[10px] text-muted-foreground">{r.daysLeft}d</span>
                          )}
                          {r.badges?.map((b) => (
                            <span
                              key={b}
                              title={BADGE_TITLE[b] ?? b}
                              className={cn(
                                "shrink-0 rounded border px-1 text-[9px] font-bold tabular-nums",
                                BADGE_STYLE[b] ?? "border-border text-muted-foreground",
                              )}
                            >
                              {b}
                            </span>
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
                            <span className="ml-1 hidden shrink truncate max-w-[30%] text-warning/80 sm:inline">{r.note}</span>
                          )}
                        </div>
                        {/* row 3: pickup → dropoff */}
                        <RouteLine pickup={r.pickup} dropoff={r.dropoff} />
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
        <aside className="sticky top-[80px] hidden h-[calc(100vh-80px)] border-l bg-card/40 lg:block overflow-hidden">
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
  const days = daysBetween(row.start, row.end);
  const hasOA = row.badges?.includes("OA");
  const source =
    /vinrent website/i.test(row.note ?? "") ? "Website Booking"
    : /getrentacar/i.test(row.note ?? "") ? "Getrentacar"
    : /telegram/i.test(row.note ?? "") ? "Telegram"
    : /paypal/i.test(row.note ?? "") ? "PayPal"
    : "Direct";

  // Merge row data into the rich edit model so the panel mirrors the edit page
  const trip = {
    ...mockTrip,
    id: row.id,
    voucher: `VR-${String(row.id).padStart(5, "0")}`,
    source,
    customer: { ...mockTrip.customer, name: row.client },
    dates: { start: row.start, end: row.end, days },
    pickup: row.pickup,
    dropoff: row.dropoff,
    car: { name: row.car || mockTrip.car.name, plate: row.plate || mockTrip.car.plate },
    notes: row.note ?? "",
  };


  return (
    <div className="flex h-full flex-col bg-card/40">
      {/* Sticky header */}
      <div className="flex items-center gap-2 border-b bg-card px-3 py-2">
        <span className={cn("h-2 w-2 rounded-full", meta.dot)} />
        <span className="text-sm font-bold tabular-nums">#{row.id}</span>
        <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider", meta.rowBg, meta.text)}>
          {meta.label}
        </span>
        {row.daysLeft != null && (
          <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-muted-foreground">
            {row.daysLeft}d left
          </span>
        )}
        <span className="hidden truncate rounded bg-muted px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground xl:inline">
          {trip.voucher}
        </span>
        <Link to="/" className="ml-auto inline-flex items-center gap-1 rounded-md bg-primary px-2 py-1 text-[11px] font-semibold text-primary-foreground hover:opacity-90">
          Open →
        </Link>
        {onClose && (
          <button onClick={onClose} className="ml-1 rounded p-1 hover:bg-muted"><X className="h-3.5 w-3.5" /></button>
        )}
      </div>

      {/* Signals strip — verbose, just under the header */}
      {(trip.issues.total > 0 || hasConflict || hasOA) && (
        <div className="flex flex-wrap items-center gap-1.5 border-b bg-muted/30 px-3 py-1.5">
          {trip.issues.total > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-md border border-destructive/30 bg-destructive-soft px-2 py-1 text-[11px] font-semibold text-destructive">
              <AlertTriangle className="h-3 w-3" />
              <span>
                {trip.issues.total} issue{trip.issues.total > 1 ? "s" : ""}
                {trip.issues.critical > 0 && <span className="font-normal opacity-80"> · {trip.issues.critical} critical</span>}
              </span>
              {trip.issues.tags.length > 0 && (
                <span className="rounded bg-destructive px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-destructive-foreground">
                  {trip.issues.tags.join(" · ")}
                </span>
              )}
            </span>
          )}
          {hasConflict && (
            <span className="inline-flex items-center gap-1.5 rounded-md border border-destructive/30 bg-destructive-soft px-2 py-1 text-[11px] font-semibold text-destructive">
              <AlertTriangle className="h-3 w-3" />
              Schedule conflict
              <span className="font-normal opacity-80">· car {row.plate} double-booked</span>
            </span>
          )}
          {hasOA && (
            <span className="inline-flex items-center gap-1.5 rounded-md border border-amber-300 bg-amber-50 px-2 py-1 text-[11px] font-semibold text-amber-700">
              <span className="rounded bg-amber-200 px-1 text-[9px] font-bold">OA</span>
              Owner action required
              <span className="font-normal opacity-80">· deposit/return pending with owner</span>
            </span>
          )}
        </div>
      )}

      <div className="flex-1 space-y-2.5 overflow-y-auto p-3 text-xs">
        {/* Customer */}
        <div className="rounded-lg border bg-background p-2.5">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Client</div>
              <div className="flex items-center gap-1.5 text-sm font-bold">
                {row.flag && <Flag className="h-3 w-3 fill-destructive text-destructive" />}
                {trip.customer.name}
              </div>
              <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-muted-foreground">
                <span className="inline-flex items-center gap-1"><Phone className="h-2.5 w-2.5" /> {trip.customer.phone}</span>
                <span className="inline-flex items-center gap-1"><Mail className="h-2.5 w-2.5" /> {trip.customer.email}</span>
                <span className="inline-flex items-center gap-1"><Languages className="h-2.5 w-2.5" /> {trip.customer.lang}</span>
                <span className="inline-flex items-center gap-1"><Globe2 className="h-2.5 w-2.5" /> {source}</span>
              </div>
            </div>
            <div className="flex shrink-0 gap-1">
              <button className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground hover:opacity-90" title="Call">
                <Phone className="h-3 w-3" />
              </button>
              <button className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-success text-success-foreground hover:opacity-90" title="WhatsApp">
                <MessageCircle className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Dates / route */}
        <div className="rounded-lg border bg-background">
          <div className="grid grid-cols-2 divide-x">
            <div className="p-2.5">
              <div className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Pick up</div>
              <div className="font-bold tabular-nums">{fmtDM(row.start)} · {fmtTime(row.start)}</div>
              <div className="mt-0.5 flex items-start gap-1 text-[10px] text-muted-foreground">
                <MapPin className="mt-0.5 h-2.5 w-2.5 shrink-0" />
                <span className="truncate">{row.pickup}</span>
              </div>
            </div>
            <div className="p-2.5">
              <div className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Return</div>
              <div className="font-bold tabular-nums">{fmtDM(row.end)} · {fmtTime(row.end)}</div>
              <div className="mt-0.5 flex items-start gap-1 text-[10px] text-muted-foreground">
                <MapPin className="mt-0.5 h-2.5 w-2.5 shrink-0" />
                <span className="truncate">{row.dropoff}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between border-t bg-muted/30 px-2.5 py-1 text-[10px] font-semibold text-muted-foreground">
            <span className="inline-flex items-center gap-1"><Clock className="h-2.5 w-2.5" /> Duration</span>
            <span className="tabular-nums text-foreground">{days} day{days > 1 ? "s" : ""}</span>
          </div>
        </div>

        {/* Car */}
        <div className="rounded-lg border bg-background p-2.5">
          <div className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Car</div>
          <div className="mt-0.5 flex items-center gap-2">
            <CarIcon className={cn("h-3.5 w-3.5", row.carIcon === "ok" ? "text-success" : "text-muted-foreground")} />
            <span className="font-bold">{trip.car.name}</span>
            <span className="ml-auto rounded border bg-muted/40 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums">{trip.car.plate || "no plate"}</span>
          </div>
        </div>

        {/* Live Price card from edit page (read-only) */}
        <PriceCard trip={trip} sticky={false} showSave={false} />

        {/* Note */}
        {row.note && (
          <div className="rounded-lg border border-warning/30 bg-warning-soft/60 p-2.5">
            <div className="text-[9px] font-bold uppercase tracking-wider text-warning">Note</div>
            <div className="mt-0.5 text-[11px] text-foreground">{row.note}</div>
          </div>
        )}

      </div>
    </div>
  );
}