import { useState } from 'react';
import { listUsers, createUser, listDestinations, addDestination, listPackages, addPackage } from '../api.js';
import { Shell, Card, Table, Loading, useLoad, money } from './ui.jsx';

const input = 'w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-300 outline-none';

function Form({ title, fields, onSubmit }) {
  const [v, setV] = useState({});
  const [msg, setMsg] = useState('');
  const submit = async (e) => {
    e.preventDefault();
    try { await onSubmit(v); setV({}); setMsg('Saved!'); } catch (x) { setMsg(x.message); }
    setTimeout(() => setMsg(''), 2500);
  };
  return (
    <Card title={title}>
      <form onSubmit={submit} className="space-y-3">
        {fields.map((f) => (
          <label key={f.k} className="block text-xs text-slate-500">{f.label}
            {f.options ? (
              <select required={!f.optional} className={input} value={v[f.k] || ''} onChange={(e) => setV({ ...v, [f.k]: e.target.value })}>
                <option value="">Select...</option>
                {f.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            ) : f.area ? (
              <textarea rows={3} className={input} placeholder={f.ph} value={v[f.k] || ''} onChange={(e) => setV({ ...v, [f.k]: e.target.value })} />
            ) : (
              <input required={!f.optional} type={f.type || 'text'} min={f.type === 'number' ? 1 : undefined} className={input} placeholder={f.ph} value={v[f.k] || ''} onChange={(e) => setV({ ...v, [f.k]: e.target.value })} />
            )}
          </label>
        ))}
        <div className="flex items-center gap-3">
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-4 py-2 text-sm">Create</button>
          <span className="text-sm text-emerald-600">{msg}</span>
        </div>
      </form>
    </Card>
  );
}

export default function AdminDashboard() {
  const [users, rU] = useLoad(listUsers);
  const [dests, rD] = useLoad(listDestinations);
  const [pkgs, rP] = useLoad(listPackages);
  if (!users || !dests || !pkgs) return <Shell title="Admin Panel"><Loading /></Shell>;
  const guides = users.filter((u) => u.role === 'guide').map((u) => ({ value: u.id, label: u.name }));

  return (
    <Shell title="Admin Panel">
      <div className="grid md:grid-cols-3 gap-6">
        <Form title="Create User" onSubmit={async (v) => { await createUser(v); rU(); }}
          fields={[
            { k: 'name', label: 'Full name' },
            { k: 'username', label: 'Username' },
            { k: 'role', label: 'Role', options: ['admin', 'manager', 'guide', 'tourist'].map((r) => ({ value: r, label: r })) },
          ]} />
        <Form title="Add Destination" onSubmit={async (v) => { await addDestination(v); rD(); }}
          fields={[
            { k: 'name', label: 'Name' },
            { k: 'country', label: 'Country' },
            { k: 'description', label: 'Description', area: true },
            { k: 'image', label: 'Image URL (optional)', optional: true, ph: 'https://images.unsplash.com/...' },
          ]} />
        <Form title="Add Package" onSubmit={async (v) => { await addPackage(v); rP(); }}
          fields={[
            { k: 'destId', label: 'Destination', options: dests.map((d) => ({ value: d.id, label: d.name })) },
            { k: 'title', label: 'Title' },
            { k: 'price', label: 'Price per seat ($)', type: 'number' },
            { k: 'days', label: 'Duration (days)', type: 'number' },
            { k: 'capacity', label: 'Capacity (seats)', type: 'number' },
            { k: 'guideId', label: 'Assigned guide', options: guides },
            { k: 'itinerary', label: 'Itinerary (one line per day)', area: true, optional: true },
          ]} />
      </div>
      <Card title={'Users (' + users.length + ')'}>
        <Table head={['Name', 'Username', 'Role']} rows={users.map((u) => [u.name, u.username, u.role])} />
      </Card>
      <Card title={'Destinations (' + dests.length + ')'}>
        <Table head={['Name', 'Country', 'Description']} rows={dests.map((d) => [d.name, d.country, d.description])} />
      </Card>
      <Card title={'Packages (' + pkgs.length + ')'}>
        <Table head={['Title', 'Destination', 'Price', 'Days', 'Seats left']} rows={pkgs.map((p) => [p.title, p.destination?.name, money(p.price), p.days, p.available + '/' + p.capacity])} />
      </Card>
    </Shell>
  );
}
