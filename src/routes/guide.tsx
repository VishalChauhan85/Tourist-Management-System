import { createFileRoute } from "@tanstack/react-router";
import { AppShell, DataTable } from "@/components/AppShell";
import { api, fmtDate, initials, type User } from "@/lib/api";

export const Route = createFileRoute("/guide")({
  head: () => ({ meta: [
    { title: "My Assignments — Voyager Guide" }, { name: "description", content: "Bookings assigned to you as a guide." },
    { property: "og:title", content: "My Assignments — Voyager Guide" }, { property: "og:description", content: "Bookings assigned to you as a guide." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  component: () => <AppShell role="guide" title="My assignments" subtitle="Travelers booked on tours you lead">{(u) => <Guide user={u} />}</AppShell>,
});

function Guide({ user }: { user: User }) {
  const pkgs = api.packages().filter((p) => p.guideId === user.id);
  const users = api.users();
  const rows = api.bookings().filter((b) => pkgs.some((p) => p.id === b.packageId)).map((b) => {
    const p = pkgs.find((x) => x.id === b.packageId)!;
    const t = users.find((u) => u.id === b.userId);
    return [
      <div className="flex items-center gap-3">{t && <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-brand text-[11px] font-semibold text-primary-foreground">{initials(t.name)}</span>}<span className="font-medium">{t?.name ?? "Guest"}</span></div>,
      p.title, fmtDate(p.startDate), <span className="font-semibold text-success">{b.seats}</span>,
    ];
  });
  return <DataTable title="Assigned bookings" cols={["Tourist", "Package", "Tour date", "Seats"]} rows={rows} empty="When travelers book your tours, they'll show up here." />;
}
