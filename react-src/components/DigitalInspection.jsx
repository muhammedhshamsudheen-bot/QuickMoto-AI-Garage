import React, { useState } from "react";
import { INSPECTION_CATEGORIES } from "../data/inspectionPoints";
import { playClickSound, playSuccessChime } from "../utils/audio";

export default function DigitalInspection({ onAddIssuesToJobCard }) {
  const [categories, setCategories] = useState(INSPECTION_CATEGORIES);

  const setItemStatus = (catIdx, itemIdx, status) => {
    playClickSound();
    const updated = [...categories];
    updated[catIdx].items[itemIdx].defStatus = status;
    setCategories(updated);
  };

  let total = 0;
  let earned = 0;
  const attentionIssues = [];

  categories.forEach((cat) => {
    cat.items.forEach((it) => {
      total += 100;
      if (it.defStatus === "good") earned += 100;
      else if (it.defStatus === "attention") {
        earned += 50;
        attentionIssues.push(it);
      } else {
        attentionIssues.push(it);
      }
    });
  });

  const score = total > 0 ? Math.round((earned / total) * 100) : 100;

  const getGrade = (s) => {
    if (s >= 88) return { label: "Grade A (Fit & Safe)", color: "text-emerald-400" };
    if (s >= 72) return { label: "Grade B (Minor Wear)", color: "text-amber-400" };
    if (s >= 55) return { label: "Grade C (Attention Needed)", color: "text-orange-400" };
    return { label: "Grade D (Safety Critical)", color: "text-red-400" };
  };

  const grade = getGrade(score);

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="mw-card p-5 rounded-xl border border-slate-700/80 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-1.5 max-w-xl">
          <span className="mw-badge-glow px-2.5 py-0.5 rounded-full text-xs font-bold uppercase">
            🔍 21-Point Digital Vehicle Inspection (DVI)
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Two-Wheeler Health &amp; Roadworthiness Audit
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            Interactive multi-system health rating evaluating powertrain, brakes, electricals, chassis alignment, and tyres.
          </p>
        </div>

        {/* Score Gauge */}
        <div className="flex items-center gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800 shadow-inner">
          <div className="relative w-20 h-20 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-800"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className={`${score >= 80 ? "text-emerald-500" : score >= 65 ? "text-amber-500" : "text-red-500"} transition-all duration-500`}
                strokeDasharray={`${score}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-lg font-black text-white font-mono leading-none">{score}%</span>
              <span className="text-[9px] text-slate-400 uppercase font-semibold">Health</span>
            </div>
          </div>

          <div>
            <span className="text-[11px] text-slate-400 font-medium block">Overall Rating</span>
            <span className={`text-sm font-bold ${grade.color} block`}>{grade.label}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              ${attentionIssues.length} items flagged for review
            </span>
          </div>
        </div>
      </div>

      {/* Sync Bar */}
      {attentionIssues.length > 0 && (
        <div className="bg-amber-950/40 border border-amber-500/40 p-3.5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">⚠️</span>
            <div>
              <p className="text-xs font-bold text-amber-200">
                {attentionIssues.length} Inspection Issues Detected
              </p>
              <p className="text-[11px] text-amber-300/80">
                Quickly sync these flagged items directly into the AI Job Card.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              playSuccessChime();
              if (onAddIssuesToJobCard) onAddIssuesToJobCard(attentionIssues);
            }}
            className="mw-btn-primary px-3.5 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow"
          >
            <span>⚡</span> Add Flagged Items to Job Card
          </button>
        </div>
      )}

      {/* Categories */}
      <div className="space-y-4">
        {categories.map((cat, catIdx) => (
          <div key={cat.category} className="mw-card rounded-xl overflow-hidden border border-slate-800">
            <div className="bg-slate-900/90 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span className="text-amber-400">❖</span> {cat.category}
              </h3>
              <span className="text-xs text-slate-400 font-mono">
                {cat.items.filter((i) => i.defStatus === "good").length}/{cat.items.length} Passed
              </span>
            </div>

            <div className="divide-y divide-slate-800/60">
              {cat.items.map((it, itIdx) => (
                <div key={it.id} className="p-3 sm:px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 hover:bg-slate-900/40 transition-colors">
                  <div>
                    <p className="text-xs sm:text-sm font-semibold text-slate-200">{it.label}</p>
                    <p className="text-[11px] text-slate-400">{it.hint}</p>
                  </div>

                  <div className="flex items-center gap-1.5 self-start sm:self-center">
                    <button
                      onClick={() => setItemStatus(catIdx, itIdx, "good")}
                      className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1 transition-all ${
                        it.defStatus === "good" ? "bg-emerald-600 text-white shadow" : "bg-slate-800 text-slate-400 hover:text-white"
                      }`}
                    >
                      ✓ Pass
                    </button>
                    <button
                      onClick={() => setItemStatus(catIdx, itIdx, "attention")}
                      className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1 transition-all ${
                        it.defStatus === "attention" ? "bg-amber-600 text-white shadow" : "bg-slate-800 text-slate-400 hover:text-white"
                      }`}
                    >
                      ⚠️ Attention
                    </button>
                    <button
                      onClick={() => setItemStatus(catIdx, itIdx, "fail")}
                      className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1 transition-all ${
                        it.defStatus === "fail" ? "bg-red-600 text-white shadow" : "bg-slate-800 text-slate-400 hover:text-white"
                      }`}
                    >
                      ✕ Fail
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
