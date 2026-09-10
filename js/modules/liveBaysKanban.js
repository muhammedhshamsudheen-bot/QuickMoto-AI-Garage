/**
 * Live Workshop Bay Kanban & Repair Tracking Component
 * Connects directly to central jobCardStore with 6 canonical repair stages, live status transitions, search, and parts manager
 */

import { jobCardStore, STAGES } from "../data/jobCardStore.js";
import { inr } from "../utils/helpers.js";
import { playClickSound, playWrenchSound, playSuccessChime } from "../utils/audio.js";

export class LiveBaysKanban {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    this.onNavigate = options.onNavigate || (() => {});
    this.showToast = options.showToast || (() => {});
    this.selectedStatusFilter = "all";
    this.searchQuery = "";

    // Listen to central store updates
    window.addEventListener("quickmoto:state-change", () => this.render());
    this.render();
  }

  render() {
    if (!this.container) return;

    const allJobs = jobCardStore.getAllJobs();
    const filteredJobs = jobCardStore.filterJobs({
      query: this.searchQuery,
      status: this.selectedStatusFilter
    });

    this.container.innerHTML = `
      <div class="space-y-6">
        
        <!-- Top Controls & Filters Bar -->
        <div class="mw-card p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161D2C] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div class="flex items-center gap-2">
              <span class="text-2xl">🛠️</span>
              <h2 class="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                LIVE REPAIR TRACKING &amp; BAY STATUS
              </h2>
              <span class="text-[11px] font-mono px-2.5 py-0.5 rounded-full font-bold bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-400/40">
                6 Standard Stages
              </span>
            </div>
            <p class="text-xs text-slate-500 mt-0.5">
              Real-time workshop floor tracker. Update stages as bikes progress from Check-In to Quality Testing and Counter Delivery.
            </p>
          </div>

          <!-- Search & Filter Controls -->
          <div class="flex items-center gap-2 flex-wrap">
            <input
              id="kanban-search-input"
              type="text"
              value="${this.searchQuery}"
              placeholder="Search by customer, bike, reg..."
              class="mw-input px-3 py-1.5 text-xs rounded-lg w-48 sm:w-56"
            />

            <select id="kanban-status-filter" class="mw-input px-3 py-1.5 text-xs font-semibold rounded-lg">
              <option value="all" ${this.selectedStatusFilter === "all" ? "selected" : ""}>All Stages (${allJobs.length})</option>
              <option value="active" ${this.selectedStatusFilter === "active" ? "selected" : ""}>Active In Workshop (${allJobs.filter((j) => j.stageIndex < 5).length})</option>
              <option value="completed" ${this.selectedStatusFilter === "completed" ? "selected" : ""}>Completed (${allJobs.filter((j) => j.stageIndex === 5).length})</option>
              ${STAGES.map(
                (s, idx) => `
                <option value="${s.id}" ${this.selectedStatusFilter === s.id ? "selected" : ""}>
                  ${idx + 1}. ${s.label} (${allJobs.filter((j) => j.stageIndex === idx).length})
                </option>
              `
              ).join("")}
            </select>
          </div>
        </div>

        <!-- 6-Stage Kanban Board Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
          ${STAGES.map((stage, stageIdx) => {
            const stageJobs = allJobs.filter((j) => j.stageIndex === stageIdx);
            return this.renderStageColumn(stage, stageIdx, stageJobs);
          }).join("")}
        </div>

      </div>
    `;

    this.attachEvents();
  }

  renderStageColumn(stage, stageIdx, jobs) {
    const colorHeaderMap = {
      blue: "border-blue-500/30 bg-blue-500/10 text-blue-800 dark:text-blue-300",
      amber: "border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-300",
      orange: "border-orange-500/30 bg-orange-500/10 text-orange-800 dark:text-orange-300",
      purple: "border-purple-500/30 bg-purple-500/10 text-purple-800 dark:text-purple-300",
      emerald: "border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300",
      slate: "border-slate-500/30 bg-slate-500/10 text-slate-800 dark:text-slate-300"
    };

    const headerClass = colorHeaderMap[stage.color] || colorHeaderMap.blue;

    return `
      <div class="flex flex-col rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#121824] overflow-hidden min-h-[420px]">
        
        <!-- Column Header -->
        <div class="p-3 border-b border-slate-200 dark:border-slate-800 ${headerClass} flex items-center justify-between">
          <div class="space-y-0.5">
            <span class="text-[10px] font-mono font-bold uppercase tracking-wider block">STAGE ${stageIdx + 1}</span>
            <h4 class="text-xs font-black leading-tight">${stage.label}</h4>
          </div>
          <span class="w-6 h-6 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-mono font-bold text-xs">
            ${jobs.length}
          </span>
        </div>

        <!-- Cards List -->
        <div class="p-2.5 space-y-2.5 flex-1 overflow-y-auto max-h-[580px]">
          ${
            jobs.length === 0
              ? `
              <div class="py-12 text-center text-slate-400 dark:text-slate-600 text-xs italic">
                No bikes in ${stage.label}
              </div>
            `
              : jobs.map((job) => this.renderKanbanCard(job, stageIdx)).join("")
          }
        </div>
      </div>
    `;
  }

  renderKanbanCard(job, currentStageIdx) {
    const isPaid = job.payment?.status === "Paid";
    const canAdvance = currentStageIdx < STAGES.length - 1;
    const canRegress = currentStageIdx > 0;

    return `
      <div class="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161D2C] shadow-sm hover:shadow-md transition-all space-y-2.5">
        
        <!-- Card Header -->
        <div class="flex items-start justify-between gap-2">
          <div>
            <span class="font-mono text-[11px] font-bold text-amber-700 dark:text-amber-400 block">${job.id}</span>
            <h5 class="text-xs font-bold text-slate-900 dark:text-white mt-0.5">${job.customer?.name}</h5>
          </div>
          <span class="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase">
            ${job.bike?.regNo || 'TN --'}
          </span>
        </div>

        <!-- Vehicle & Issues Summary -->
        <div class="text-[11px] space-y-1">
          <div class="text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-1">
            <span>🛵</span> ${job.bike?.model}
          </div>
          <p class="text-slate-500 line-clamp-2 leading-relaxed">
            ${job.reportedProblem || "General Checkup & Service"}
          </p>
        </div>

        <!-- Meta info -->
        <div class="pt-1 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-500">
          <span>${job.assignedMechanic?.split(" ")[0] || "Selvam"}</span>
          <span class="font-bold text-slate-900 dark:text-white font-mono">${inr(job.finalTotal)}</span>
        </div>

        <!-- Stage Navigation Buttons -->
        <div class="pt-2 flex items-center justify-between gap-1.5 border-t border-slate-100 dark:border-slate-800/80">
          <button
            class="btn-stage-regress px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-bold disabled:opacity-30"
            data-id="${job.id}"
            data-target="${currentStageIdx - 1}"
            ${!canRegress ? "disabled" : ""}
            title="Move back to previous stage"
          >
            ← Back
          </button>

          <button
            class="btn-open-job-billing px-2 py-1 rounded bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold border border-emerald-500/30"
            data-id="${job.id}"
            title="Open job in Billing & Invoice"
          >
            💳 Bill
          </button>

          <button
            class="btn-stage-advance px-2.5 py-1 rounded bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-bold disabled:opacity-30 shadow-sm"
            data-id="${job.id}"
            data-target="${currentStageIdx + 1}"
            ${!canAdvance ? "disabled" : ""}
            title="Advance bike to next stage"
          >
            ${currentStageIdx === STAGES.length - 2 ? "Finish ✓" : "Next →"}
          </button>
        </div>

      </div>
    `;
  }

  attachEvents() {
    // Search input
    const searchInput = this.container.querySelector("#kanban-search-input");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        this.searchQuery = e.target.value.toLowerCase().trim();
        this.render();
      });
    }

    // Status filter
    const statusFilter = this.container.querySelector("#kanban-status-filter");
    if (statusFilter) {
      statusFilter.addEventListener("change", (e) => {
        this.selectedStatusFilter = e.target.value;
        playClickSound();
        this.render();
      });
    }

    // Advance buttons
    this.container.querySelectorAll(".btn-stage-advance").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        const target = Number(btn.getAttribute("data-target"));
        jobCardStore.updateStage(id, target);
        playWrenchSound();
        const stageLabel = STAGES[target]?.label || "Next Stage";
        this.showToast(`Job ${id} advanced to ${stageLabel}`, "success");
      });
    });

    // Regress buttons
    this.container.querySelectorAll(".btn-stage-regress").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        const target = Number(btn.getAttribute("data-target"));
        jobCardStore.updateStage(id, target);
        playClickSound();
        const stageLabel = STAGES[target]?.label || "Previous Stage";
        this.showToast(`Job ${id} moved back to ${stageLabel}`, "info");
      });
    });

    // Bill buttons
    this.container.querySelectorAll(".btn-open-job-billing").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        jobCardStore.setActiveJobId(id);
        playClickSound();
        this.onNavigate("billing");
      });
    });
  }
}
