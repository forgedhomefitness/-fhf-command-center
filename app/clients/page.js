"use client";
import { useState, useEffect } from "react";
import { PRICING } from "@/lib/constants";

const DEFAULT_CLIENTS = [
  { id: 1, name: "Alex Tannenbaum", type: "backToBack", startDate: "2026-03-01", lastSession: "2026-03-11", totalSessions: 8, notes: "6am sessions, very consistent", status: "active" },
  { id: 2, name: "Paul Liberman", type: "private", startDate: "2026-03-01", lastSession: "2026-03-12", totalSessions: 9, notes: "8am Mondays/Thursdays", status: "active" },
  { id: 3, name: "Jon Blotner", type: "private", startDate: "2026-03-01", lastSession: "2026-03-10", totalSessions: 6, notes: "6:45am, early bird", status: "active" },
  { id: 4, name: "Jon Nuger", type: "private", startDate: "2026-03-01", lastSession: "2026-03-10", totalSessions: 6, notes: "5:30am, very early", status: "active" },
  { id: 5, name: "Ali Nuger", type: "private", startDate: "2026-03-01", lastSession: "2026-03-08", totalSessions: 4, notes: "Schedule varies week to week. Tuesdays: private session alone $130. Thursdays: group training with husband Jon Nuger same hour $205. Either may be absent due to travel/work.", status: "active" },
  { id: 6, name: "Richa Saha", type: "private", startDate: "2026-03-01", lastSession: "2026-03-09", totalSessions: 5, notes: "4:30pm sessions", status: "active" },
  { id: 7, name: "Brian Elworthy", type: "private", startDate: "2026-03-13", lastSession: "2026-03-13", totalSessions: 1, notes: "New client, evaluation done", status: "active" },
];

const TYPE_LABELS = { private: "Private", backToBack: "Back-to-Back", studentAthlete: "Student Athlete", senior30: "Senior 30min", senior60: "Senior 60min", group: "Group" };

function daysSince(dateStr) {
  if (!dateStr) return 999;
  return Math.floor((new Date() - new Date(dateStr)) / (1000 * 60 * 60 * 24));
}

