/**
 * 21-Point Full Bike Safety & Health Checkup Component
 * Simple, User-Friendly Wording
 */

import { INSPECTION_CATEGORIES } from "../data/inspectionPoints.js";
import { playClickSound, playSuccessChime } from "../utils/audio.js";

export class DigitalInspection {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    this.categories = JSON.parse(JSON.stringify(INSPECTION_CATEGORIES));
    this.onAddIssuesToJobCard = options.onAddIssuesToJobCard || (() => {});
    this.render();
  }

  setItemStatus(catIdx, itemIdx, status) {
    this.categories[catIdx].items[itemIdx].defStatus = status;
    playClickSound();
    this.render();
  }

  getOverallScore() {
    let total = 0;
    let earned = 0;
    this.categories.forEach((cat) => {
      cat.items.forEach((it) => {
        total += 100;
        if (it.defStatus === "good") earned += 100;
        else if (it.defStatus === "attention") earned += 50;
        else earned += 0;
      });
    });
    return total > 0 ? Math.round((earned / total) * 100) : 100;
  }

  getGrade(score) {
    if (score >= 88) return { label: "Grade A (Bike is Fit & Safe)", color: "text-emerald-700 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/60" };
    if (score >= 72) return { label: "Grade B (Minor Wear & Tear)", color: "text-amber-700 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950/60" };
    if (score >= 55) return { label: "Grade C (Needs Service & Care)", color: "text-orange-700 dark:text-orange-400", bg: "bg-orange-50 dark:bg-orange-950/60" };
    return { label: "Grade D (Safety Critical - Fix Now)", color: "text-red-700 dark:text-red-400", bg: "bg-red-50 dark:bg-red-950/60" };
  }

  getAttentionIssues() {
    const issues = [];
    this.categories.forEach((cat) => {
      cat.items.forEach((it) => {
        if (it.defStatus === "fail" || it.defStatus === "attention") {
          issues.push({
            name: it.label,
            status: it.defStatus,
            hint: it.hint,
            category: cat.category
          });
        }
      });
    });
    return issues;
  }

  render() {
    if (!this.container) return;
    const score = this.getOverallScore();
    const grade = this.getGrade(score);
    const attentionIssues = this.getAttentionIssues();

    this.container.innerHTML = `
      <div class="space-y-6">
        <!-- Inspection Health Banner -->
        <div class="mw-card p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-sm">
          <div class="space-y-1.5 max-w-xl">
            <span class="mw-badge-glow px-2.5 py-0.5 rounded-full text-xs font-bold uppercase">
              🔍 21-Point Full Bike Checkup
            </span>
            <h2 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Two-Wheeler Health &amp; Road Safety Check
            </h2>
            <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium">
              Simple 21-point checklist checking engine oil, front &amp; rear brakes, battery voltage, handlebar alignment, tyres, and drive chain.
            </p>
          </div>

          <!-- Score Gauge Card -->
          <div class="flex items-center gap-4 bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div class="relative w-20 h-20 flex items-center justify-center">
              <svg class="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  class="text-slate-200 dark:text-slate-800"
                  stroke-width="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  class="${score >= 80 ? "text-emerald-600 dark:text-emerald-500" : score >= 65 ? "text-amber-600 dark:text-amber-500" : "text-red-600 dark:text-red-500"} transition-all duration-500"
                  stroke-dasharray="${score}, 100"
                  stroke-width="3.5"
                  stroke-linecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div class="absolute flex flex-col items-center justify-center">
                <span class="text-lg font-black text-slate-900 dark:text-white font-mono leading-none">${score}%</span>
                <span class="text-[9px] text-slate-500 dark:text-slate-400 uppercase font-bold">Health</span>
              </div>
            </div>

            <div>
              <span class="text-[11px] text-slate-500 dark:text-slate-400 font-semibold block">Bike Condition</span>
              <span class="text-sm font-bold ${grade.color} block">${grade.label}</span>
              <span class="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5 font-medium">
                ${attentionIssues.length} items need attention
              </span>
            </div>
          </div>
        </div>

        <!-- Auto-Add to Diagnosis Action Bar -->
        ${attentionIssues.length > 0 ? `
          <div class="bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-500/40 p-3.5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
            <div class="flex items-center gap-2.5">
              <span class="text-2xl">⚠️</span>
              <div>
                <p class="text-xs font-bold text-amber-950 dark:text-amber-200">
                  ${attentionIssues.length} Bike Points Need Repair or Service
                </p>
                <p class="text-[11px] text-amber-800 dark:text-amber-300">
                  Click the button to add these problems directly into your bill estimate.
                </p>
              </div>
            </div>
            <button id="btn-sync-dvi-to-jobcard" class="mw-btn-primary px-4 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow whitespace-nowrap">
              <span>⚡</span> Add Problems to Bill Estimate
            </button>
          </div>
        ` : ""}

        <!-- Category Grids -->
        <div class="space-y-4">
          ${this.categories.map((cat, catIdx) => `
            <div class="mw-card rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161D2C]">
              <!-- Category Header -->
              <div class="bg-slate-50 dark:bg-slate-900/90 px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <h3 class="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span class="text-amber-600 dark:text-amber-400">❖</span> ${cat.category}
                </h3>
                <span class="text-xs text-slate-500 dark:text-slate-400 font-mono font-semibold">
                  ${cat.items.filter((i) => i.defStatus === "good").length}/${cat.items.length} Checked Safe
                </span>
              </div>

              <!-- Checklist items -->
              <div class="divide-y divide-slate-100 dark:divide-slate-800/60">
                ${cat.items.map((it, itIdx) => `
                  <div class="p-3 sm:px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                    <div>
                      <p class="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">${it.label}</p>
                      <p class="text-[11px] text-slate-500 dark:text-slate-400">${it.hint}</p>
                    </div>

                    <!-- 3-State Toggle Pill -->
                    <div class="flex items-center gap-1.5 self-start sm:self-center">
                      <button
                        data-cat="${catIdx}"
                        data-item="${itIdx}"
                        data-status="good"
                        class="dvi-toggle-btn px-2.5 py-1 rounded-md text-xs font-bold flex items-center gap-1 transition-all ${
                          it.defStatus === "good"
                            ? "bg-emerald-600 text-white shadow"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900"
                        }"
                      >
                        ✓ Safe / Good
                      </button>
                      <button
                        data-cat="${catIdx}"
                        data-item="${itIdx}"
                        data-status="attention"
                        class="dvi-toggle-btn px-2.5 py-1 rounded-md text-xs font-bold flex items-center gap-1 transition-all ${
                          it.defStatus === "attention"
                            ? "bg-amber-600 text-white shadow"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900"
                        }"
                      >
                        ⚠️ Check Needed
                      </button>
                      <button
                        data-cat="${catIdx}"
                        data-item="${itIdx}"
                        data-status="fail"
                        class="dvi-toggle-btn px-2.5 py-1 rounded-md text-xs font-bold flex items-center gap-1 transition-all ${
                          it.defStatus === "fail"
                            ? "bg-red-600 text-white shadow"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900"
                        }"
                      >
                        ✕ Problem / Bad
                      </button>
                    </div>
                  </div>
                `).join("")}
              </div>
            </div>
          `).join("")}
        </div>
      </div>
    `;

    this.attachEvents();
  }

  attachEvents() {
    const toggleButtons = this.container.querySelectorAll(".dvi-toggle-btn");
    toggleButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const catIdx = Number(btn.getAttribute("data-cat"));
        const itemIdx = Number(btn.getAttribute("data-item"));
        const status = btn.getAttribute("data-status");
        this.setItemStatus(catIdx, itemIdx, status);
      });
    });

    const syncBtn = this.container.querySelector("#btn-sync-dvi-to-jobcard");
    if (syncBtn) {
      syncBtn.addEventListener("click", () => {
        playSuccessChime();
        const flagged = this.getAttentionIssues();
        this.onAddIssuesToJobCard(flagged);
      });
    }
  }
}
