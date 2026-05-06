import { useState } from "react";
import {
  ArrowLeft,
  Home,
  Trash2,
  AlertTriangle,
  FileText,
  Calendar,
  Save,
  Menu,
  RotateCw,
  CreditCard,
  User,
  Car,
  History,
  Globe2,
  ListChecks,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { mockTrip } from "./mockData";
import { StatusPill } from "./StatusPill";
import { PriceCard } from "./PriceCard";
import { DetailsSection } from "./sections/DetailsSection";
import { PaymentsSection } from "./sections/PaymentsSection";
import { OwnerSection } from "./sections/OwnerSection";
import { DriverSection, LogSection, SiteBookingSection } from "./sections/DriverSection";
import type { TripStatus } from "./types";

type Tab = "details" | "payments" | "owner" | "driver" | "log" | "site";

const TABS: { key: Tab; label: string; icon: any; dot?: "danger" | "warn" }[] = [
  { key: "details", label: "Details", icon: ListChecks },
  { key: "payments", label: "Payments", icon: CreditCard, dot: "danger" },
  { key: "owner", label: "Owner", icon: User },
  { key: "driver", label: "Driver", icon: Car, dot: "warn" },
  { key: "log", label: "Log", icon: History },
  { key: "site", label: "Site", icon: Globe2 },
];

export function TripCard() {
  const trip = mockTrip;
  const [tab, setTab] = useState<Tab>("details");
  const [status, setStatus] = useState<TripStatus>(trip.status);
  const [priceOpen, setPriceOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b bg-card/80 backdrop-blur-md">
        <div className="mx-auto flex h-11 max-w-7xl items-center gap-1 px-2 sm:px-4">
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0"><ArrowLeft className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0"><Home className="h-4 w-4" /></Button>
          <div className="ml-1 flex min-w-0 flex-1 items-center gap-2">
            <h1 className="truncate text-sm font-bold sm:text-base">Trip #{trip.id}</h1>
            <StatusPill value={status} onChange={setStatus} />
            <span className="hidden rounded bg-muted px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground md:inline">
              {trip.source}
            </span>
            <span className="hidden text-[11px] text-muted-foreground md:inline">{trip.voucher}</span>
          </div>
          <div className="hidden items-center gap-1 sm:flex">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"><AlertTriangle className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-primary"><FileText className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-primary"><Calendar className="h-4 w-4" /></Button>
            <Button size="sm" className="h-8 gap-1.5 text-xs"><Save className="h-3.5 w-3.5" />Save</Button>
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 sm:hidden"><Menu className="h-4 w-4" /></Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <div className="mt-6 space-y-2">
                <Button className="w-full justify-start gap-2"><Save className="h-4 w-4" /> Save changes</Button>
                <Button variant="outline" className="w-full justify-start gap-2"><FileText className="h-4 w-4" /> Open voucher</Button>
                <Button variant="outline" className="w-full justify-start gap-2"><Calendar className="h-4 w-4" /> Open calendar</Button>
                <Button variant="outline" className="w-full justify-start gap-2"><RotateCw className="h-4 w-4" /> Refresh</Button>
                <Button variant="outline" className="w-full justify-start gap-2 text-destructive"><Trash2 className="h-4 w-4" /> Delete trip</Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {trip.issues.total > 0 && (
          <div className="border-t bg-destructive-soft">
            <div className="mx-auto flex max-w-7xl items-center gap-1.5 px-2 py-1 text-[11px] sm:px-4">
              <AlertTriangle className="h-3 w-3 text-destructive" />
              <span className="font-semibold text-destructive">
                {trip.issues.total} issue{trip.issues.total > 1 ? "s" : ""} found
              </span>
              <span className="text-destructive/80">({trip.issues.critical} critical)</span>
              {trip.issues.tags.map((t) => (
                <span key={t} className="ml-auto rounded bg-destructive px-1.5 py-0 text-[9px] font-bold uppercase tracking-wide text-destructive-foreground">
                  {t}
                </span>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Body */}
      <div className="mx-auto max-w-7xl px-2 py-3 sm:px-4 sm:py-4">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_300px]">
          {/* Main column */}
          <div className="min-w-0 space-y-2.5 pb-24 lg:pb-3">
            {/* Tabs */}
            <div className="-mx-2 overflow-x-auto px-2 sm:mx-0 sm:px-0">
              <div className="flex min-w-fit gap-0.5 rounded-lg border bg-card p-0.5 shadow-[var(--shadow-sm)]">
                {TABS.map((t) => {
                  const Icon = t.icon;
                  const active = tab === t.key;
                  return (
                    <button
                      key={t.key}
                      onClick={() => setTab(t.key)}
                      className={cn(
                        "relative flex flex-1 items-center justify-center gap-1 whitespace-nowrap rounded-md px-2.5 py-1.5 text-[11px] font-medium transition-all",
                        active ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-muted hover:text-foreground",
                      )}
                    >
                      <Icon className="h-3 w-3" />
                      <span>{t.label}</span>
                      {t.dot && (
                        <span className={cn(
                          "absolute right-1 top-1 h-1 w-1 rounded-full",
                          t.dot === "danger" ? "bg-destructive" : "bg-warning",
                          active && "bg-primary-foreground",
                        )} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              {tab === "details" && <DetailsSection trip={trip} />}
              {tab === "payments" && <PaymentsSection trip={trip} />}
              {tab === "owner" && <OwnerSection trip={trip} />}
              {tab === "driver" && <DriverSection />}
              {tab === "log" && <LogSection />}
              {tab === "site" && <SiteBookingSection />}
            </div>
          </div>

          {/* Price column desktop */}
          <div className="hidden lg:block">
            <PriceCard trip={trip} />
          </div>
        </div>
      </div>

      {/* Mobile sticky price bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-card/95 backdrop-blur-md lg:hidden">
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-2.5 py-1.5">
          <button onClick={() => setPriceOpen(true)} className="flex flex-1 items-baseline gap-2 text-left">
            <div>
              <div className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground leading-none">Total</div>
              <div className="text-sm font-bold tabular-nums leading-tight">
                {new Intl.NumberFormat("en-US").format(
                  Math.round((trip.price.base + trip.price.afterHours + trip.price.lateBooking) * (1 + trip.price.taxRate)),
                )}
              </div>
            </div>
            <span className="text-[10px] font-medium text-primary underline">breakdown</span>
          </button>
          <Button size="sm" className="h-8 gap-1 px-4 text-xs"><Save className="h-3 w-3" />Save</Button>
        </div>
      </div>

      <Sheet open={priceOpen} onOpenChange={setPriceOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl p-4">
          <PriceCard trip={trip} sticky={false} />
        </SheetContent>
      </Sheet>
    </div>
  );
}