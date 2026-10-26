import { getStats, listBookings } from '../api.js';
import { Shell, Card, Table, Loading, useLoad, money } from './ui.jsx';

export default function ManagerDashboard() {
  const [s] = useLoad(getStats);
  const [bookings] = useLoad(() => listBookings('all'));
  if (!s || !bookings) return <Shell title="Manager Dashboard"><Loading /></Shell>;
  const maxRev = Math.max(1, ...s.byPackage.map((p) => p.revenue));
  const kpis = [
    ['Total revenue', money(s.revenue), 'text-emerald-600'],
    ['Bookings', s.bookings, 'text-indigo-600'],
    ['Seats sold', s.seatsSold, 'text-sky-600'],
    ['Active tours', s.activeTours, 'text-amber-600'],
  ];
  return (
    <Shell title="Manager Dashboard">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(([l, v, c]) => <Card key={l}><div className="text-xs text-slate-500">{l}</div><div className={'text-3xl font-bold ' + c}>{v}</div></Card>)}
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <Card title="Revenue by package">
          <div className="space-y-3">
            {s.byPackage.map((p) => (
              <div key={p.title}>
                <div className="flex justify-between text-xs text-slate-600"><span>{p.title}</span><span>{money(p.revenue)}</span></div>
                <div className="h-3 bg-slate-100 rounded-full"><div className="h-3 bg-gradient-to-r from-indigo-500 to-sky-400 rounded-full" style={{ width: (p.revenue / maxRev) * 100 + '%' }} /></div>
              </div>
            ))}
          </div>
        </Card>
        <Card title="Seat occupancy">
          <div className="space-y-3">
            {s.byPackage.map((p) => {
              const pct = Math.round((p.seats / p.capacity) * 100);
              return (
                <div key={p.title}>
                  <div className="flex justify-between text-xs text-slate-600"><span>{p.title}</span><span>{p.seats}/{p.capacity} ({pct}%)</span></div>
                  <div className="h-3 bg-slate-100 rounded-full"><div className="h-3 bg-emerald-500 rounded-full" style={{ width: pct + '%' }} /></div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
      <Card title="All bookings">
        <Table head={['ID', 'Tourist', 'Package', 'Seats', 'Total', 'Date']}
          rows={bookings.map((b) => [b.id.toUpperCase(), b.tourist?.name, b.package.title, b.seats, money(b.total), b.date])} />
      </Card>
    </Shell>
  );
}
