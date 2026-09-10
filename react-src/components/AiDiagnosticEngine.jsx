import React, { useState, useEffect, useMemo, useCallback } from "react";
import { POPULAR_VEHICLES, QUICK_SYMPTOM_CHIPS, KNOWLEDGE_BASE } from "../data/knowledgeBase";
import { PRESET_SCENARIOS } from "../data/presetScenarios";
import { inr, makeJobCardId, formatEta } from "../utils/helpers";
import { playClickSound, playWrenchSound, playSuccessChime } from "../utils/audio";

export default function AiDiagnosticEngine({ onOpenDispatch, onJobUpdated }) {
  const [customer, setCustomer] = useState({
    name: "Karthik Raja",
    phone: "9894312456",
    vehicle: "Honda Activa 6G / 125",
    reg: "TN 66 BZ 4521"
  });

  const [complaint, setComplaint] = useState(
    "oil change pannanum, front brake la sound varudhu, chain loose ah irukku sound varudhu, fork oil leak, full water wash pannunga"
  );
  const [customItems, setCustomItems] = useState([]);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [gstPercent, setGstPercent] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [estimate, setEstimate] = useState(null);

  const analyzeText = useCallback((text) => {
    const lower = text.toLowerCase();
    return KNOWLEDGE_BASE.filter((item) =>
      item.keywords.some((kw) => lower.includes(kw))
    );
  }, []);

  const runDiagnosis = useCallback(() => {
    setIsAnalyzing(true);
    playWrenchSound();
    const now = new Date();

    setTimeout(() => {
      const matched = analyzeText(complaint);
      const combinedItems = [...matched, ...customItems];
      const partsCost = combinedItems.reduce((s, m) => s + m.partCost, 0);
      const laborCost = combinedItems.reduce((s, m) => s + m.laborCost, 0);
      const subtotal = partsCost + laborCost;
      const discountAmount = subtotal * (discountPercent / 100);
      const taxableAmount = Math.max(0, subtotal - discountAmount);
      const gstAmount = taxableAmount * (gstPercent / 100);
      const grandTotal = Math.round(taxableAmount + gstAmount);
      const duration = combinedItems.reduce((s, m) => s + m.duration, 0) + 15;

      const newEst = {
        id: makeJobCardId(now),
        createdAt: now,
        items: combinedItems,
        partsCost,
        laborCost,
        subtotal,
        discountPercent,
        discountAmount,
        gstPercent,
        gstAmount,
        grandTotal,
        duration,
        eta: formatEta(now, duration),
        stageIndex: 0,
        customer: { ...customer }
      };

      setEstimate(newEst);
      setIsAnalyzing(false);
      playSuccessChime();
      if (onJobUpdated) onJobUpdated(newEst);
    }, 600);
  }, [complaint, customItems, customer, discountPercent, gstPercent, analyzeText, onJobUpdated]);

  useEffect(() => {
    runDiagnosis();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addChip = (chip) => {
    playClickSound();
    setComplaint((prev) => {
      const lower = prev.toLowerCase();
      if (lower.includes(chip.toLowerCase())) return prev;
      return prev.trim().length ? `${prev.trim()}, ${chip}` : chip;
    });
  };

  const loadPreset = (preset) => {
    playSuccessChime();
    setCustomer({ ...preset.customer });
    setComplaint(preset.complaint);
    setCustomItems([]);
  };

  const removeItem = (key) => {
    playClickSound();
    setCustomItems((prev) => prev.filter((i) => i.key !== key));
    if (estimate) {
      const filtered = estimate.items.filter((i) => i.key !== key);
      const partsCost = filtered.reduce((s, m) => s + m.partCost, 0);
      const laborCost = filtered.reduce((s, m) => s + m.laborCost, 0);
      const subtotal = partsCost + laborCost;
      const discountAmount = subtotal * (discountPercent / 100);
      const taxableAmount = Math.max(0, subtotal - discountAmount);
      const gstAmount = taxableAmount * (gstPercent / 100);
      const grandTotal = Math.round(taxableAmount + gstAmount);
      const duration = filtered.reduce((s, m) => s + m.duration, 0) + 15;

      setEstimate({
        ...estimate,
        items: filtered,
        partsCost,
        laborCost,
        subtotal,
        grandTotal,
        duration,
        eta: formatEta(estimate.createdAt, duration)
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Preset Scenarios Banner */}
      <div className="mw-card p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-amber-400 font-bold text-xs uppercase tracking-wider">⚡ 1-Click Demo Scenarios:</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 flex-1 max-w-4xl">
          {PRESET_SCENARIOS.map((p) => (
            <button
              key={p.id}
              onClick={() => loadPreset(p)}
              className="text-left px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-200 transition-all flex items-center justify-between"
            >
              <span className="font-semibold line-clamp-1">{p.title}</span>
              <span className="text-amber-400 text-xs">Load ➔</span>
            </button>
          ))}
        </div>
      </div>

      {/* Input Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Customer Profile */}
        <div className="mw-card rounded-xl overflow-hidden border border-slate-800">
          <div className="bg-slate-900/90 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <span className="text-amber-400">👤</span> Customer &amp; Vehicle Profile
            </h3>
            <span className="text-[11px] font-mono text-slate-400">Coimbatore TN 66/38</span>
          </div>

          <div className="p-4 sm:p-5 space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Customer Full Name</label>
              <input
                type="text"
                className="mw-input w-full px-3 py-2 text-sm rounded-lg"
                value={customer.name}
                onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                placeholder="e.g. Karthik Raja"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Mobile Phone</label>
              <input
                type="tel"
                className="mw-input w-full px-3 py-2 text-sm rounded-lg font-mono"
                value={customer.phone}
                onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                placeholder="10-digit number"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Vehicle Model</label>
                <select
                  className="mw-input w-full px-3 py-2 text-sm rounded-lg appearance-none"
                  value={customer.vehicle}
                  onChange={(e) => setCustomer({ ...customer, vehicle: e.target.value })}
                >
                  {POPULAR_VEHICLES.map((v) => (
                    <option key={v.name} value={v.name}>{v.name} ({v.category})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Registration Number</label>
                <input
                  type="text"
                  className="mw-input w-full px-3 py-2 text-sm rounded-lg font-mono uppercase"
                  value={customer.reg}
                  onChange={(e) => setCustomer({ ...customer, reg: e.target.value })}
                  placeholder="TN 66 BZ 4521"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Complaint Box */}
        <div className="mw-card rounded-xl overflow-hidden border border-slate-800 flex flex-col justify-between">
          <div className="bg-slate-900/90 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <span className="text-amber-400">🧠</span> NLP Fault Diagnostic Box
            </h3>
            <span className="text-[11px] text-amber-300 font-mono">Tamil / Tanglish / English</span>
          </div>

          <div className="p-4 sm:p-5 space-y-3 flex-1 flex flex-col justify-between">
            <textarea
              className="mw-input w-full p-3 text-sm rounded-lg min-h-[110px] resize-none flex-1 font-sans"
              value={complaint}
              onChange={(e) => setComplaint(e.target.value)}
              placeholder="Describe symptoms in Tanglish / Tamil / English..."
            ></textarea>

            <div>
              <p className="text-[11px] font-semibold text-slate-400 mb-2">Quick Symptom Chips — Tap to Append:</p>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_SYMPTOM_CHIPS.map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => addChip(chip)}
                    className="mw-chip px-3 py-1 rounded-full text-xs font-medium capitalize"
                  >
                    + {chip}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="flex items-center justify-center gap-3 pt-2">
        <button
          onClick={runDiagnosis}
          disabled={isAnalyzing}
          className="mw-btn-primary px-8 py-3.5 rounded-xl text-sm font-bold flex items-center gap-2.5 shadow-xl uppercase tracking-wider"
        >
          <span>✨</span> {isAnalyzing ? "Analyzing..." : "Run AI Diagnosis & Build Job Card"}
        </button>
      </div>

      {/* Output Dashboard */}
      {estimate && !isAnalyzing && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <div className="mw-metric-card p-3.5">
              <span class="text-[11px] text-slate-400 block">Job Card ID</span>
              <span className="font-mono text-xs sm:text-sm font-bold text-amber-400">{estimate.id}</span>
            </div>
            <div className="mw-metric-card p-3.5">
              <span className="text-[11px] text-slate-400 block">Total Parts Cost</span>
              <span className="font-mono text-base sm:text-lg font-bold text-white">{inr(estimate.partsCost)}</span>
            </div>
            <div className="mw-metric-card p-3.5">
              <span className="text-[11px] text-slate-400 block">Total Labor Fitment</span>
              <span className="font-mono text-base sm:text-lg font-bold text-slate-200">{inr(estimate.laborCost)}</span>
            </div>
            <div className="mw-metric-card highlight p-3.5">
              <span className="text-[11px] text-emerald-400 font-semibold block">Net Grand Total</span>
              <span className="font-mono text-lg sm:text-xl font-black text-emerald-400">{inr(estimate.grandTotal)}</span>
            </div>
            <div className="mw-metric-card p-3.5">
              <span className="text-[11px] text-slate-400 block">Est. Ready By</span>
              <span className="font-mono text-xs sm:text-sm font-bold text-amber-300">{estimate.eta}</span>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="mw-card rounded-xl overflow-hidden border border-slate-800 shadow-xl">
            <div className="bg-slate-900/90 px-4 py-3 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span className="text-amber-400">📑</span> Itemized Diagnostic Estimate &amp; Spares Required
              </h3>

              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <span>Discount:</span>
                  <select
                    className="mw-input px-2 py-1 rounded text-xs"
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(Number(e.target.value))}
                  >
                    <option value="0">None (0%)</option>
                    <option value="5">Loyalty (5%)</option>
                    <option value="10">Festival (10%)</option>
                    <option value="15">Special (15%)</option>
                  </select>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <span>GST:</span>
                  <select
                    className="mw-input px-2 py-1 rounded text-xs"
                    value={gstPercent}
                    onChange={(e) => setGstPercent(Number(e.target.value))}
                  >
                    <option value="0">None (0%)</option>
                    <option value="5">GST 5%</option>
                    <option value="18">GST 18%</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-900 text-slate-400 font-mono text-[11px] uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Diagnosed Fault</th>
                    <th className="py-3 px-4">Recommended Spare Part</th>
                    <th className="py-3 px-4 text-right">Parts Cost</th>
                    <th className="py-3 px-4 text-right">Labor</th>
                    <th className="py-3 px-4 text-right">Subtotal</th>
                    <th className="py-3 px-4 text-right">Time &amp; Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {estimate.items.map((it) => (
                    <tr key={it.key} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${it.severity === "critical" ? "bg-red-400" : it.severity === "warning" ? "bg-amber-400" : "bg-emerald-400"}`}></span>
                          <div>
                            <p className="font-bold text-white text-xs sm:text-sm">{it.label}</p>
                            <p className="text-[10px] text-slate-400 font-mono">{it.category || "General"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-300 text-xs">{it.part}</td>
                      <td className="py-3 px-4 text-right font-mono text-white">{inr(it.partCost)}</td>
                      <td className="py-3 px-4 text-right font-mono text-slate-300">{inr(it.laborCost)}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-amber-400">
                        {inr(it.partCost + it.laborCost)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-400 text-xs">
                        <div className="flex items-center justify-end gap-2">
                          <span>{it.duration}m</span>
                          <button
                            onClick={() => removeItem(it.key)}
                            className="text-slate-500 hover:text-red-400 text-xs p-1"
                            title="Remove Item"
                          >
                            ✕
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-950 font-bold border-t-2 border-slate-800 text-xs sm:text-sm">
                  <tr>
                    <td colSpan={2} className="py-3 px-4 text-slate-300 font-mono">Summary Totals</td>
                    <td className="py-3 px-4 text-right font-mono text-white">{inr(estimate.partsCost)}</td>
                    <td className="py-3 px-4 text-right font-mono text-slate-300">{inr(estimate.laborCost)}</td>
                    <td className="py-3 px-4 text-right font-mono text-emerald-400 text-base font-black">{inr(estimate.grandTotal)}</td>
                    <td className="py-3 px-4 text-right font-mono text-slate-400">{estimate.duration}m</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Action Bar */}
          <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">📲</span>
              <div>
                <p className="text-xs font-bold text-white">Customer Communications &amp; Billing Suite</p>
                <p className="text-[11px] text-slate-400">Send WhatsApp estimates or generate dynamic UPI QR for instant GPay/PhonePe collection.</p>
              </div>
            </div>

            <button
              onClick={() => onOpenDispatch(estimate, customer)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow self-start sm:self-center"
            >
              <span>💬</span> WhatsApp &amp; Dynamic UPI QR
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
