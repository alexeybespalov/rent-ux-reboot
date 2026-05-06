import { Calendar, MapPin, Car, Phone, Mail, Globe, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import type { TripData } from "../types";
import { useState } from "react";
import { cn } from "@/lib/utils";

function Field({ icon: Icon, label, children, wide }: { icon: any; label: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className={cn(
      "group flex items-center gap-2 rounded-lg border bg-card px-2.5 py-1.5 transition-colors hover:border-primary/30",
      wide && "col-span-2 lg:col-span-3",
    )}>
      <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
      <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
      <span className="ml-auto min-w-0 truncate text-right text-xs font-medium">{children}</span>
    </div>
  );
}

function Section({ title, defaultOpen = true, children, badge }: { title: string; defaultOpen?: boolean; children: React.ReactNode; badge?: string }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Collapsible open={open} onOpenChange={setOpen} className="rounded-xl border bg-card/50">
      <CollapsibleTrigger className="flex w-full items-center justify-between gap-2 px-3 py-1.5 text-left">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{title}</span>
          {badge && <span className="rounded-full bg-muted px-1.5 py-0 text-[10px] font-medium text-muted-foreground">{badge}</span>}
        </div>
        <ChevronDown className={cn("h-3.5 w-3.5 text-muted-foreground transition-transform", open && "rotate-180")} />
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-1 px-2 pb-2">{children}</CollapsibleContent>
    </Collapsible>
  );
}

export function DetailsSection({ trip }: { trip: TripData }) {
  return (
    <div className="space-y-2">
      <Section title="Customer">
        <div className="grid grid-cols-2 gap-1 lg:grid-cols-3">
          <Field icon={Phone} label="Name">{trip.customer.name}</Field>
          <Field icon={Phone} label="Phone">{trip.customer.phone}</Field>
          <Field icon={Globe} label="Language">{trip.customer.lang}</Field>
          <Field icon={Mail} label="Email" wide>{trip.customer.email}</Field>
        </div>
      </Section>

      <Section title="Dates & Locations" badge={`${trip.dates.days} days`}>
        <div className="grid grid-cols-2 gap-1 lg:grid-cols-4">
          <Field icon={Calendar} label="Start">
            <Input type="datetime-local" defaultValue={trip.dates.start} className="h-5 border-0 p-0 text-xs font-medium focus-visible:ring-0" />
          </Field>
          <Field icon={Calendar} label="End">
            <Input type="datetime-local" defaultValue={trip.dates.end} className="h-5 border-0 p-0 text-xs font-medium focus-visible:ring-0" />
          </Field>
          <Field icon={MapPin} label="Pickup">{trip.pickup}</Field>
          <Field icon={MapPin} label="Drop-off">{trip.dropoff}</Field>
        </div>
      </Section>

      <Section title="Vehicle">
        <div className="grid grid-cols-2 gap-1">
          <Field icon={Car} label="Car">{trip.car.name}</Field>
          <Field icon={Car} label="Plate">{trip.car.plate}</Field>
        </div>
      </Section>

      <Section title="Protection & Bundle" badge="none" defaultOpen={false}>
        <div className="px-1 py-1 text-xs text-muted-foreground">No protection. <button className="font-medium text-primary hover:underline">Add bundle</button></div>
      </Section>

      <Section title="Extras" badge={trip.extras.length ? `${trip.extras.length}` : "none"} defaultOpen={false}>
        <div className="flex items-center gap-1.5 px-1 py-1">
          <Input placeholder="+ Add extra…" className="h-7 text-xs" />
          <button className="h-7 rounded-md bg-primary px-2.5 text-xs font-medium text-primary-foreground hover:bg-primary/90">Add</button>
        </div>
      </Section>

      <Section title="Notes" defaultOpen={false}>
        <textarea className="min-h-16 w-full rounded-md border bg-background p-2 text-xs focus:outline-none focus:ring-2 focus:ring-ring" placeholder="Internal notes…" />
      </Section>

      <Section title="Trip Terms" badge="snapshot" defaultOpen={false}>
        <div className="grid grid-cols-2 gap-1 px-1 py-1 text-[11px]">
          <div><span className="text-muted-foreground">Mileage:</span> <span className="font-medium">{trip.terms.mileage}</span></div>
          <div><span className="text-muted-foreground">Free cancel:</span> <span className="font-medium">{trip.terms.freeCancel}</span></div>
          <div><span className="text-muted-foreground">Driving rules:</span> <span className="font-medium text-success">✓ {trip.terms.drivingRules}</span></div>
          <div><span className="text-muted-foreground">Currency:</span> <span className="font-medium">{trip.terms.currency}</span></div>
        </div>
      </Section>
    </div>
  );
}