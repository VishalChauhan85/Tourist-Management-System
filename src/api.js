// localStorage-backed "backend" with simulated network latency.
const DB = 'tms_db';
const SES = 'tms_session';
const LATENCY = 300;

const img = (id) => 'https://images.unsplash.com/' + id + '?auto=format&fit=crop&w=800&q=60';
const uid = (p) => p + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);

function seed() {
  return {
    users: [
      { id: 'u1', username: 'admin_user', name: 'Alex Admin', role: 'admin' },
      { id: 'u2', username: 'manager_user', name: 'Maya Manager', role: 'manager' },
      { id: 'u3', username: 'guide_user', name: 'Gabriel Guide', role: 'guide' },
      { id: 'u4', username: 'tourist_user', name: 'Tina Tourist', role: 'tourist' },
    ],
    destinations: [
      { id: 'd1', name: 'Paris', country: 'France', description: 'The City of Light: art, cafes and the iconic Eiffel Tower.', image: img('photo-1502602898657-3e91760cbb34') },
      { id: 'd2', name: 'Tokyo', country: 'Japan', description: 'Neon skylines, ancient temples and world-class cuisine.', image: img('photo-1540959733332-eab4deabeeaf') },
      { id: 'd3', name: 'New York', country: 'USA', description: 'The city that never sleeps: Broadway, Central Park and skyscrapers.', image: img('photo-1496442226666-8d4d0e62e6e9') },
      { id: 'd4', name: 'Bali', country: 'Indonesia', description: 'Tropical beaches, rice terraces and spiritual retreats.', image: img('photo-1537996194471-e657df975ab4') },
    ],
    packages: [
      { id: 'p1', destId: 'd1', title: 'Parisian Romance', price: 1450, days: 5, capacity: 20, guideId: 'u3',
        itinerary: ['Day 1: Arrival and Seine river cruise', 'Day 2: Eiffel Tower and Trocadero', 'Day 3: Louvre Museum', 'Day 4: Versailles day trip', 'Day 5: Montmartre and departure'] },
      { id: 'p2', destId: 'd2', title: 'Tokyo Highlights', price: 1890, days: 7, capacity: 15, guideId: 'u3',
        itinerary: ['Day 1: Arrival in Shinjuku', 'Day 2: Senso-ji and Asakusa', 'Day 3: Shibuya and Harajuku', 'Day 4: Mt. Fuji excursion', 'Day 5: Tsukiji food tour', 'Day 6: Akihabara and teamLab', 'Day 7: Departure'] },
      { id: 'p3', destId: 'd3', title: 'Big Apple Explorer', price: 1250, days: 4, capacity: 25, guideId: 'u3',
        itinerary: ['Day 1: Times Square and Broadway', 'Day 2: Statue of Liberty and Wall Street', 'Day 3: Central Park and the Met', 'Day 4: Brooklyn Bridge and departure'] },
      { id: 'p4', destId: 'd4', title: 'Bali Bliss Retreat', price: 980, days: 6, capacity: 12, guideId: 'u3',
        itinerary: ['Day 1: Arrival in Seminyak', 'Day 2: Ubud rice terraces', 'Day 3: Monkey Forest and temples', 'Day 4: Nusa Penida island', 'Day 5: Spa and beach day', 'Day 6: Departure'] },
    ],
    bookings: [
      { id: 'b1', packageId: 'p1', touristId: 'u4', seats: 2, total: 2900, date: '2026-09-02', status: 'confirmed' },
      { id: 'b2', packageId: 'p2', touristId: 'u4', seats: 3, total: 5670, date: '2026-09-15', status: 'confirmed' },
      { id: 'b3', packageId: 'p4', touristId: 'u4', seats: 4, total: 3920, date: '2026-10-01', status: 'confirmed' },
    ],
  };
}

function load() {
  let raw = localStorage.getItem(DB);
  if (!raw) {
    raw = JSON.stringify(seed());
    localStorage.setItem(DB, raw);
  }
  return JSON.parse(raw);
}
const save = (d) => localStorage.setItem(DB, JSON.stringify(d));

function run(fn) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        const out = fn();
        resolve(out === undefined ? undefined : JSON.parse(JSON.stringify(out)));
      } catch (e) {
        reject(e);
      }
    }, LATENCY);
  });
}

export const resetDemoData = () => { localStorage.removeItem(DB); load(); };
load(); // seed on first app load

