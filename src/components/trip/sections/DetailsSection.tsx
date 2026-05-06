import { Calendar, MapPin, Car, Phone, Mail, Globe, ChevronDown, User, Hash, CalendarCheck, MapPinned, MessageCircle, Send, Navigation, Copy } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { TripData } from "../types";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { QuickActionsPopover } from "../QuickActionsPopover";
import { TripProgress } from "../TripProgress";
import { useCopy } from "../useCopy";

function Field({ icon: Icon, label, children, wide }: { icon: any; label: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className={cn(
      "group flex items-center gap-2 rounded-lg border bg-card px-2 py-1.5 transition-colors hover:border-primary/30",
      wide && "col-span-2 lg:col-span-3",
    )}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        </TooltipTrigger>
        <TooltipContent side="top" className="text-[10px]">{label}</TooltipContent>
      </Tooltip>
      <span className="min-w-0 flex-1 truncate text-xs font-medium">{children}</span>
    </div>
  );
}

function CopyableText({ value, label }: { value: string; label?: string }) {
  const { copy, copied } = useCopy();
  const isCopied = copied === value;
  return (
    <button
      onClick={() => copy(value, label)}
      className="group/copy inline-flex min-w-0 max-w-full items-center gap-1 truncate text-left text-xs font-medium hover:text-primary"
      title="Click to copy"
    >
      <span className="truncate">{value}</span>
      <Copy className={cn("h-2.5 w-2.5 shrink-0 opacity-0 transition-opacity group-hover/copy:opacity-50", isCopied && "opacity-100 text-success")} />
    </button>
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
  const phoneDigits = trip.customer.phone.replace(/\D/g, "");
  const mapsUrl = (q: string) => `https://maps.google.com/?q=${encodeURIComponent(q)}`;
  return (
    <div className="space-y-2">
      <TripProgress start={trip.dates.start} end={trip.dates.end} days={trip.dates.days} />

      <Section title="Customer">
        <div className="grid grid-cols-2 gap-1 lg:grid-cols-3">
          <Field icon={User} label="Name"><CopyableText value={trip.customer.name} label="Name copied" /></Field>
          <Field icon={Phone} label="Phone">
            <QuickActionsPopover
              value={trip.customer.phone}
              copyLabel="Phone copied"
              actions={[
                { label: "Call", icon: Phone, href: `tel:${phoneDigits}`, tone: "primary" },
                { label: "WhatsApp", icon: MessageCircle, href: `https://wa.me/${phoneDigits}`, tone: "success" },
                { label: "Telegram", icon: Send, href: `https://t.me/+${phoneDigits}` },
                { label: "SMS", icon: MessageCircle, href: `sms:${phoneDigits}` },
              ]}
            />
          </Field>
          <Field icon={Globe} label="Language">{trip.customer.lang}</Field>
          <Field icon={Mail} label="Email" wide>
            <QuickActionsPopover
              value={trip.customer.email}
              copyLabel="Email copied"
              actions={[
                { label: "Send email", icon: Mail, href: `mailto:${trip.customer.email}`, tone: "primary" },
              ]}
            />
          </Field>
        </div>
      </Section>

      <Section title="Dates & Locations" badge={`${trip.dates.days} days`}>
        <div className="grid grid-cols-2 gap-1 lg:grid-cols-4">
          <Field icon={Calendar} label="Start date">
            <Input type="datetime-local" defaultValue={trip.dates.start} className="h-5 border-0 p-0 text-xs font-medium focus-visible:ring-0" />
          </Field>
          <Field icon={CalendarCheck} label="End date">
            <Input type="datetime-local" defaultValue={trip.dates.end} className="h-5 border-0 p-0 text-xs font-medium focus-visible:ring-0" />
          </Field>
          <Field icon={MapPin} label="Pickup location">
            <QuickActionsPopover
              value={trip.pickup}
              copyLabel="Pickup copied"
              actions={[
                { label: "Google Maps", icon: Navigation, href: mapsUrl(trip.pickup), tone: "primary" },
                { label: "Grab", icon: Car, href: `https://www.grab.com/`, tone: "success" },
              ]}
            />
          </Field>
          <Field icon={MapPinned} label="Drop-off location">
            <QuickActionsPopover
              value={trip.dropoff}
              copyLabel="Drop-off copied"
              actions={[
                { label: "Google Maps", icon: Navigation, href: mapsUrl(trip.dropoff), tone: "primary" },
              ]}
            />
          </Field>
        </div>
      </Section>

      <Section title="Vehicle">
        <div className="grid grid-cols-2 gap-1">
          <Field icon={Car} label="Car model"><CopyableText value={trip.car.name} label="Model copied" /></Field>
          <Field icon={Hash} label="Plate number"><CopyableText value={trip.car.plate} label="Plate copied" /></Field>
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