import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { BarChart3, Compass, LayoutGrid, LogOut, Map, Menu, Plane, X } from "lucide-react";
import { api, initials, rolePath, seed, type Role, type User } from "@/lib/api";

const navByRole: Record<Role, { label: string; icon: typeof Map }> = {
  admin: { label: "Catalog", icon: LayoutGrid },
  manager: { label: "Overview", icon: BarChart3 },
  guide: { label: "My Assignments", icon: Compass },
  tourist: { label: "Explore Tours", icon: Map },
};

export function useData() {
  const [tick, setTick] = useState(0);
  return { refresh: () => setTick((t) => t + 1), tick };
}

export function AppShell({ role, title, subtitle, children }: { role: Role; title: string; subtitle?: string; children: (u: User) => ReactNode }) {
  const nav = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [user, setUser] = useState<User | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    seed();
    const s = api.session();
    if (!s) { nav({ to: "/" }); return; }
    if (s.role !== role) { nav({ to: rolePath[s.role] }); return; }
    setUser(s);
  }, [role, nav]);

  if (!user) return <div className="min-h-screen bg-background" />;
  const item = navByRole[user.role];
  const to = rolePath[user.role];

  const sidebar = (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex items-center gap-2.5 px-6 py-6">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-brand shadow-glow"><Plane className="h-4 w-4 text-primary-foreground" /></div>
        <div><p className="font-display text-lg font-semibold leading-none">Voyager</p><p className="mt-1 text-[11px] uppercase tracking-widest text-sidebar-foreground/50">Tour OS</p></div>
      </div>
      <nav className="flex-1 space-y-1 px-3">
        <p className="px-3 pb-2 text-[11px] font-medium uppercase tracking-widest text-sidebar-foreground/40">Workspace</p>
        <Link to={to} onClick={() => setOpen(false)} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${path === to ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60"}`}>
          <item.icon className="h-4 w-4" /> {item.label}
          {path === to && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-success" />}
        </Link>
      </nav>
      <div className="m-3 rounded-2xl border border-sidebar-border bg-sidebar-accent/50 p-3">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-brand text-sm font-semibold text-primary-foreground ring-2 ring-primary/60">{initials(user.name)}</div>
          <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{user.name}</p><p className="text-xs capitalize text-success">{user.role}</p></div>
          <button aria-label="Log out" onClick={() => { api.logout(); nav({ to: "/" }); }} className="rounded-lg p-2 text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground"><LogOut className="h-4 w-4" /></button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen w-full bg-background">
      <aside className="fixed inset-y-0 left-0 hidden w-64 lg:block">{sidebar}</aside>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-foreground/50" onClick={() => setOpen(false)} />
          <aside className="relative h-full w-64">{sidebar}<button aria-label="Close" onClick={() => setOpen(false)} className="absolute right-3 top-6 text-sidebar-foreground"><X className="h-5 w-5" /></button></aside>
        </div>
      )}
      <main className="min-w-0 flex-1 lg:pl-64">
        <header className="sticky top-0 z-10 flex items-center gap-3 border-b bg-background/80 px-6 py-5 backdrop-blur-xl lg:px-10">
          <button aria-label="Open menu" className="rounded-lg p-2 hover:bg-muted lg:hidden" onClick={() => setOpen(true)}><Menu className="h-5 w-5" /></button>
          <div><h1 className="font-display text-2xl font-semibold tracking-tight">{title}</h1>{subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}</div>
        </header>
        <div className="space-y-8 px-6 py-8 lg:px-10">{children(user)}</div>
      </main>
    </div>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-2xl border bg-card shadow-soft ${className}`}>{children}</div>;
}

export function DataTable({ title, cols, rows, empty }: { title: string; cols: string[]; rows: ReactNode[][]; empty: string }) {
  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between border-b px-6 py-4"><h2 className="font-display font-semibold">{title}</h2><span className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">{rows.length}</span></div>
      {rows.length === 0 ? (
        <div className="flex flex-col items-center px-6 py-14 text-center">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-accent text-accent-foreground"><Compass className="h-5 w-5" /></div>
          <p className="mt-4 font-medium">Nothing here yet</p><p className="mt-1 max-w-xs text-sm text-muted-foreground">{empty}</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">{cols.map((c) => <th key={c} className="px-6 py-3 font-medium">{c}</th>)}</tr></thead>
            <tbody>{rows.map((r, i) => <tr key={i} className="border-t transition hover:bg-muted/30">{r.map((c, j) => <td key={j} className="whitespace-nowrap px-6 py-4">{c}</td>)}</tr>)}</tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

export const Badge = ({ children, tone = "success" }: { children: ReactNode; tone?: "success" | "primary" }) => (
  <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${tone === "success" ? "bg-success/10 text-success" : "bg-primary/10 text-primary"}`}>
    <span className={`h-1.5 w-1.5 rounded-full ${tone === "success" ? "bg-success" : "bg-primary"}`} />{children}
  </span>
);
