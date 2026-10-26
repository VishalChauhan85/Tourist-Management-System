import { useState } from 'react';
import { listPackages, listBookings, createBooking, getSession } from '../api.js';
import { Shell, Card, Loading, useLoad, money } from './ui.jsx';

function Invoice({ b, onClose }) {
  const user = getSession();
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-lg w-full p-8 max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-start">
          <div><h2 className="text-2xl font-extrabold text-indigo-700">INVOICE</h2><p className="text-xs text-slate-500">Tourist Management System</p></div>
          <div className="text-right text-sm"><div>#{b.id.toUpperCase()}</div><div className="text-slate-500">{b.date}</div></div>
        </div>
        <div className="mt-6 text-sm"><div className="text-slate-500">Billed to</div><div className="font-semibold">{user.name}</div></div>
        <table className="w-full text-sm mt-6">
          <thead className="border-b text-slate-500 text-left"><tr><th className="py-2">Package</th><th>Seats</th><th>Rate</th><th className="text-right">Amount</th></tr></thead>
          <tbody><tr><td className="py-3">{b.package.title}<div className="text-xs text-slate-500">{b.destination.name}, {b.package.days} days</div></td><td>{b.seats}</td><td>{money(b.package.price)}</td><td className="text-right">{money(b.total)}</td></tr></tbody>
        </table>
        <div className="border-t mt-4 pt-3 flex justify-between font-bold"><span>Total paid</span><span>{money(b.total)}</span></div>
        <div className="mt-2 text-xs text-emerald-600 font-semibold uppercase">{b.status}</div>
        <div className="no-print flex gap-3 mt-6">
          <button onClick={() => window.print()} className="bg-indigo-600 text-white rounded-lg px-4 py-2 text-sm">Print</button>
          <button onClick={onClose} className="border rounded-lg px-4 py-2 text-sm">Close</button>
        </div>
      </div>
    </div>
  );
}

function PackageCard({ p, onBooked }) {
  const [seats, setSeats] = useState(1);
  const [msg, setMsg] = useState(null);
  const [open, setOpen] = useState(false);
  const book = async () => {
    try { await createBooking({ packageId: p.id, seats }); setMsg({ ok: true, t: 'Booked!' }); onBooked(); }
    catch (e) { setMsg({ ok: false, t: e.message }); }
  };
  return (
    <div className="bg-white rounded-2xl shadow-sm border overflow-hidden flex flex-col">
      <img src={p.destination?.image} alt={p.destination?.name} className="h-40 w-full object-cover" />
      <div className="p-4 flex-1 flex flex-col">
        <div className="text-xs text-indigo-600 font-semibold">{p.destination?.name}, {p.destination?.country}</div>
        <h3 className="font-bold text-slate-800">{p.title}</h3>
        <div className="text-sm text-slate-500 mt-1">{p.days} days · {money(p.price)}/seat · <span className={p.available === 0 ? 'text-rose-600' : 'text-emerald-600'}>{p.available} seats left</span></div>
        <button onClick={() => setOpen(!open)} className="text-left text-xs text-indigo-600 mt-2 underline">{open ? 'Hide' : 'View'} itinerary</button>
        {open && <ul className="text-xs text-slate-600 mt-2 space-y-1 list-disc pl-4">{p.itinerary.map((i) => <li key={i}>{i}</li>)}</ul>}
        <div className="mt-auto pt-4 flex gap-2">
          <input type="number" min="1" value={seats} onChange={(e) => setSeats(e.target.value)} className="w-16 border rounded-lg px-2 py-1 text-sm" />
          <button disabled={p.available === 0} onClick={book} className="flex-1 bg-indigo-600 disabled:bg-slate-300 text-white rounded-lg text-sm py-1.5">Book now</button>
        </div>
        {msg && <div className={'text-xs mt-2 ' + (msg.ok ? 'text-emerald-600' : 'text-rose-600')}>{msg.t}</div>}
      </div>
    </div>
  );
}

export default function TouristDashboard() {
  const [pkgs, reloadP] = useLoad(listPackages);
  const [mine, reloadB] = useLoad(() => listBookings('mine'));
  const [inv, setInv] = useState(null);
  const [itin, setItin] = useState(null);
  if (!pkgs || !mine) return <Shell title="Tourist Panel"><Loading /></Shell>;
  const refresh = () => { reloadP(); reloadB(); };

  return (
    <Shell title="Tourist Panel">
      <h2 className="text-xl font-bold text-slate-800">Available Packages</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">{pkgs.map((p) => <PackageCard key={p.id} p={p} onBooked={refresh} />)}</div>
      <Card title="My Bookings">
        {mine.length === 0 && <p className="text-sm text-slate-400">No bookings yet.</p>}
        <div className="space-y-3">
          {mine.map((b) => (
            <div key={b.id} className="border rounded-xl p-3">
              <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <div><span className="font-semibold">{b.package.title}</span> <span className="text-slate-500">· {b.destination.name} · {b.seats} seat(s) · {money(b.total)}</span></div>
                <div className="flex gap-2">
                  <button onClick={() => setItin(itin === b.id ? null : b.id)} className="border rounded-lg px-3 py-1 text-xs">Itinerary</button>
                  <button onClick={() => setInv(b)} className="bg-indigo-600 text-white rounded-lg px-3 py-1 text-xs">Invoice</button>
                </div>
              </div>
              {itin === b.id && <ul className="text-xs text-slate-600 mt-2 list-disc pl-5">{b.package.itinerary.map((i) => <li key={i}>{i}</li>)}</ul>}
            </div>
          ))}
        </div>
      </Card>
      {inv && <Invoice b={inv} onClose={() => setInv(null)} />}
    </Shell>
  );
}
