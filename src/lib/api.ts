// Simulated API layer backed by localStorage. No backend.
export type Role = "admin" | "manager" | "guide" | "tourist";
export interface User { id: string; name: string; role: Role; email: string; title: string }
export interface Destination { id: string; name: string; country: string; image: string; description: string }
export interface TourPackage {
  id: string; destinationId: string; title: string; price: number; days: number;
  capacity: number; availableSeats: number; guideId: string; startDate: string;
}
export interface Booking {
  id: string; userId: string; packageId: string; seats: number; total: number;
  createdAt: string; status: "active" | "cancelled";
}

const K = { users: "tms_users", dest: "tms_destinations", pkgs: "tms_packages", bookings: "tms_bookings", session: "tms_session", seeded: "tms_seeded_v3" };

const img = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=80`;

export const seedData = () => ({
  users: [
    { id: "u1", name: "Vishal Chauhan", role: "admin", email: "vishal@voyager.io", title: "System Administrator" },
    { id: "u2", name: "Ronak Singh", role: "manager", email: "ronak@voyager.io", title: "Operations Manager" },
    { id: "u3", name: "Aditya Kumar Tiwari", role: "guide", email: "aditya@voyager.io", title: "Senior Tour Guide" },
    { id: "u4", name: "Yug Jain", role: "tourist", email: "yug@mail.com", title: "Traveler" },
  ] as User[],
  destinations: [
    { id: "d1", name: "Paris", country: "France", image: img("photo-1502602898657-3e91760cbb34"), description: "The city of light, art and haute cuisine." },
    { id: "d2", name: "Tokyo", country: "Japan", image: img("photo-1540959733332-eab4deabeeaf"), description: "Neon skylines meet ancient temples." },
    { id: "d3", name: "Bali", country: "Indonesia", image: img("photo-1537996194471-e657df975ab4"), description: "Tropical beaches, rice terraces and serenity." },
    { id: "d4", name: "Swiss Alps", country: "Switzerland", image: img("photo-1531366936337-7c912a4589a7"), description: "Snow-capped peaks and alpine villages." },
  ] as Destination[],
  packages: [
    { id: "p1", destinationId: "d1", title: "Parisian Elegance", price: 2400, days: 6, capacity: 20, availableSeats: 16, guideId: "u3", startDate: "2026-11-14" },
    { id: "p2", destinationId: "d2", title: "Tokyo Neon Nights", price: 3100, days: 8, capacity: 15, availableSeats: 15, guideId: "u3", startDate: "2026-12-02" },
    { id: "p3", destinationId: "d3", title: "Bali Serenity Retreat", price: 1800, days: 7, capacity: 12, availableSeats: 10, guideId: "u3", startDate: "2026-11-28" },
    { id: "p4", destinationId: "d4", title: "Alpine Grand Tour", price: 3900, days: 9, capacity: 10, availableSeats: 10, guideId: "u3", startDate: "2027-01-10" },
  ] as TourPackage[],
  bookings: [
    { id: "b1001", userId: "u4", packageId: "p1", seats: 4, total: 9600, createdAt: "2026-10-12T10:00:00Z", status: "active" },
    { id: "b1002", userId: "u4", packageId: "p3", seats: 2, total: 3600, createdAt: "2026-10-20T15:30:00Z", status: "active" },
  ] as Booking[],
});

const read = <T,>(k: string, fallback: T): T => {
  try { const v = localStorage.getItem(k); return v ? (JSON.parse(v) as T) : fallback; } catch { return fallback; }
};
const write = (k: string, v: unknown) => localStorage.setItem(k, JSON.stringify(v));

export function seed() {
  if (localStorage.getItem(K.seeded)) return;
  const d = seedData();
  write(K.users, d.users); write(K.dest, d.destinations); write(K.pkgs, d.packages); write(K.bookings, d.bookings);
  localStorage.setItem(K.seeded, "1");
}

export const api = {
  users: () => read<User[]>(K.users, []),
  destinations: () => read<Destination[]>(K.dest, []),
  packages: () => read<TourPackage[]>(K.pkgs, []),
  bookings: () => read<Booking[]>(K.bookings, []),
  session: () => read<User | null>(K.session, null),
  login: (u: User) => write(K.session, u),
  logout: () => localStorage.removeItem(K.session),
  book(userId: string, packageId: string, seats: number): Booking {
    const pkgs = api.packages();
    const p = pkgs.find((x) => x.id === packageId);
    if (!p) throw new Error("Package not found");
    validateSeats(seats, p);
    p.availableSeats -= seats;
    const b: Booking = { id: "b" + Date.now(), userId, packageId, seats, total: seats * p.price, createdAt: new Date().toISOString(), status: "active" };
    write(K.pkgs, pkgs);
    write(K.bookings, [...api.bookings(), b]);
    return b;
  },
};

export function validateSeats(seats: number, p: Pick<TourPackage, "availableSeats" | "capacity">) {
  if (!Number.isInteger(seats) || seats < 1) throw new Error("Enter at least 1 seat");
  if (seats > p.capacity) throw new Error(`Exceeds tour capacity of ${p.capacity}`);
  if (seats > p.availableSeats) throw new Error(`Only ${p.availableSeats} seats left`);
}

export const rolePath: Record<Role, "/tourist" | "/admin" | "/guide" | "/manager"> = {
  tourist: "/tourist", admin: "/admin", guide: "/guide", manager: "/manager",
};
export const money = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
export const fmtDate = (s: string) => new Date(s).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
export const initials = (name: string) =>
  name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");
