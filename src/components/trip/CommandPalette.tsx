import { useEffect } from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import {
  Save,
  FileText,
  Calendar,
  Trash2,
  Phone,
  MessageCircle,
  MapPin,
  Copy,
  CreditCard,
  User,
  Car,
  History,
  Globe2,
  ListChecks,
  CircleDot,
} from "lucide-react";
import type { TripData, TripStatus } from "./types";

export function CommandPalette({
  open,
  onOpenChange,
  trip,
  onTab,
  onStatus,
  onSave,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  trip: TripData;
  onTab: (t: any) => void;
  onStatus: (s: TripStatus) => void;
  onSave: () => void;
}) {
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, onOpenChange]);

  const run = (fn: () => void) => () => {
    fn();
    onOpenChange(false);
  };

  const phoneDigits = trip.customer.phone.replace(/\D/g, "");

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder={`Search trip #${trip.id} actions, tabs, status…`} />
      <CommandList>
        <CommandEmpty>No results.</CommandEmpty>
        <CommandGroup heading="Actions">
          <CommandItem onSelect={run(onSave)}>
            <Save className="mr-2 h-4 w-4" /> Save changes
            <CommandShortcut>⌘S</CommandShortcut>
          </CommandItem>
          <CommandItem><FileText className="mr-2 h-4 w-4" /> Open voucher</CommandItem>
          <CommandItem><Calendar className="mr-2 h-4 w-4" /> Open calendar</CommandItem>
          <CommandItem className="text-destructive"><Trash2 className="mr-2 h-4 w-4" /> Delete trip</CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Customer">
          <CommandItem onSelect={run(() => window.open(`tel:${phoneDigits}`))}>
            <Phone className="mr-2 h-4 w-4" /> Call {trip.customer.name}
          </CommandItem>
          <CommandItem onSelect={run(() => window.open(`https://wa.me/${phoneDigits}`, "_blank"))}>
            <MessageCircle className="mr-2 h-4 w-4" /> WhatsApp
          </CommandItem>
          <CommandItem onSelect={run(() => navigator.clipboard.writeText(trip.customer.phone))}>
            <Copy className="mr-2 h-4 w-4" /> Copy phone
          </CommandItem>
          <CommandItem
            onSelect={run(() => window.open(`https://maps.google.com/?q=${encodeURIComponent(trip.pickup)}`, "_blank"))}
          >
            <MapPin className="mr-2 h-4 w-4" /> Pickup in Google Maps
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Go to tab">
          <CommandItem onSelect={run(() => onTab("details"))}><ListChecks className="mr-2 h-4 w-4" /> Details<CommandShortcut>1</CommandShortcut></CommandItem>
          <CommandItem onSelect={run(() => onTab("payments"))}><CreditCard className="mr-2 h-4 w-4" /> Payments<CommandShortcut>2</CommandShortcut></CommandItem>
          <CommandItem onSelect={run(() => onTab("owner"))}><User className="mr-2 h-4 w-4" /> Owner<CommandShortcut>3</CommandShortcut></CommandItem>
          <CommandItem onSelect={run(() => onTab("driver"))}><Car className="mr-2 h-4 w-4" /> Driver<CommandShortcut>4</CommandShortcut></CommandItem>
          <CommandItem onSelect={run(() => onTab("log"))}><History className="mr-2 h-4 w-4" /> Log<CommandShortcut>5</CommandShortcut></CommandItem>
          <CommandItem onSelect={run(() => onTab("site"))}><Globe2 className="mr-2 h-4 w-4" /> Site<CommandShortcut>6</CommandShortcut></CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Set status">
          {(["new", "confirmed", "in_rent", "finished", "done", "reject"] as TripStatus[]).map((s) => (
            <CommandItem key={s} onSelect={run(() => onStatus(s))}>
              <CircleDot className="mr-2 h-4 w-4" /> {s.replace("_", " ")}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}