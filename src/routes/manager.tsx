import { createFileRoute } from "@tanstack/react-router";
import { DollarSign, Ticket, Users } from "lucide-react";
import { AppShell, Card } from "@/components/AppShell";
import { api, fmtDate, money } from "@/lib/api";

export const Route = createFileRoute("/manager")({
  head: () => ({ meta: [
    { title: "Overview — Voyager Manager" }, { name: "description", content: "Revenue, bookings and active tours at a glance." },
    { property: "og:title", content: "Overview — Voyager Manager" }, { property: "og:description", content: "Revenue, bookings and active tours at a glance." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  component: () => <AppShell role="manager" title="Overview" subtitle="Business performance at a glance">{() => <Manager />}</AppShell>,
});

function Manager() {
  const b = api.bookings().filter((x) => x.status === "active");
  const pkgs = api.packages();
  const dests = api.destinations();
  const kpis = [
    { label: "Total revenue", value: money(b.reduce((s, x) => s + x.total, 0)), icon: DollarSign },
    { label: "Total bookings", value: b.length, icon: Ticket },
    { label: "Seats sold", value: b.reduce((s, x) => s + x.seats, 0), icon: Users },
  ];
  return (
    <>
      <div className="grid gap-5 sm:grid-cols-3">
        {kpis.map((k, i) => (
          <Card key={k.label} className={`p-6 ${i === 0 ? "bg-gradient-brand text-primary-foreground" : ""}`}>
            <div className="flex items-center justify-between"><p className={`text-sm ${i === 0 ? "opacity-80" : "text-muted-foreground"}`}>{k.label}</p>
              <div className={`grid h-9 w-9 place-items-center rounded-xl ${i === 0 ? "bg-primary-foreground/15" : "bg-accent text-accent-foreground"}`}><k.icon className="h-4 w-4" /></div></div>
            <p className="mt-4 font-display text-3xl font-semibold tracking-tight">{k.value}</p>
          </Card>
        ))}
      </div>
      <Card>
        <div className="border-b px-6 py-4"><h2 className="font-display font-semibold">Active tours</h2></div>
        {pkgs.length === 0 ? <p className="px-6 py-12 text-center text-sm text-muted-foreground">No active tours.</p> : (
          <ul className="divide-y">
            {pkgs.map((p) => {
              const d = dests.find((x) => x.id === p.destinationId);
              const sold = p.capacity - p.availableSeats;
              return (
                <li key={p.id} className="flex flex-wrap items-center gap-4 px-6 py-4">
                  <img src={d?.image} alt="" className="h-12 w-16 rounded-xl object-cover" />
                  <div className="min-w-40 flex-1"><p className="font-medium">{p.title}</p><p className="text-xs text-muted-foreground">{d?.name} · {p.days} days · starts {fmtDate(p.startDate)}</p></div>
                  <div className="w-40"><div className="mb-1 flex justify-between text-xs"><span className="text-muted-foreground">Occupancy</span><span className="font-medium">{sold}/{p.capacity}</span></div>
                    <div className="h-1.5 rounded-full bg-muted"><div className="h-full rounded-full bg-success" style={{ width: `${(sold / p.capacity) * 100}%` }} /></div></div>
                  <p className="w-24 text-right font-semibold">{money(sold * p.price)}</p>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </>
  );
}
