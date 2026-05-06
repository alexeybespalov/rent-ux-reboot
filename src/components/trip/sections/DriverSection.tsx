export function DriverSection() {
  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-dashed bg-card p-6 text-center">
        <div className="text-sm font-semibold">No driver assigned</div>
        <div className="mt-1 text-xs text-muted-foreground">Assign a driver to enable trip handoff & tracking.</div>
        <button className="mt-3 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90">Assign driver</button>
      </div>
    </div>
  );
}

export function LogSection() {
  const events = [
    { time: "Today 10:24", text: "Trip created from website booking", who: "System" },
    { time: "Today 10:25", text: "Voucher VR-NZ4873 attached", who: "System" },
    { time: "Today 11:30", text: "Payment of 475 USD recorded as RENT", who: "Sergey" },
  ];
  return (
    <div className="space-y-1">
      {events.map((e, i) => (
        <div key={i} className="flex gap-3 rounded-lg border bg-card px-3 py-2.5">
          <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
          <div className="flex-1">
            <div className="text-sm">{e.text}</div>
            <div className="text-xs text-muted-foreground">{e.time} • {e.who}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function SiteBookingSection() {
  return (
    <div className="rounded-2xl border bg-card p-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Site Status</div>
          <div className="mt-1 text-sm font-semibold">Pending sync</div>
        </div>
        <button className="rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-muted">Refresh</button>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
        <div className="rounded-lg bg-muted p-2"><div className="text-muted-foreground">Voucher</div><div className="font-medium">VR-NZ4873</div></div>
        <div className="rounded-lg bg-muted p-2"><div className="text-muted-foreground">Channel</div><div className="font-medium">Website</div></div>
      </div>
    </div>
  );
}