// ---------- Auth ----------
export const getSession = () => {
  try { return JSON.parse(localStorage.getItem(SES)); } catch { return null; }
};
export const logout = () => localStorage.removeItem(SES);
export const login = (username) => run(() => {
  const u = load().users.find((x) => x.username.toLowerCase() === String(username).trim().toLowerCase());
  if (!u) throw new Error('User not found. Try: admin_user, manager_user, guide_user, tourist_user');
  localStorage.setItem(SES, JSON.stringify(u));
  return u;
});
export const loginAsRole = (role) => run(() => {
  const u = load().users.find((x) => x.role === role);
  localStorage.setItem(SES, JSON.stringify(u));
  return u;
});

// ---------- Users / Destinations / Packages ----------
export const listUsers = () => run(() => load().users);
export const createUser = ({ username, name, role }) => run(() => {
  const d = load();
  if (d.users.some((u) => u.username === username)) throw new Error('Username already exists');
  d.users.push({ id: uid('u'), username, name, role });
  save(d);
});
export const listDestinations = () => run(() => load().destinations);
export const addDestination = ({ name, country, description, image }) => run(() => {
  const d = load();
  d.destinations.push({ id: uid('d'), name, country, description, image: image || img('photo-1488646953014-85cb44e25828') });
  save(d);
});

function withAvailability(d) {
  return d.packages.map((p) => {
    const sold = d.bookings.filter((b) => b.packageId === p.id && b.status === 'confirmed').reduce((s, b) => s + b.seats, 0);
    const dest = d.destinations.find((x) => x.id === p.destId);
    return { ...p, sold, available: p.capacity - sold, destination: dest };
  });
}
export const listPackages = () => run(() => withAvailability(load()));
export const addPackage = ({ destId, title, price, days, capacity, guideId, itinerary }) => run(() => {
  const d = load();
  d.packages.push({
    id: uid('p'), destId, title, guideId,
    price: Number(price), days: Number(days), capacity: Number(capacity),
    itinerary: String(itinerary || '').split('\n').map((s) => s.trim()).filter(Boolean),
  });
  save(d);
});

// ---------- Bookings ----------
export const createBooking = ({ packageId, seats }) => run(() => {
  const s = getSession();
  const d = load();
  const pkg = withAvailability(d).find((p) => p.id === packageId);
  const n = Number(seats);
  if (!pkg) throw new Error('Package not found');
  if (!Number.isInteger(n) || n < 1) throw new Error('Enter a valid number of seats');
  if (n > pkg.available) throw new Error('Only ' + pkg.available + ' seat(s) left for this package');
  const b = { id: uid('b'), packageId, touristId: s.id, seats: n, total: n * pkg.price, date: new Date().toISOString().slice(0, 10), status: 'confirmed' };
  d.bookings.push(b);
  save(d);
  return b;
});

function expand(d, b) {
  const pkg = d.packages.find((p) => p.id === b.packageId);
  return {
    ...b,
    package: pkg,
    destination: d.destinations.find((x) => x.id === pkg.destId),
    tourist: d.users.find((u) => u.id === b.touristId),
    guide: d.users.find((u) => u.id === pkg.guideId),
  };
}
export const listBookings = (scope) => run(() => {
  const s = getSession();
  const d = load();
  let list = d.bookings;
  if (scope === 'mine') list = list.filter((b) => b.touristId === s.id);
  if (scope === 'guide') list = list.filter((b) => d.packages.find((p) => p.id === b.packageId)?.guideId === s.id);
  return list.map((b) => expand(d, b));
});

// ---------- Stats ----------
export const getStats = () => run(() => {
  const d = load();
  const confirmed = d.bookings.filter((b) => b.status === 'confirmed');
  const byPackage = d.packages.map((p) => {
    const bs = confirmed.filter((b) => b.packageId === p.id);
    return { title: p.title, revenue: bs.reduce((s, b) => s + b.total, 0), seats: bs.reduce((s, b) => s + b.seats, 0), capacity: p.capacity };
  });
  return {
    revenue: confirmed.reduce((s, b) => s + b.total, 0),
    bookings: confirmed.length,
    seatsSold: confirmed.reduce((s, b) => s + b.seats, 0),
    activeTours: byPackage.filter((p) => p.seats > 0).length,
    users: d.users.length,
    byPackage,
  };
});
