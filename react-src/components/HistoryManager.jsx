import React, { useState } from "react";
import { loadHistory, deleteHistoryItem, exportHistoryCsv, inr, formatDateShort } from "../utils/helpers";
import { playClickSound, playSuccessChime } from "../utils/audio";

export default function HistoryManager({ onLoadJob }) {
  const [history, setHistory] = useState(loadHistory());
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = history.filter((h) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      h.id.toLowerCase().includes(q) ||
      (h.customer?.name || "").toLowerCase().includes(q) ||
      (h.customer?.phone || "").toLowerCase().includes(q) ||
      (h.customer?.reg || "").toLowerCase().includes(q) ||
      (h.customer?.vehicle || "").toLowerCase().includes(q)
    );
  });

  const handleDelete = (id) => {
    if (confirm(`Delete record ${id}?`)) {
      const updated = deleteHistoryItem(id);
      setHistory(updated);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mw-card p-5 rounded-xl border border-slate-700/80 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="mw-badge-glow px-2.5 py-0.5 rounded-full text-xs font-bold uppercase">
            📜 Customer Job Card Archive
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Past Service Records &amp; Digital Invoices
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            Persistent local database storing all generated job cards with vehicle registration numbers and billing totals.
          </p>
        </div>

        <button
          onClick={() => {
            playSuccessChime();
            exportHistoryCsv(history);
          }}
          className="mw-btn-outline-amber px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow"
        >
          📥 Export to CSV
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <input
          type="text"
          className="mw-input w-full pl-10 pr-4 py-2.5 text-sm rounded-lg"
          placeholder="Search archive by Job Card ID, Reg No, Customer Name, or Phone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
      </div>

      {/* Table */}
      <div className="mw-card rounded-xl overflow-hidden border border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-900 text-slate-400 font-mono text-[11px] uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Job Card ID</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Customer &amp; Phone</th>
                <th className="py-3 px-4">Vehicle &amp; Reg</th>
                <th className="py-3 px-4 text-center">Tasks</th>
                <th className="py-3 px-4 text-right">Grand Total</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400 text-xs">
                    No past records found.
                  </td>
                </tr>
              ) : (
                filtered.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-amber-400">
                      {rec.id}
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-xs font-mono">
                      {rec.createdAt ? formatDateShort(rec.createdAt) : "Today"}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-bold text-white">{rec.customer?.name || "Customer"}</p>
                      <p className="text-[11px] font-mono text-slate-400">{rec.customer?.phone || ""}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-slate-200 font-semibold">{rec.customer?.vehicle || ""}</p>
                      <p className="text-[11px] font-mono text-amber-400/90 uppercase">{rec.customer?.reg || ""}</p>
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-slate-300">
                      {rec.items?.length || 1}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400">
                      {inr(rec.grandTotal)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            playClickSound();
                            if (onLoadJob) onLoadJob(rec);
                          }}
                          className="px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
                          title="Load into Editor"
                        >
                          📂 Open
                        </button>
                        <button
                          onClick={() => handleDelete(rec.id)}
                          className="px-2 py-1.5 rounded bg-red-950/60 hover:bg-red-900 text-red-400 text-xs"
                          title="Delete Record"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
