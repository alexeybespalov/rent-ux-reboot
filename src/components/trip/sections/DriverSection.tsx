export function DriverSection() {
  return (
    <div className="rounded-xl border border-dashed bg-card p-4 text-center">
      <div className="text-xs font-semibold">No driver assigned</div>
      <div className="mt-0.5 text-[11px] text-muted-foreground">Assign for handoff & tracking.</div>
      <button className="mt-2 rounded-md bg-primary px-3 py-1.5 text-[11px] font-semibold text-primary-foreground hover:bg-primary/90">Assign driver</button>
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
    <div className="divide-y overflow-hidden rounded-xl border bg-card">
      {events.map((e, i) => (
        <div key={i} className="flex items-center gap-2 px-2.5 py-1.5">
          <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
          <div className="min-w-0 flex-1 truncate text-xs">{e.text}</div>
          <div className="text-[10px] text-muted-foreground">{e.time} · {e.who}</div>
        </div>
      ))}
    </div>
  );
}

export function SiteBookingSection() {
  return (
    <div className="rounded-xl border bg-card p-2.5">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Site Status</div>
          <div className="text-xs font-semibold">Pending sync</div>
        </div>
        <button className="rounded-md border px-2 py-1 text-[11px] font-medium hover:bg-muted">Refresh</button>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-1.5 text-[11px]">
        <div className="rounded-md bg-muted px-2 py-1"><div className="text-muted-foreground">Voucher</div><div className="font-medium">VR-NZ4873</div></div>
        <div className="rounded-md bg-muted px-2 py-1"><div className="text-muted-foreground">Channel</div><div className="font-medium">Website</div></div>
      </div>
    </div>
  );
}