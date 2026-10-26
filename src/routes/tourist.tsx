import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Calendar, FileText, MapPin, Users } from "lucide-react";
import { toast } from "sonner";
import { AppShell, Badge, DataTable, useData } from "@/components/AppShell";
import { api, fmtDate, money, type TourPackage, type User } from "@/lib/api";

export const Route = createFileRoute("/tourist")({
  head: () => ({ meta: [
    { title: "Explore Tours — Voyager" }, { name: "description", content: "Browse and book curated tour packages." },
    { property: "og:title", content: "Explore Tours — Voyager" }, { property: "og:description", content: "Browse and book curated tour packages." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  component: () => <AppShell role="tourist" title="Explore tours" subtitle="Hand-picked journeys around the world">{(u) => <Tourist user={u} />}</AppShell>,
});

function Tourist({ user }: { user: User }) {
  const { refresh } = useData();
  const dests = api.destinations();
  const pkgs = api.packages();
  const mine = api.bookings().filter((b) => b.userId === user.id);
  return (
    <>
      <div className="grid gap-6 md:grid-cols-2 2xl:grid-cols-4">
        {pkgs.map((p) => <PackageCard key={p.id} p={p} dest={dests.find((d) => d.id === p.destinationId)!} user={user} onBooked={refresh} />)}
      </div>
      <DataTable title="My bookings" cols={["Booking", "Package", "Seats", "Total", "Status", ""]} empty="Book your first tour above and it will appear here."
        rows={mine.map((b) => {
          const p = pkgs.find((x) => x.id === b.packageId);
          return [<span className="font-mono text-xs text-muted-foreground">#{b.id.toUpperCase()}</span>, <span className="font-medium">{p?.title}</span>, b.seats, money(b.total), <Badge>Confirmed</Badge>,
            <Link to="/invoice/$id" params={{ id: b.id }} target="_blank" className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-muted"><FileText className="h-3.5 w-3.5" />Invoice</Link>];
        })} />
    </>
  );
}

function PackageCard({ p, dest, user, onBooked }: { p: TourPackage; dest: { name: string; country: string; image: string }; user: User; onBooked: () => void }) {
  const [seats, setSeats] = useState(1);
  const [err, setErr] = useState("");
  const pct = ((p.capacity - p.availableSeats) / p.capacity) * 100;
  const book = () => {
    try { api.book(user.id, p.id, seats); setErr(""); setSeats(1); toast.success(`Booked ${seats} seat(s) on ${p.title}`); onBooked(); }
    catch (e) { setErr((e as Error).message); }
  };
  return (
    <div className="group overflow-hidden rounded-2xl border bg-card shadow-soft transition hover:shadow-lift">
      <div className="relative h-44 overflow-hidden">
        <img src={dest.image} alt={dest.name} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
        <span className="absolute left-3 top-3 rounded-full bg-card/90 px-3 py-1 text-xs font-semibold backdrop-blur">{money(p.price)}<span className="font-normal text-muted-foreground"> / seat</span></span>
      </div>
      <div className="space-y-4 p-5">
        <div>
          <p className="flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3 w-3" />{dest.name}, {dest.country}</p>
          <h3 className="mt-1 font-display text-lg font-semibold">{p.title}</h3>
        </div>
        <div className="flex gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{p.days} days · {fmtDate(p.startDate)}</span>
        </div>
        <div>
          <div className="mb-1.5 flex justify-between text-xs"><span className="flex items-center gap-1 text-muted-foreground"><Users className="h-3.5 w-3.5" />Seats</span><span className="font-medium text-success">{p.availableSeats} / {p.capacity} left</span></div>
          <div className="h-1.5 rounded-full bg-muted"><div className="h-full rounded-full bg-gradient-brand" style={{ width: `${pct}%` }} /></div>
        </div>
        <div className="flex gap-2">
          <input type="number" min={1} max={p.availableSeats} value={seats} onChange={(e) => { setSeats(Number(e.target.value)); setErr(""); }} aria-label="Seats" className="w-20 rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" />
          <button onClick={book} disabled={p.availableSeats === 0} className="flex-1 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-glow transition hover:opacity-90 disabled:opacity-40">
            {p.availableSeats === 0 ? "Sold out" : `Book · ${money(p.price * (seats || 0))}`}
          </button>
        </div>
        {err && <p className="text-xs text-destructive">{err}</p>}
      </div>
    </div>
  );
}
