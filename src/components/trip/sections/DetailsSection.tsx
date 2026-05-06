import { Calendar, MapPin, Car, Phone, Mail, Globe, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import type { TripData } from "../types";
import { useState } from "react";
import { cn } from "@/lib/utils";

function Field({ icon: Icon, label, children }: { icon: any; label: string; children: React.ReactNode }) {
  return (
    <div className="group flex items-start gap-3 rounded-xl border bg-card p-3 transition-colors hover:border-primary/30">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className="mt-0.5 truncate text-sm font-medium">{children}</div>
      </div>
    </div>
  );
}

function Section({ title, defaultOpen = true, children, badge }: { title: string; defaultOpen?: boolean; children: React.ReactNode; badge?: string }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Collapsible open={open} onOpenChange={setOpen} className="rounded-2xl border bg-card/50">
      <CollapsibleTrigger className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{title}</span>
          {badge && <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">{badge}</span>}
        </div>
        <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", open && "rotate-180")} />
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-2 px-3 pb-3">{children}</CollapsibleContent>
    </Collapsible>
  );
}

export function DetailsSection({ trip }: { trip: TripData }) {
  return (
    <div className="space-y-3">
      <Section title="Customer">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <Field icon={Phone} label="Name">{trip.customer.name}</Field>
          <Field icon={Phone} label="Phone">{trip.customer.phone}</Field>
          <Field icon={Mail} label="Email">{trip.customer.email}</Field>
          <Field icon={Globe} label="Language">{trip.customer.lang}</Field>
        </div>
      </Section>

      <Section title="Dates & Locations" badge={`${trip.dates.days} days`}>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <Field icon={Calendar} label="Start">
            <Input type="datetime-local" defaultValue={trip.dates.start} className="h-7 border-0 p-0 text-sm font-medium focus-visible:ring-0" />
          </Field>
          <Field icon={Calendar} label="End">
            <Input type="datetime-local" defaultValue={trip.dates.end} className="h-7 border-0 p-0 text-sm font-medium focus-visible:ring-0" />
          </Field>
          <Field icon={MapPin} label="Pickup">{trip.pickup}</Field>
          <Field icon={MapPin} label="Drop-off">{trip.dropoff}</Field>
        </div>
      </Section>

      <Section title="Vehicle">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <Field icon={Car} label="Car">{trip.car.name}</Field>
          <Field icon={Car} label="Plate">{trip.car.plate}</Field>
        </div>
      </Section>

      <Section title="Protection & Bundle" badge="none" defaultOpen={false}>
        <div className="px-1 py-2 text-sm text-muted-foreground">No protection selected. <button className="font-medium text-primary hover:underline">Add bundle</button></div>
      </Section>

      <Section title="Extras" badge={trip.extras.length ? `${trip.extras.length}` : "none"} defaultOpen={false}>
        <div className="flex items-center gap-2 px-1 py-2">
          <Input placeholder="+ Add extra…" className="h-9" />
          <button className="h-9 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90">Add</button>
        </div>
      </Section>

      <Section title="Notes" defaultOpen={false}>
        <textarea className="min-h-20 w-full rounded-lg border bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" placeholder="Internal notes…" />
      </Section>

      <Section title="Trip Terms" badge="snapshot" defaultOpen={false}>
        <div className="grid grid-cols-2 gap-2 px-1 py-2 text-xs">
          <div><span className="text-muted-foreground">Mileage:</span> <span className="font-medium">{trip.terms.mileage}</span></div>
          <div><span className="text-muted-foreground">Free cancel:</span> <span className="font-medium">{trip.terms.freeCancel}</span></div>
          <div><span className="text-muted-foreground">Driving rules:</span> <span className="font-medium text-success">✓ {trip.terms.drivingRules}</span></div>
          <div><span className="text-muted-foreground">Currency:</span> <span className="font-medium">{trip.terms.currency}</span></div>
        </div>
      </Section>
    </div>
  );
}