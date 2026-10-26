import { listBookings } from '../api.js';
import { Shell, Card, Table, Loading, useLoad } from './ui.jsx';

export default function GuideDashboard() {
  const [bookings] = useLoad(() => listBookings('guide'));
  if (!bookings) return <Shell title="Guide Panel"><Loading /></Shell>;
  const tours = [...new Set(bookings.map((b) => b.package.title))];
  const travellers = bookings.reduce((s, b) => s + b.seats, 0);
  return (
    <Shell title="Guide Panel">
      <div className="grid sm:grid-cols-3 gap-4">
        <Card><div className="text-xs text-slate-500">Assigned bookings</div><div className="text-3xl font-bold">{bookings.length}</div></Card>
        <Card><div className="text-xs text-slate-500">Active tours</div><div className="text-3xl font-bold">{tours.length}</div></Card>
        <Card><div className="text-xs text-slate-500">Total travellers</div><div className="text-3xl font-bold">{travellers}</div></Card>
      </div>
      <Card title="My Assigned Bookings">
        <Table head={['Booking', 'Tour', 'Destination', 'Tourist', 'Seats', 'Date', 'Status']}
          rows={bookings.map((b) => [b.id.toUpperCase(), b.package.title, b.destination.name, b.tourist?.name, b.seats, b.date, b.status])} />
      </Card>
    </Shell>
  );
}
