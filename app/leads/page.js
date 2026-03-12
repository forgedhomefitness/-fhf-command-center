"use client";
import { useState, useEffect } from "react";

const STAGES = ["New Lead", "Contacted", "Trial Scheduled", "Trial Done", "Converted", "Lost"];
const SOURCES = ["Referral", "Google", "Instagram", "Facebook", "Cold Outreach", "Wingate", "Other"];

const STAGE_COLORS = {
  "New Lead": "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "Contacted": "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  "Trial Scheduled": "bg-orange-500/10 text-orange-400 border-orange-500/20",
  "Trial Done": "bg-purple-500/10 text-purple-400 border-purple-500/20",
  "Converted": "bg-green-500/10 text-green-400 border-green-500/20",
  "Lost": "bg-dark-700 text-dark-400 border-dark-600",
};

function daysSince(dateStr) {
  if (!dateStr) return 0;
  return Math.floor((new Date() - new Date(dateStr)) / (1000 * 60 * 60 * 24));
}

export default function Leads() {
  const [leads, setLeads] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState(null);
  const [filterStage, setFilterStage] = useState("All");
  const [form, setForm] = useState({ name: "", phone: "", email: "", source: "Referral", stage: "New Lead", dateAdded: new Date().toISOString().split("T")[0], notes: "", followUpDate: "" });

  useEffect(() => {
    const saved = localStorage.getItem("fhf-leads");
    setLeads(saved ? JSON.parse(saved) : []);
  }, []);

  useEffect(() => {
    localStorage.setItem("fhf-leads", JSON.stringify(leads));
  }, [leads]);

  function saveLead() {
    if (!form.name.trim()) return;
    if (editId) {
      setLeads(leads.map(l => l.id === editId ? { ...form, id: editId } : l));
      setEditId(null);
    } else {
      setLeads([{ ...form, id: Date.now() }, ...leads]);
    }
    setForm({ name: "", phone: "", email: "", source: "Referral", stage: "New Lead", dateAdded: new Date().toISOString().split("T")[0], notes: "", followUpDate: "" });
    setShowAdd(false);
  }

  function startEdit(lead) {
    setForm({ ...lead });
    setEditId(lead.id);
    setShowAdd(true);
  }

  function updateStage(id, stage) {
    setLeads(leads.map(l => l.id === id ? { ...l, stage } : l));
  }

  function deleteLead(id) {
    if (confirm("Remove this lead?")) setLeads(leads.filter(l => l.id !== id));
  }

  const filtered = filterStage === "All" ? leads : leads.filter(l => l.stage === filterStage);
  const active = leads.filter(l => l.stage !== "Converted" && l.stage !== "Lost");
  const converted = leads.filter(l => l.stage === "Converted").length;
  const conversionRate = leads.length > 0 ? Math.round((converted / leads.length) * 100) : 0;
  const needFollowUp = active.filter(l => l.followUpDate && new Date(l.followUpDate) <= new Date()).length;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-2xl font-bold text-white">Lead Pipeline</h1>
          <p className="text-sm text-dark-400">
            {active.length} active leads · {converted} converted · {conversionRate}% conversion
            {needFollowUp > 0 && <span className="text-yellow-400 ml-2">· {needFollowUp} follow-up overdue</span>}
          </p>
        </div>
        <button onClick={() => { setShowAdd(!showAdd); setEditId(null); setForm({ name: "", phone: "", email: "", source: "Referral", stage: "New Lead", dateAdded: new Date().toISOString().split("T")[0], notes: "", followUpDate: "" }); }}
          className="px-4 py-2 rounded-lg bg-brand-500 text-dark-950 font-semibold text-sm hover:bg-brand-400 transition-colors">
          + Add Lead
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6 mt-4">
        <div className="card text-center py-3">
          <p className="text-2xl font-bold text-white">{active.length}</p>
          <p className="text-xs text-dark-400 mt-1">Active Leads</p>
        </div>
        <div className="card text-center py-3">
          <p className="text-2xl font-bold text-green-400">{converted}</p>
          <p className="text-xs text-dark-400 mt-1">Converted</p>
        </div>
        <div className="card text-center py-3">
          <p className={`text-2xl font-bold ${needFollowUp > 0 ? "text-yellow-400" : "text-dark-300"}`}>{needFollowUp}</p>
          <p className="text-xs text-dark-400 mt-1">Follow-ups Due</p>
        </div>
      </div>

      {showAdd && (
        <div className="card mb-6 border border-brand-500/20">
          <h3 className="text-sm font-semibold text-white mb-4">{editId ? "Edit Lead" : "New Lead"}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <input placeholder="Full name *" value={form.name} onChange={e => setForm({...form, name: e.target.value})}
              className="bg-dark-800 border border-dark-600 rounded-lg px-3 py-2 text-sm text-white placeholder-dark-500 focus:outline-none focus:border-brand-500" />
            <input placeholder="Phone number" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
              className="bg-dark-800 border border-dark-600 rounded-lg px-3 py-2 text-sm text-white placeholder-dark-500 focus:outline-none" />
            <input placeholder="Email" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
              className="bg-dark-800 border border-dark-600 rounded-lg px-3 py-2 text-sm text-white placeholder-dark-500 focus:outline-none" />
            <select value={form.source} onChange={e => setForm({...form, source: e.target.value})}
              className="bg-dark-800 border border-dark-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none">
              {SOURCES.map(s => <option key={s}>{s}</option>)}
            </select>
            <select value={form.stage} onChange={e => setForm({...form, stage: e.target.value})}
              className="bg-dark-800 border border-dark-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none">
              {STAGES.map(s => <option key={s}>{s}</option>)}
            </select>
            <div>
              <label className="text-xs text-dark-400 block mb-1">Follow-up Date</label>
              <input type="date" value={form.followUpDate} onChange={e => setForm({...form, followUpDate: e.target.value})}
                className="w-full bg-dark-800 border border-dark-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none" />
            </div>
          </div>
          <textarea placeholder="Notes (interests, how they heard about you, what they said...)" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})}
            className="w-full bg-dark-800 border border-dark-600 rounded-lg px-3 py-2 text-sm text-white placeholder-dark-500 focus:outline-none mb-3" rows={2} />
          <div className="flex gap-2">
            <button onClick={saveLead} className="px-4 py-2 rounded-lg bg-brand-500 text-dark-950 font-semibold text-sm hover:bg-brand-400">Save</button>
            <button onClick={() => { setShowAdd(false); setEditId(null); }} className="px-4 py-2 rounded-lg border border-dark-600 text-dark-300 text-sm hover:text-white">Cancel</button>
          </div>
        </div>
      )}

      <div className="flex gap-2 mb-4 flex-wrap">
        {["All", ...STAGES].map(s => (
          <button key={s} onClick={() => setFilterStage(s)}
            className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${filterStage === s ? "bg-brand-500/10 text-brand-400 border border-brand-500/20" : "text-dark-400 hover:text-white border border-transparent"}`}>
            {s} {s === "All" ? `(${leads.length})` : `(${leads.filter(l => l.stage === s).length})`}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-dark-500 text-sm">No leads yet — start adding prospects!</p>
          <p className="text-dark-600 text-xs mt-1">Ask every client for one referral. That is the fastest growth at your stage.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(lead => {
            const days = daysSince(lead.dateAdded);
            const followUpOverdue = lead.followUpDate && new Date(lead.followUpDate) <= new Date() && lead.stage !== "Converted" && lead.stage !== "Lost";
            return (
              <div key={lead.id} className={`card flex flex-col sm:flex-row sm:items-start gap-4 ${lead.stage === "Lost" ? "opacity-50" : ""}`}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-white font-medium">{lead.name}</span>
                    <span className={`text-[10px] font-medium uppercase px-1.5 py-0.5 rounded border ${STAGE_COLORS[lead.stage]}`}>{lead.stage}</span>
                    {followUpOverdue && <span className="text-[10px] font-medium uppercase px-1.5 py-0.5 rounded border bg-yellow-500/10 text-yellow-400 border-yellow-500/20">Follow-up due</span>}
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-dark-400 mb-1">
                    <span>Source: {lead.source}</span>
                    {lead.phone && <span>{lead.phone}</span>}
                    {lead.email && <span>{lead.email}</span>}
                    <span>Added {days === 0 ? "today" : `${days}d ago`}</span>
                    {lead.followUpDate && <span className={followUpOverdue ? "text-yellow-400" : ""}>Follow-up: {new Date(lead.followUpDate + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>}
                  </div>
                  {lead.notes && <p className="text-xs text-dark-500">{lead.notes}</p>}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <select value={lead.stage} onChange={e => updateStage(lead.id, e.target.value)}
                    className="bg-dark-800 border border-dark-600 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none">
                    {STAGES.map(s => <option key={s}>{s}</option>)}
                  </select>
                  <button onClick={() => startEdit(lead)} className="text-dark-400 hover:text-brand-400 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  </button>
                  <button onClick={() => deleteLead(lead.id)} className="text-dark-500 hover:text-red-400 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
