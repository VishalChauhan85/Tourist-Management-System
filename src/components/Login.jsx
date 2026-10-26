import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, loginAsRole, resetDemoData } from '../api.js';

const ROLES = [
  { role: 'admin', name: 'Admin', icon: '🛠️', desc: 'Manage users, destinations and packages', color: 'from-rose-500 to-pink-500' },
  { role: 'manager', name: 'Manager', icon: '📊', desc: 'Revenue and booking analytics', color: 'from-amber-500 to-orange-500' },
  { role: 'guide', name: 'Guide', icon: '🧭', desc: 'View assigned tour bookings', color: 'from-emerald-500 to-teal-500' },
  { role: 'tourist', name: 'Tourist', icon: '🧳', desc: 'Browse, book and get invoices', color: 'from-sky-500 to-indigo-500' },
];

export default function Login() {
  const nav = useNavigate();
  const [username, setUsername] = useState('');
  const [err, setErr] = useState('');

  const pick = async (role) => { const u = await loginAsRole(role); nav('/' + u.role); };
  const byName = async (e) => {
    e.preventDefault();
    try { const u = await login(username); nav('/' + u.role); } catch (x) { setErr(x.message); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-700 via-indigo-600 to-sky-500 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center text-white mb-8">
          <h1 className="text-4xl font-extrabold">Tourist Management System</h1>
          <p className="opacity-90 mt-2">Demo Portal: click a profile to sign in instantly. No password required.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {ROLES.map((r) => (
            <button key={r.role} onClick={() => pick(r.role)} className="bg-white rounded-2xl p-5 text-left shadow-lg hover:-translate-y-1 hover:shadow-xl transition">
              <div className={'w-12 h-12 rounded-xl bg-gradient-to-br text-2xl flex items-center justify-center ' + r.color}>{r.icon}</div>
              <div className="font-bold text-slate-800 mt-3">{r.name}</div>
              <div className="text-xs text-slate-500 mt-1">{r.desc}</div>
            </button>
          ))}
        </div>
        <form onSubmit={byName} className="mt-6 bg-white/10 backdrop-blur rounded-2xl p-4 flex flex-col sm:flex-row gap-3 items-center">
          <span className="text-white text-sm">Or enter a username:</span>
          <input value={username} onChange={(e) => { setUsername(e.target.value); setErr(''); }} placeholder="e.g. tourist_user" className="flex-1 w-full rounded-lg px-3 py-2 outline-none" />
          <button className="bg-slate-900 text-white rounded-lg px-5 py-2">Enter</button>
        </form>
        {err && <p className="text-amber-200 text-sm mt-2">{err}</p>}
        <button onClick={() => { resetDemoData(); alert('Demo data reset.'); }} className="block mx-auto mt-6 text-white/70 text-xs underline">Reset demo data</button>
      </div>
    </div>
  );
}
