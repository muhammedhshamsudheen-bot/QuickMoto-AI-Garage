import React, { useState } from "react";
import { WORKSHOP_STAGES } from "../data/knowledgeBase";
import { inr } from "../utils/helpers";
import { playWrenchSound } from "../utils/audio";

export default function LiveBaysKanban({ activeEstimate }) {
  const [jobs, setJobs] = useState([
    {
      id: "EAM/JC/260902/4512",
      customerName: "Karthik Raja",
      vehicle: "Honda Activa 6G",
      reg: "TN 66 BZ 4521",
      stageId: "bay_in_progress",
      total: 1530,
      mechanic: "Selvam (Lead)",
      timeElapsed: "45m",
      itemsCount: 4
    },
    {
      id: "EAM/JC/260902/8821",
      customerName: "Vignesh S",
      vehicle: "RE Classic 350",
      reg: "TN 38 CX 8809",
      stageId: "spares_allocated",
      total: 2890,
      mechanic: "Ramu (RE Specialist)",
      timeElapsed: "20m",
      itemsCount: 5
    },
    {
      id: "EAM/JC/260902/1033",
      customerName: "Praveen Kumar",
      vehicle: "Ather 450X (EV)",
      reg: "TN 66 EV 0450",
      stageId: "quality_check",
      total: 850,
      mechanic: "Imran (EV Tech)",
      timeElapsed: "1h 10m",
      itemsCount: 3
    },
    {
      id: "EAM/JC/260902/7702",
      customerName: "Anand M",
      vehicle: "Bajaj Pulsar 150",
      reg: "TN 66 AB 9940",
      stageId: "ready_delivery",
      total: 1980,
      mechanic: "Karthik (Mechanic)",
      timeElapsed: "2h 15m",
      itemsCount: 4
    }
  ]);

  const moveJob = (jobId, dir) => {
    playWrenchSound();
    setJobs((prev) =>
      prev.map((j) => {
        if (j.id === jobId) {
          const cIdx = WORKSHOP_STAGES.findIndex((s) => s.id === j.stageId);
          const nIdx = cIdx + dir;
          if (nIdx >= 0 && nIdx < WORKSHOP_STAGES.length) {
            return { ...j, stageId: WORKSHOP_STAGES[nIdx].id };
          }
        }
        return j;
      })
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mw-card p-5 rounded-xl border border-slate-700/80 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="mw-badge-glow px-2.5 py-0.5 rounded-full text-xs font-bold uppercase">
            🛠️ Real-Time Workshop Floor
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Live Workshop Bays &amp; Workflow Kanban
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            Track vehicle progression from AI diagnosis through parts pulling, mechanic bay execution, road test, and delivery.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-950 px-3.5 py-2 rounded-lg border border-slate-800 text-center">
            <span className="text-xs text-slate-400 block">Active In Bays</span>
            <span className="text-base font-bold text-amber-400 font-mono">{jobs.length} Bikes</span>
          </div>
          <div className="bg-slate-950 px-3.5 py-2 rounded-lg border border-slate-800 text-center">
            <span className="text-xs text-slate-400 block">Bay Utilization</span>
            <span className="text-base font-bold text-emerald-400 font-mono">85%</span>
          </div>
        </div>
      </div>

      {/* Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5 overflow-x-auto pb-4">
        {WORKSHOP_STAGES.map((stage, stageIdx) => {
          const stageJobs = jobs.filter((j) => j.stageId === stage.id);
          return (
            <div key={stage.id} className="bg-slate-900/90 rounded-xl p-3 border border-slate-800 flex flex-col min-w-[240px]">
              <div className="flex items-center justify-between gap-1 pb-2.5 mb-2.5 border-b border-slate-800">
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${stageIdx === 2 ? "bg-amber-400 animate-pulse" : stageIdx === 4 ? "bg-emerald-400" : "bg-cyan-400"}`}></span>
                    {stage.label}
                  </h3>
                  <p className="text-[10px] text-slate-400">{stage.desc}</p>
                </div>
                <span className="text-xs font-mono font-bold bg-slate-800 text-amber-300 px-2 py-0.5 rounded-full">
                  {stageJobs.length}
                </span>
              </div>

              <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[60vh] pr-0.5">
                {stageJobs.length === 0 ? (
                  <div className="p-4 rounded-lg border border-dashed border-slate-800 text-center">
                    <p className="text-[11px] text-slate-500">No vehicles in this bay</p>
                  </div>
                ) : (
                  stageJobs.map((job) => (
                    <div key={job.id} className="p-3 rounded-lg bg-slate-950 border border-slate-800 hover:border-amber-500/50 transition-all shadow-md space-y-2">
                      <div className="flex items-start justify-between gap-1">
                        <div>
                          <span className="text-[10px] font-mono text-slate-400 block">{job.id}</span>
                          <h4 className="text-xs font-bold text-white leading-tight">{job.vehicle}</h4>
                          <p className="text-[11px] font-mono text-amber-400/90 font-semibold">{job.reg}</p>
                        </div>
                        <span className="text-xs font-bold text-white font-mono bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                          {inr(job.total)}
                        </span>
                      </div>

                      <div className="text-[10px] text-slate-400 space-y-0.5 pt-1 border-t border-slate-900">
                        <p className="flex items-center justify-between">
                          <span>👤 {job.customerName}</span>
                          <span>⏱️ {job.timeElapsed}</span>
                        </p>
                        <p className="text-slate-400 flex items-center justify-between">
                          <span>🔧 {job.mechanic}</span>
                          <span className="text-cyan-400 font-semibold">{job.itemsCount} tasks</span>
                        </p>
                      </div>

                      <div className="flex items-center justify-between gap-1 pt-1.5">
                        <button
                          onClick={() => moveJob(job.id, -1)}
                          disabled={stageIdx === 0}
                          className={`text-[10px] px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold ${stageIdx === 0 ? "invisible" : ""}`}
                        >
                          ◀ Prev
                        </button>
                        <button
                          onClick={() => moveJob(job.id, 1)}
                          disabled={stageIdx === WORKSHOP_STAGES.length - 1}
                          className={`text-[10px] px-2 py-1 rounded bg-amber-600 hover:bg-amber-500 text-white font-bold ${stageIdx === WORKSHOP_STAGES.length - 1 ? "invisible" : ""}`}
                        >
                          Advance ▶
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