function statusColor(days) {
  if (days <= 7) return "text-green-400";
  if (days <= 14) return "text-yellow-400";
  return "text-red-400";
}

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: "", type: "private", startDate: "", lastSession: "", totalSessions: 0, notes: "", status: "active" });

  useEffect(() => {
    const saved = localStorage.getItem("fhf-clients");
    setClients(saved ? JSON.parse(saved) : DEFAULT_CLIENTS);
  }, []);

  useEffect(() => {
    if (clients.length > 0) localStorage.setItem("fhf-clients", JSON.stringify(clients));
  }, [clients]);

  function saveClient() {
    if (!form.name.trim()) return;
    if (editId) {
      setClients(clients.map(c => c.id === editId ? { ...form, id: editId, totalSessions: Number(form.totalSessions) } : c));
      setEditId(null);
    } else {
      setClients([{ ...form, id: Date.now(), totalSessions: Number(form.totalSessions) }, ...clients]);
    }
    setForm({ name: "", type: "private", startDate: "", lastSession: "", totalSessions: 0, notes: "", status: "active" });
    setShowAdd(false);
  }

  function startEdit(client) {
    setForm({ ...client });
    setEditId(client.id);
    setShowAdd(true);
  }

  function deleteClient(id) {
    if (confirm("Remove this client?")) setClients(clients.filter(c => c.id !== id));
  }

  const active = clients.filter(c => c.status === "active");
  const totalMonthly = active.reduce((sum, c) => sum + (PRICING[c.type]?.rate || 130) * 4, 0);
  const atRisk = active.filter(c => daysSince(c.lastSession) > 14).length;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-2xl font-bold text-white">Client Roster</h1>
          <p className="text-sm text-dark-400">
            {active.length} active · ~${totalMonthly.toLocaleString()}/mo projected
            {atRisk > 0 && <span className="text-red-400 ml-2">· {atRisk} at risk (14+ days)</span>}
          </p>
        </div>
        <button onClick={() => { setShowAdd(!showAdd); setEditId(null); setForm({ name: "", type: "private", startDate: "", lastSession: "", totalSessions: 0, notes: "", status: "active" }); }}
          className="px-4 py-2 rounded-lg bg-brand-500 text-dark-950 font-semibold text-sm hover:bg-brand-400 transition-colors">
          + Add Client
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6 mt-4">
        <div className="card text-center py-3">
          <p className="text-2xl font-bold text-white">{active.length}</p>
          <p className="text-xs text-dark-400 mt-1">Active Clients</p>
        </div>
        <div className="card text-center py-3">
          <p className="text-2xl font-bold text-brand-400">${totalMonthly.toLocaleString()}</p>
          <p className="text-xs text-dark-400 mt-1">Monthly Projected</p>
        </div>
        <div className="card text-center py-3">
          <p className={`text-2xl font-bold ${atRisk > 0 ? "text-red-400" : "text-green-400"}`}>{atRisk}</p>
          <p className="text-xs text-dark-400 mt-1">At Risk (14+ days)</p>
        </div>
      </div>

      {showAdd && (
        <div className="card mb-6 border border-brand-500/20">
          <h3 className="text-sm font-semibold text-white mb-4">{editId ? "Edit Client" : "New Client"}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <input placeholder="Full name" value={form.name} onChange={e => setForm({...form, name: e.target.value})}
              className="bg-dark-800 border border-dark-600 rounded-lg px-3 py-2 text-sm text-white placeholder-dark-500 focus:outline-none focus:border-brand-500" />
            <select value={form.type} onChange={e => setForm({...form, type: e.target.value})}
              className="bg-dark-800 border border-dark-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none">
              {Object.keys(TYPE_LABELS).map(t => <option key={t} value={t}>{TYPE_LABELS[t]} - ${PRICING[t]?.rate}</option>)}
            </select>
            <div>
              <label className="text-xs text-dark-400 block mb-1">Start Date</label>
              <input type="date" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})}
                className="w-full bg-dark-800 border border-dark-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none" />
            </div>
            <div>
              <label className="text-xs text-dark-400 block mb-1">Last Session</label>
              <input type="date" value={form.lastSession} onChange={e => setForm({...form, lastSession: e.target.value})}
                className="w-full bg-dark-800 border border-dark-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none" />
            </div>
            <input type="number" placeholder="Total sessions" value={form.totalSessions} onChange={e => setForm({...form, totalSessions: e.target.value})}
              className="bg-dark-800 border border-dark-600 rounded-lg px-3 py-2 text-sm text-white placeholder-dark-500 focus:outline-none" />
            <select value={form.status} onChange={e => setForm({...form, status: e.target.value})}
              className="bg-dark-800 border border-dark-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none">
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <textarea placeholder="Notes (schedule, goals, preferences...)" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})}
            className="w-full bg-dark-800 border border-dark-600 rounded-lg px-3 py-2 text-sm text-white placeholder-dark-500 focus:outline-none mb-3" rows={2} />
          <div className="flex gap-2">
            <button onClick={saveClient} className="px-4 py-2 rounded-lg bg-brand-500 text-dark-950 font-semibold text-sm hover:bg-brand-400">Save</button>
            <button onClick={() => { setShowAdd(false); setEditId(null); }} className="px-4 py-2 rounded-lg border border-dark-600 text-dark-300 text-sm hover:text-white">Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {clients.map(client => {
          const days = daysSince(client.lastSession);
          const rate = PRICING[client.type]?.rate || 130;
          return (
            <div key={client.id} className={`card flex flex-col sm:flex-row sm:items-center gap-4 ${client.status !== "active" ? "opacity-60" : ""}`}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-white font-medium">{client.name}</span>
                  {client.status !== "active" && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-dark-700 text-dark-400 uppercase">{client.status}</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-dark-400">
                  <span className="text-brand-400 font-medium">${rate}/session · ~${(rate*4).toLocaleString()}/mo</span>
                  <span>{TYPE_LABELS[client.type]}</span>
                  <span>{client.totalSessions} sessions total</span>
                  {client.startDate && <span>Since {new Date(client.startDate + "T12:00:00").toLocaleDateString("en-US", { month: "short", year: "numeric" })}</span>}
                </div>
                {client.notes && <p className="text-xs text-dark-500 mt-1">{client.notes}</p>}
              </div>
              <div className="flex items-center gap-4 flex-shrink-0">
                <div className="text-right">
                  <p className="text-xs text-dark-500">Last session</p>
                  <p className={`text-sm font-medium ${statusColor(days)}`}>
                    {days === 0 ? "Today" : days === 1 ? "Yesterday" : `${days}d ago`}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => startEdit(client)} className="text-dark-400 hover:text-brand-400 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  </button>
                  <button onClick={() => deleteClient(client.id)} className="text-dark-500 hover:text-red-400 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
