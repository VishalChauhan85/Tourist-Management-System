import { createFileRoute } from "@tanstack/react-router";
import { AppShell, Badge, DataTable } from "@/components/AppShell";
import { api, fmtDate, money } from "@/lib/api";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [
    { title: "Catalog — Voyager Admin" }, { name: "description", content: "Destinations and tour packages catalog." },
    { property: "og:title", content: "Catalog — Voyager Admin" }, { property: "og:description", content: "Destinations and tour packages catalog." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  component: () => <AppShell role="admin" title="Catalog" subtitle="Destinations and packages across the platform">{() => <Admin />}</AppShell>,
});

function Admin() {
  const dests = api.destinations();
  const users = api.users();
  return (
    <>
      <DataTable title="Destinations" cols={["Destination", "Country", "Description"]} empty="No destinations have been added."
        rows={dests.map((d) => [
          <div className="flex items-center gap-3"><img src={d.image} alt="" className="h-10 w-14 rounded-lg object-cover" /><span className="font-medium">{d.name}</span></div>,
          d.country, <span className="text-muted-foreground">{d.description}</span>,
        ])} />
      <DataTable title="Tour packages" cols={["Package", "Destination", "Price", "Days", "Seats", "Guide", "Starts"]} empty="No packages have been created."
        rows={api.packages().map((p) => [
          <span className="font-medium">{p.title}</span>, dests.find((d) => d.id === p.destinationId)?.name, money(p.price), p.days,
          <Badge tone={p.availableSeats > 0 ? "success" : "primary"}>{p.availableSeats}/{p.capacity}</Badge>,
          users.find((u) => u.id === p.guideId)?.name, fmtDate(p.startDate),
        ])} />
    </>
  );
}
