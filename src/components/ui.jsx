import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSession, logout } from '../api.js';

export function useLoad(fn) {
  const [data, setData] = useState(null);
  const reload = useCallback(() => { fn().then(setData); }, []);
  useEffect(() => { reload(); }, [reload]);
  return [data, reload];
}

const badge = { admin: 'bg-rose-100 text-rose-700', manager: 'bg-amber-100 text-amber-700', guide: 'bg-emerald-100 text-emerald-700', tourist: 'bg-sky-100 text-sky-700' };

export function Shell({ title, children }) {
  const nav = useNavigate();
  const s = getSession();
  return (
    <div className="min-h-screen">
      <header className="no-print bg-gradient-to-r from-indigo-600 to-sky-500 text-white shadow">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="font-bold text-lg">TMS <span className="font-normal opacity-80">| {title}</span></div>
          <div className="flex items-center gap-3 text-sm">
            <span>{s?.name}</span>
            <span className={'px-2 py-0.5 rounded-full text-xs font-semibold capitalize ' + badge[s?.role]}>{s?.role}</span>
            <button onClick={() => { logout(); nav('/'); }} className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg">Logout</button>
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">{children}</main>
    </div>
  );
}

export const Card = ({ title, children, className = '' }) => (
  <section className={'bg-white rounded-2xl shadow-sm border border-slate-200 p-5 ' + className}>
    {title && <h2 className="font-semibold text-slate-800 mb-3">{title}</h2>}
    {children}
  </section>
);

export const Loading = () => <div className="text-slate-500 animate-pulse p-6">Loading...</div>;
export const money = (n) => '$' + Number(n).toLocaleString();

export function Table({ head, rows }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="text-slate-500 border-b"><tr>{head.map((h) => <th key={h} className="py-2 pr-4 font-medium">{h}</th>)}</tr></thead>
        <tbody>
          {rows.length === 0 && <tr><td className="py-4 text-slate-400" colSpan={head.length}>No records yet.</td></tr>}
          {rows.map((r, i) => <tr key={i} className="border-b last:border-0">{r.map((c, j) => <td key={j} className="py-2 pr-4">{c}</td>)}</tr>)}
        </tbody>
      </table>
    </div>
  );
}
