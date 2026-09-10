import React, { useState } from "react";
import { SPARES_INVENTORY } from "../data/sparesInventory";
import { inr } from "../utils/helpers";
import { playClickSound, playSuccessChime } from "../utils/audio";

export default function SparesManager({ onAddSpare }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = ["all", "Oils & Lubricants", "Braking", "Electricals", "Drive & Transmission", "Filters & Intake", "Suspension", "EV Specific"];

  const filtered = SPARES_INVENTORY.filter((sp) => {
    const matchesCat = selectedCategory === "all" || sp.category.toLowerCase().includes(selectedCategory.toLowerCase());
    if (!matchesCat) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      sp.name.toLowerCase().includes(q) ||
      sp.partNumber.toLowerCase().includes(q) ||
      sp.brand.toLowerCase().includes(q) ||
      sp.compatibility.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mw-card p-5 rounded-xl border border-slate-700/80 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="mw-badge-glow px-2.5 py-0.5 rounded-full text-xs font-bold uppercase">
            📦 Parts Warehouse &amp; Rate Estimator
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Two-Wheeler Genuine Spares &amp; Labor Price List
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            Real-time stock lookup for OEM (Honda, Hero, TVS, RE, Ather) and premium aftermarket components.
          </p>
        </div>

        <div className="bg-slate-950 px-4 py-2.5 rounded-lg border border-slate-800 text-right">
          <span className="text-xs text-slate-400 block">Catalog Inventory</span>
          <span className="text-base font-bold text-amber-400 font-mono">{SPARES_INVENTORY.length} Standard SKU Items</span>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="md:col-span-2 relative">
          <input
            type="text"
            className="mw-input w-full pl-10 pr-4 py-2.5 text-sm rounded-lg"
            placeholder="Search part by name, part #, or vehicle model..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
        </div>

        <div>
          <select
            className="mw-input w-full px-3 py-2.5 text-xs sm:text-sm rounded-lg appearance-none"
            value={selectedCategory}
            onChange={(e) => {
              playClickSound();
              setSelectedCategory(e.target.value);
            }}
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c === "all" ? "📁 All Categories" : `📁 ${c}`}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="mw-card rounded-xl overflow-hidden border border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-900 text-slate-400 font-mono text-[11px] uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Part Description &amp; SKU</th>
                <th className="py-3 px-4">Category / Brand</th>
                <th className="py-3 px-4">Compatibility</th>
                <th className="py-3 px-4 text-right">Part Price</th>
                <th className="py-3 px-4 text-right">Fitment Labor</th>
                <th className="py-3 px-4 text-center">Stock</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                    No spare parts found matching "{searchQuery}".
                  </td>
                </tr>
              ) : (
                filtered.map((sp) => (
                  <tr key={sp.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3 px-4">
                      <p className="font-bold text-white leading-snug">{sp.name}</p>
                      <p className="text-[11px] font-mono text-amber-400/90">{sp.partNumber}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-slate-300 block">{sp.category}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{sp.brand}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-xs max-w-[200px]">
                      {sp.compatibility}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-white">
                      {inr(sp.price)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-400">
                      {inr(sp.labor)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        sp.stock > 10 ? "bg-emerald-950 text-emerald-400 border border-emerald-800" : "bg-amber-950 text-amber-400 border border-amber-800"
                      }`}>
                        {sp.stock} left
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          playSuccessChime();
                          if (onAddSpare) onAddSpare(sp);
                        }}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white flex items-center gap-1 ml-auto shadow"
                      >
                        + Add to Job
                      </button>
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
