import { useEffect, useState } from "react";
import { Command as CommandPrimitive } from "cmdk";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
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
  Send,
  Mail,
} from "lucide-react";
import type { TripData, TripStatus } from "./types";

type Tile = {
  key: string;
  label: string;
  icon: any;
  onSelect: () => void;
  tone?: "default" | "primary" | "success" | "warn" | "danger";
  shortcut?: string;
};

function TileBtn({ tile }: { tile: Tile }) {
  const Icon = tile.icon;
  return (
    <CommandPrimitive.Item
      value={`${tile.key} ${tile.label}`}
      onSelect={tile.onSelect}
      className={cn(
        "group relative flex aspect-square cursor-pointer flex-col items-center justify-center gap-1.5 rounded-2xl border bg-card p-2 text-center transition-all",
        "hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]",
        "data-[selected=true]:border-primary data-[selected=true]:bg-primary-soft data-[selected=true]:shadow-[var(--shadow-md)]",
      )}
    >
      <div
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-xl transition-colors",
          tile.tone === "primary" && "bg-primary text-primary-foreground",
          tile.tone === "success" && "bg-success text-success-foreground",
          tile.tone === "warn" && "bg-warning text-warning-foreground",
          tile.tone === "danger" && "bg-destructive text-destructive-foreground",
          (!tile.tone || tile.tone === "default") && "bg-muted text-foreground",
        )}
      >
        <Icon className="h-4 w-4" />
      </div>
      <span className="line-clamp-2 text-[10px] font-semibold leading-tight">{tile.label}</span>
      {tile.shortcut && (
        <span className="absolute right-1.5 top-1.5 rounded bg-muted/80 px-1 text-[9px] font-mono text-muted-foreground">
          {tile.shortcut}
        </span>
      )}
    </CommandPrimitive.Item>
  );
}

function Group({ heading, tiles }: { heading: string; tiles: Tile[] }) {
  return (
    <CommandPrimitive.Group
      heading={heading}
      className="px-1 [&_[cmdk-group-heading]]:mb-1.5 [&_[cmdk-group-heading]]:px-1 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-bold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-muted-foreground"
    >
      <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-5">
        {tiles.map((t) => <TileBtn key={t.key} tile={t} />)}
      </div>
    </CommandPrimitive.Group>
  );
}

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
  const [query, setQuery] = useState("");
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

  useEffect(() => { if (!open) setQuery(""); }, [open]);

  const run = (fn: () => void) => () => {
    fn();
    onOpenChange(false);
  };

  const phoneDigits = trip.customer.phone.replace(/\D/g, "");
  const mapsUrl = (q: string) => `https://maps.google.com/?q=${encodeURIComponent(q)}`;

  const actions: Tile[] = [
    { key: "save", label: "Save", icon: Save, tone: "primary", shortcut: "⌘S", onSelect: run(onSave) },
    { key: "voucher", label: "Voucher", icon: FileText, onSelect: run(() => {}) },
    { key: "calendar", label: "Calendar", icon: Calendar, onSelect: run(() => {}) },
    { key: "delete", label: "Delete", icon: Trash2, tone: "danger", onSelect: run(() => {}) },
  ];

  const customer: Tile[] = [
    { key: "call", label: "Call", icon: Phone, tone: "primary", onSelect: run(() => window.open(`tel:${phoneDigits}`)) },
    { key: "whatsapp", label: "WhatsApp", icon: MessageCircle, tone: "success", onSelect: run(() => window.open(`https://wa.me/${phoneDigits}`, "_blank")) },
    { key: "telegram", label: "Telegram", icon: Send, onSelect: run(() => window.open(`https://t.me/+${phoneDigits}`, "_blank")) },
    { key: "email", label: "Email", icon: Mail, onSelect: run(() => window.open(`mailto:${trip.customer.email}`)) },
    { key: "copy-phone", label: "Copy phone", icon: Copy, onSelect: run(() => navigator.clipboard.writeText(trip.customer.phone)) },
    { key: "pickup-map", label: "Pickup map", icon: MapPin, onSelect: run(() => window.open(mapsUrl(trip.pickup), "_blank")) },
  ];

  const tabs: Tile[] = [
    { key: "tab-details", label: "Details", icon: ListChecks, shortcut: "1", onSelect: run(() => onTab("details")) },
    { key: "tab-payments", label: "Payments", icon: CreditCard, shortcut: "2", onSelect: run(() => onTab("payments")) },
    { key: "tab-owner", label: "Owner", icon: User, shortcut: "3", onSelect: run(() => onTab("owner")) },
    { key: "tab-driver", label: "Driver", icon: Car, shortcut: "4", onSelect: run(() => onTab("driver")) },
    { key: "tab-log", label: "Log", icon: History, shortcut: "5", onSelect: run(() => onTab("log")) },
    { key: "tab-site", label: "Site", icon: Globe2, shortcut: "6", onSelect: run(() => onTab("site")) },
  ];

  const STATUS_TONE: Record<TripStatus, Tile["tone"]> = {
    new: "primary", confirmed: "primary", in_rent: "warn", finished: "default", done: "success", reject: "danger",
  };
  const statuses: Tile[] = (["new", "confirmed", "in_rent", "finished", "done", "reject"] as TripStatus[]).map((s) => ({
    key: `st-${s}`,
    label: s.replace("_", " "),
    icon: CircleDot,
    tone: STATUS_TONE[s],
    onSelect: run(() => onStatus(s)),
  }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <CommandPrimitive className="flex max-h-[80vh] flex-col bg-popover">
          <div className="flex items-center gap-2 border-b px-3 py-2">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <CommandPrimitive.Input
              value={query}
              onValueChange={setQuery}
              placeholder={`#${trip.id} · search actions, tabs, status…`}
              className="h-8 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            <kbd className="hidden rounded border bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground sm:inline">esc</kbd>
            <button onClick={() => onOpenChange(false)} className="rounded p-1 hover:bg-muted sm:hidden">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <CommandPrimitive.List className="space-y-3 overflow-y-auto p-3">
            <CommandPrimitive.Empty className="py-8 text-center text-xs text-muted-foreground">No results.</CommandPrimitive.Empty>
            <Group heading="Actions" tiles={actions} />
            <Group heading="Customer" tiles={customer} />
            <Group heading="Go to tab" tiles={tabs} />
            <Group heading="Set status" tiles={statuses} />
          </CommandPrimitive.List>
        </CommandPrimitive>
      </DialogContent>
    </Dialog>
  );
}