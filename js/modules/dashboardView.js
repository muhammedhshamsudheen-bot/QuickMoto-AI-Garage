/**
 * Workshop Dashboard Overview Component
 * Displays live statistics, active job queue, workflow navigation, and quick management actions
 */

import { jobCardStore, STAGES } from "../data/jobCardStore.js";
import { inr, formatDateShort } from "../utils/helpers.js";
import { playClickSound } from "../utils/audio.js";

export class DashboardView {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    this.onNavigate = options.onNavigate || (() => {});
    this.onSelectJob = options.onSelectJob || (() => {});
    this.showToast = options.showToast || (() => {});

    // Listen to store updates
    window.addEventListener("quickmoto:state-change", () => this.render());
    this.render();
  }

  render() {
    if (!this.container) return;

    const stats = jobCardStore.getStats();
    const allJobs = jobCardStore.getAllJobs();
    const activeJobs = allJobs.filter((j) => j.stageIndex < 5);

    this.container.innerHTML = `
      <div class="space-y-6">
        
        <!-- Top KPI Metrics Banner -->
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          <div class="mw-metric-card p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161D2C] shadow-sm flex flex-col justify-between">
            <div class="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
              <span>Active In Bay</span>
              <span class="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 text-sm">🛠️</span>
            </div>
            <div class="mt-2 flex items-baseline gap-2">
              <span class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono">${stats.activeJobs}</span>
              <span class="text-[11px] text-amber-600 dark:text-amber-400 font-bold">Vehicles</span>
            </div>
            <div class="mt-1 text-[11px] text-slate-500 font-medium">Lifts occupied right now</div>
          </div>

          <div class="mw-metric-card p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161D2C] shadow-sm flex flex-col justify-between">
            <div class="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
              <span>Completed Today</span>
              <span class="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-sm">✅</span>
            </div>
            <div class="mt-2 flex items-baseline gap-2">
              <span class="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono">${stats.completedJobs}</span>
              <span class="text-[11px] text-emerald-600 font-bold">Ready/Delivered</span>
            </div>
            <div class="mt-1 text-[11px] text-slate-500 font-medium">Quality passed</div>
          </div>

          <div class="mw-metric-card p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161D2C] shadow-sm flex flex-col justify-between">
            <div class="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
              <span>Revenue Settled</span>
              <span class="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-sm">💳</span>
            </div>
            <div class="mt-2 flex items-baseline gap-2">
              <span class="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono">${inr(stats.totalRevenue)}</span>
            </div>
            <div class="mt-1 text-[11px] text-slate-500 font-medium">UPI, Cash & Card received</div>
          </div>

          <div class="mw-metric-card p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161D2C] shadow-sm flex flex-col justify-between">
            <div class="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
              <span>Pending Invoices</span>
              <span class="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 text-sm">⏳</span>
            </div>
            <div class="mt-2 flex items-baseline gap-2">
              <span class="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400 font-mono">${inr(stats.pendingRevenue)}</span>
            </div>
            <div class="mt-1 text-[11px] text-slate-500 font-medium">Due at delivery counter</div>
          </div>

          <div class="mw-metric-card p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161D2C] shadow-sm flex flex-col justify-between">
            <div class="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
              <span>Avg Turnaround</span>
              <span class="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 text-sm">⏱️</span>
            </div>
            <div class="mt-2 flex items-baseline gap-2">
              <span class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono">${stats.avgDuration}m</span>
              <span class="text-[11px] text-slate-500 font-bold">per job</span>
            </div>
            <div class="mt-1 text-[11px] text-slate-500 font-medium">AI diagnosis + repair</div>
          </div>
        </div>

        <!-- Connected Workflow Navigation Banner -->
        <div class="p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-slate-100 dark:via-slate-800/60 to-emerald-500/10 border border-amber-500/30 shadow-sm">
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-400/30 uppercase tracking-wider">
                ⚡ Connected End-to-End Workflow Pipeline
              </span>
              <h3 class="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-1.5">
                QuickMoto AI Garage Digital Lifecycle
              </h3>
              <p class="text-xs text-slate-600 dark:text-slate-400 mt-0.5 max-w-2xl">
                Every vehicle moves through synchronized stages: Customer Check-in → Live Repair Tracking → Parts/Labour Update → Transparent Billing → Dynamic UPI Invoice.
              </p>
            </div>

            <div class="flex items-center gap-2 flex-wrap">
              <button
                id="dash-btn-new-checkin"
                class="mw-btn-primary px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-md uppercase tracking-wider"
              >
                <span>➕</span> New Customer Check-In
              </button>
              <button
                id="dash-btn-reset-demo"
                class="px-3 py-2.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all flex items-center gap-1.5 shadow-sm"
                title="Reset workshop demo data to clean initial sample state"
              >
                <span>🔄</span> Reset Demo Data
              </button>
            </div>
          </div>

          <!-- Workflow Step Indicators -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700/60">
            <div class="cursor-pointer p-2.5 rounded-lg bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 hover:border-amber-400 transition-all" data-nav="diagnosis">
              <span class="text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400 block">STEP 1</span>
              <span class="text-xs font-bold text-slate-900 dark:text-white block mt-0.5">Customer Check-in</span>
              <span class="text-[11px] text-slate-500 block">Symptoms &amp; AI Estimator</span>
            </div>

            <div class="cursor-pointer p-2.5 rounded-lg bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 hover:border-amber-400 transition-all" data-nav="bays">
              <span class="text-[10px] font-mono font-bold text-cyan-600 dark:text-cyan-400 block">STEP 2</span>
              <span class="text-xs font-bold text-slate-900 dark:text-white block mt-0.5">Repair Tracking</span>
              <span class="text-[11px] text-slate-500 block">6-Stage Live Bay Status</span>
            </div>

            <div class="cursor-pointer p-2.5 rounded-lg bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 hover:border-amber-400 transition-all" data-nav="billing">
              <span class="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 block">STEP 3</span>
              <span class="text-xs font-bold text-slate-900 dark:text-white block mt-0.5">Dynamic Billing</span>
              <span class="text-[11px] text-slate-500 block">Labour + Spares + Tax</span>
            </div>

            <div class="cursor-pointer p-2.5 rounded-lg bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 hover:border-amber-400 transition-all" data-nav="billing">
              <span class="text-[10px] font-mono font-bold text-purple-600 dark:text-purple-400 block">STEP 4</span>
              <span class="text-xs font-bold text-slate-900 dark:text-white block mt-0.5">UPI Settlement</span>
              <span class="text-[11px] text-slate-500 block">GPay QR &amp; WhatsApp Bill</span>
            </div>
          </div>
        </div>

        <!-- Live Garage Jobs Table -->
        <div class="mw-card rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161D2C] shadow-sm">
          <div class="bg-slate-50 dark:bg-slate-900/90 px-4 py-3.5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div class="flex items-center gap-2">
              <span class="text-amber-600 dark:text-amber-400">📋</span>
              <h3 class="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Live Workshop Job Cards (${allJobs.length} Registered)
              </h3>
            </div>

            <div class="flex items-center gap-2">
              <input
                id="dash-search-input"
                type="text"
                placeholder="Search job, name, reg no..."
                class="mw-input px-3 py-1.5 text-xs rounded-lg w-48 sm:w-64"
              />
            </div>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs sm:text-sm">
              <thead class="bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-400 font-mono text-[11px] uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th class="py-3 px-4">Job ID</th>
                  <th class="py-3 px-4">Customer &amp; Phone</th>
                  <th class="py-3 px-4">Vehicle &amp; Reg</th>
                  <th class="py-3 px-4">Repair Status</th>
                  <th class="py-3 px-4">Assigned Mechanic</th>
                  <th class="py-3 px-4 text-right">Bill Amount</th>
                  <th class="py-3 px-4 text-center">Payment</th>
                  <th class="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody id="dash-jobs-tbody" class="divide-y divide-slate-100 dark:divide-slate-800/60">
                ${allJobs.map((job) => this.renderJobRow(job)).join("")}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    `;

    this.attachEvents();
  }

  renderJobRow(job) {
    const stageObj = STAGES[job.stageIndex] || STAGES[0];
    const isPaid = job.payment?.status === "Paid";

    const badgeColorMap = {
      blue: "bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-500/30",
      amber: "bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-500/30",
      orange: "bg-orange-100 dark:bg-orange-500/20 text-orange-800 dark:text-orange-300 border-orange-300 dark:border-orange-500/30",
      purple: "bg-purple-100 dark:bg-purple-500/20 text-purple-800 dark:text-purple-300 border-purple-300 dark:border-purple-500/30",
      emerald: "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/30",
      slate: "bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-600"
    };

    const badgeClass = badgeColorMap[stageObj.color] || badgeColorMap.blue;

    return `
      <tr class="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
        <td class="py-3 px-4 font-mono font-bold text-xs text-amber-700 dark:text-amber-400 whitespace-nowrap">
          ${job.id}
        </td>
        <td class="py-3 px-4">
          <div class="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">${job.customer?.name || "Customer"}</div>
          <div class="text-[11px] text-slate-500 font-mono">${job.customer?.phone || ""}</div>
        </td>
        <td class="py-3 px-4">
          <div class="font-semibold text-slate-800 dark:text-slate-200 text-xs">${job.bike?.model || "Two-Wheeler"}</div>
          <div class="text-[11px] text-slate-500 font-mono uppercase">${job.bike?.regNo || "TN --"}</div>
        </td>
        <td class="py-3 px-4">
          <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold border ${badgeClass} whitespace-nowrap">
            <span class="w-1.5 h-1.5 rounded-full ${stageObj.color === 'emerald' ? 'bg-emerald-500' : 'bg-amber-500'}"></span>
            ${job.status}
          </span>
        </td>
        <td class="py-3 px-4 text-xs text-slate-600 dark:text-slate-400">
          <div>${job.assignedMechanic || "Selvam"}</div>
          <div class="text-[10px] text-slate-400 font-mono">${job.bay || "Bay 1"}</div>
        </td>
        <td class="py-3 px-4 text-right font-mono font-black text-slate-900 dark:text-white text-xs sm:text-sm">
          ${inr(job.finalTotal)}
        </td>
        <td class="py-3 px-4 text-center">
          ${
            isPaid
              ? `<span class="inline-block px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/40">PAID (${job.payment.method || 'UPI'})</span>`
              : `<span class="inline-block px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500/40">PENDING</span>`
          }
        </td>
        <td class="py-3 px-4 text-center">
          <div class="flex items-center justify-center gap-1.5">
            <button
              class="dash-action-track px-2 py-1 bg-cyan-600 hover:bg-cyan-700 text-white rounded text-[11px] font-bold shadow-sm"
              data-id="${job.id}"
              title="View in Repair Tracking"
            >
              🛠️ Track
            </button>
            <button
              class="dash-action-bill px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-bold shadow-sm"
              data-id="${job.id}"
              title="Open in Billing & Payment"
            >
              💳 Bill
            </button>
            <button
              class="dash-action-delete p-1 text-slate-400 hover:text-red-500 transition-colors"
              data-id="${job.id}"
              title="Delete Record"
            >
              🗑️
            </button>
          </div>
        </td>
      </tr>
    `;
  }

  attachEvents() {
    // New check-in button
    const btnNew = this.container.querySelector("#dash-btn-new-checkin");
    if (btnNew) {
      btnNew.addEventListener("click", () => {
        playClickSound();
        this.onNavigate("diagnosis");
      });
    }

    // Reset demo button
    const btnReset = this.container.querySelector("#dash-btn-reset-demo");
    if (btnReset) {
      btnReset.addEventListener("click", () => {
        if (confirm("Reset workshop database to standard default demo job cards? (Custom additions will be reset)")) {
          jobCardStore.resetDemoData();
          playClickSound();
          this.showToast("Demo data successfully restored!", "success");
        }
      });
    }

    // Workflow indicator clicks
    this.container.querySelectorAll("[data-nav]").forEach((el) => {
      el.addEventListener("click", () => {
        const tab = el.getAttribute("data-nav");
        playClickSound();
        this.onNavigate(tab);
      });
    });

    // Track button
    this.container.querySelectorAll(".dash-action-track").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        jobCardStore.setActiveJobId(id);
        playClickSound();
        this.onNavigate("bays");
      });
    });

    // Bill button
    this.container.querySelectorAll(".dash-action-bill").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        jobCardStore.setActiveJobId(id);
        playClickSound();
        this.onNavigate("billing");
      });
    });

    // Delete button
    this.container.querySelectorAll(".dash-action-delete").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        if (confirm(`Delete Job Card ${id} permanently?`)) {
          jobCardStore.deleteJob(id);
          playClickSound();
          this.showToast(`Job Card ${id} deleted`, "info");
        }
      });
    });

    // Live search input
    const searchInput = this.container.querySelector("#dash-search-input");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        const query = e.target.value.toLowerCase().trim();
        const filtered = jobCardStore.filterJobs({ query });
        const tbody = this.container.querySelector("#dash-jobs-tbody");
        if (tbody) {
          if (filtered.length === 0) {
            tbody.innerHTML = `
              <tr>
                <td colspan="8" class="py-8 text-center text-slate-500 font-medium">
                  No matching service records found for "${query}".
                </td>
              </tr>
            `;
          } else {
            tbody.innerHTML = filtered.map((job) => this.renderJobRow(job)).join("");
            this.attachTableActions();
          }
        }
      });
    }
  }

  attachTableActions() {
    this.container.querySelectorAll(".dash-action-track").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        jobCardStore.setActiveJobId(id);
        playClickSound();
        this.onNavigate("bays");
      });
    });

    this.container.querySelectorAll(".dash-action-bill").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        jobCardStore.setActiveJobId(id);
        playClickSound();
        this.onNavigate("billing");
      });
    });

    this.container.querySelectorAll(".dash-action-delete").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        if (confirm(`Delete Job Card ${id} permanently?`)) {
          jobCardStore.deleteJob(id);
          playClickSound();
          this.showToast(`Job Card ${id} deleted`, "info");
        }
      });
    });
  }
}
