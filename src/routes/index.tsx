import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, Plane } from "lucide-react";
import { api, initials, rolePath, seed, type User } from "@/lib/api";

const BG = "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2000&q=80";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sign in — Voyager Tour OS" },
      { name: "description", content: "Tourist management platform for admins, managers, guides and travelers." },
      { property: "og:title", content: "Voyager Tour OS" },
      { property: "og:description", content: "Manage destinations, tour packages and bookings in one place." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:image", content: BG },
      { name: "twitter:image", content: BG },
    ],
  }),
  component: Login,
});

function Login() {
  const nav = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  useEffect(() => { seed(); setUsers(api.users()); }, []);
  const enter = (u: User) => { api.login(u); nav({ to: rolePath[u.role] }); };

  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden px-4 py-12">
      <img src={BG} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-overlay" />
      <div className="glass relative w-full max-w-3xl rounded-3xl p-8 sm:p-12">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-brand shadow-glow"><Plane className="h-5 w-5 text-primary-foreground" /></div>
          <span className="font-display text-xl font-semibold text-glass-foreground">Voyager</span>
        </div>
        <h1 className="mt-8 font-display text-4xl font-semibold tracking-tight text-glass-foreground sm:text-5xl">Welcome aboard.</h1>
        <p className="mt-3 text-glass-foreground/75">Choose a demo profile to continue — no password needed.</p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {users.map((u) => (
            <button key={u.id} onClick={() => enter(u)} className="group flex items-center gap-4 rounded-2xl border border-glass-border bg-glass-foreground/10 p-4 text-left transition hover:-translate-y-0.5 hover:bg-glass-foreground/20">
              <div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-gradient-brand font-display text-lg font-semibold text-primary-foreground ring-2 ring-glass-border">{initials(u.name)}</div>
              <div className="flex-1">
                <p className="font-semibold text-glass-foreground">{u.name}</p>
                <p className="text-sm text-glass-foreground/70">{u.title}</p>
                <span className="mt-1.5 inline-block rounded-full bg-success/25 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wider text-glass-foreground">{u.role}</span>
              </div>
              <ArrowRight className="h-5 w-5 text-glass-foreground/50 transition group-hover:translate-x-1 group-hover:text-glass-foreground" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
