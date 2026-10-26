import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plane, Printer } from "lucide-react";
import { api, fmtDate, money, seed, type Booking } from "@/lib/api";

export const Route = createFileRoute("/invoice/$id")({
  head: () => ({ meta: [
    { title: "Invoice — Voyager" }, { name: "description", content: "Printable booking invoice." },
    { property: "og:title", content: "Invoice — Voyager" }, { property: "og:description", content: "Printable booking invoice." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }, { name: "robots", content: "noindex" },
  ] }),
  component: Invoice,
});

function Invoice() {
  const { id } = Route.useParams();
  const [b, setB] = useState<Booking | null | undefined>(undefined);
  useEffect(() => { seed(); setB(api.bookings().find((x) => x.id === id) ?? null); }, [id]);
  if (b === undefined) return null;
  if (!b) return <div className="grid min-h-screen place-items-center"><p>Invoice not found. <Link to="/" className="text-primary underline">Go home</Link></p></div>;
  const p = api.packages().find((x) => x.id === b.packageId)!;
  const d = api.destinations().find((x) => x.id === p.destinationId);
  const u = api.users().find((x) => x.id === b.userId);
  return (
    <div className="min-h-screen bg-muted px-4 py-10 print:bg-background print:p-0">
      <div className="mx-auto mb-4 flex max-w-2xl justify-end print:hidden">
        <button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"><Printer className="h-4 w-4" />Print</button>
      </div>
      <div className="mx-auto max-w-2xl rounded-2xl bg-card p-10 shadow-soft print:shadow-none">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2"><div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-brand"><Plane className="h-4 w-4 text-primary-foreground" /></div><span className="font-display text-lg font-semibold">Voyager</span></div>
          <div className="text-right"><p className="font-display text-2xl font-semibold">Invoice</p><p className="font-mono text-xs text-muted-foreground">#{b.id.toUpperCase()}</p></div>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-6 text-sm">
          <div><p className="text-xs uppercase tracking-wider text-muted-foreground">Billed to</p><p className="mt-1 font-medium">{u?.name}</p><p className="text-muted-foreground">{u?.email}</p></div>
          <div className="text-right"><p className="text-xs uppercase tracking-wider text-muted-foreground">Issued</p><p className="mt-1 font-medium">{fmtDate(b.createdAt)}</p></div>
        </div>
        <table className="mt-10 w-full text-sm">
          <thead><tr className="border-b text-left text-xs uppercase tracking-wider text-muted-foreground"><th className="py-2">Description</th><th>Seats</th><th>Rate</th><th className="text-right">Amount</th></tr></thead>
          <tbody><tr className="border-b"><td className="py-4"><p className="font-medium">{p.title}</p><p className="text-xs text-muted-foreground">{d?.name} · {p.days} days · departs {fmtDate(p.startDate)}</p></td><td>{b.seats}</td><td>{money(p.price)}</td><td className="text-right">{money(b.total)}</td></tr></tbody>
        </table>
        <div className="mt-6 flex justify-end"><div className="w-56 space-y-2 text-sm">
          <div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span>{money(b.total)}</span></div>
          <div className="flex justify-between border-t pt-2 text-base font-semibold"><span>Total</span><span className="text-primary">{money(b.total)}</span></div>
        </div></div>
        <p className="mt-12 text-center text-xs text-muted-foreground">Thank you for traveling with Voyager.</p>
      </div>
    </div>
  );
}
