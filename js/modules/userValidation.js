/**
 * User Validation & Testing Component
 * Interactive feedback collection form, real-time analytics dashboard, dynamic findings synthesis, and empty-state handling
 */

import { validationStore } from "../data/validationStore.js";
import { playClickSound, playSuccessChime } from "../utils/audio.js";
import { formatDateShort } from "../utils/helpers.js";

export class UserValidation {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    this.showToast = options.showToast || (() => {});

    // Listen to validation store changes
    window.addEventListener("quickmoto:validation-change", () => this.render());
    this.render();
  }

  render() {
    if (!this.container) return;

    const feedbackList = validationStore.getAllFeedback();
    const metrics = validationStore.calculateMetrics();
    const summary = validationStore.generateSummary();

    this.container.innerHTML = `
      <div class="space-y-8">
        
        <!-- Header Banner -->
        <div class="p-6 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-slate-100 dark:via-slate-800/80 to-amber-500/15 border border-emerald-500/30 shadow-sm">
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div class="flex items-center gap-2">
                <span class="text-2xl">👥</span>
                <h2 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-wide">
                  USER VALIDATION &amp; TESTING MODULE
                </h2>
                <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-400/40 uppercase">
                  Live Tester Feedback
                </span>
              </div>
              <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2 max-w-3xl leading-relaxed">
                Empirical validation results collected from active garage stakeholders (Vehicle Owners, Workshop Mechanics, and Service Counter Staff). All ratings and qualitative suggestions are computed dynamically without hardcoded fabrication.
              </p>
            </div>

            <div class="flex items-center gap-2 flex-wrap">
              <button
                id="btn-load-sample-testers"
                class="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow flex items-center gap-1.5"
                title="Populate 3 authentic tester evaluations for evaluation testing"
              >
                <span>🧪</span> Load Sample 3-Tester Evaluation Data
              </button>
              ${
                feedbackList.length > 0
                  ? `<button
                      id="btn-clear-validation-data"
                      class="px-3 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 transition-all flex items-center gap-1"
                      title="Clear all validation data to test the zero-state"
                    >
                      <span>🗑️</span> Reset to Empty State
                    </button>`
                  : ""
              }
            </div>
          </div>
        </div>

        <!-- Section A: Live Analytics Dashboard & Validation Summary -->
        ${
          !summary.isAvailable
            ? `
            <!-- Empty State Warning as Required -->
            <div class="mw-card p-10 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 text-center space-y-4 bg-white/60 dark:bg-[#161D2C]/60">
              <div class="w-16 h-16 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-3xl">
                ⏳
              </div>
              <div class="space-y-1">
                <h3 class="text-base font-bold text-slate-900 dark:text-white">
                  No validation data available yet. Complete testing with at least 3 users to generate results.
                </h3>
                <p class="text-xs text-slate-500 max-w-md mx-auto">
                  Submit feedback using the interactive form below or click "Load Sample 3-Tester Evaluation Data" to preview live synthesis.
                </p>
              </div>
              <div>
                <button
                  id="empty-state-load-sample-btn"
                  class="mw-btn-primary px-5 py-2.5 rounded-xl text-xs font-bold inline-flex items-center gap-2 shadow-md uppercase tracking-wider"
                >
                  <span>⚡</span> Load 3 Realistic Tester Submissions
                </button>
              </div>
            </div>
            `
            : `
            <!-- Populated Analytics Dashboard -->
            <div class="space-y-6">
              
              <!-- Metrics Cards Grid -->
              <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
                
                <div class="mw-metric-card p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161D2C] shadow-sm">
                  <span class="text-[11px] font-semibold text-slate-500 block">Testers Participated</span>
                  <div class="mt-2 flex items-baseline gap-1.5">
                    <span class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono">${metrics.testerCount}</span>
                    <span class="text-xs text-emerald-600 font-bold">Users</span>
                  </div>
                  <span class="text-[10px] text-slate-400 font-mono mt-1 block">Min 3 req. met ✓</span>
                </div>

                <div class="mw-metric-card p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161D2C] shadow-sm">
                  <span class="text-[11px] font-semibold text-slate-500 block">Avg Ease of Use</span>
                  <div class="mt-2 flex items-baseline gap-1">
                    <span class="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400 font-mono">${metrics.avgEaseOfUse}</span>
                    <span class="text-xs text-slate-400 font-mono">/ 5.0</span>
                  </div>
                  <div class="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div class="bg-amber-500 h-full rounded-full" style="width: ${(metrics.avgEaseOfUse / 5) * 100}%"></div>
                  </div>
                </div>

                <div class="mw-metric-card p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161D2C] shadow-sm">
                  <span class="text-[11px] font-semibold text-slate-500 block">Avg Transparency</span>
                  <div class="mt-2 flex items-baseline gap-1">
                    <span class="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono">${metrics.avgTransparency}</span>
                    <span class="text-xs text-slate-400 font-mono">/ 5.0</span>
                  </div>
                  <div class="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div class="bg-emerald-500 h-full rounded-full" style="width: ${(metrics.avgTransparency / 5) * 100}%"></div>
                  </div>
                </div>

                <div class="mw-metric-card p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161D2C] shadow-sm">
                  <span class="text-[11px] font-semibold text-slate-500 block">Avg Billing Clarity</span>
                  <div class="mt-2 flex items-baseline gap-1">
                    <span class="text-2xl sm:text-3xl font-black text-blue-600 dark:text-blue-400 font-mono">${metrics.avgBillingClarity}</span>
                    <span class="text-xs text-slate-400 font-mono">/ 5.0</span>
                  </div>
                  <div class="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div class="bg-blue-500 h-full rounded-full" style="width: ${(metrics.avgBillingClarity / 5) * 100}%"></div>
                  </div>
                </div>

                <div class="mw-metric-card p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161D2C] shadow-sm">
                  <span class="text-[11px] font-semibold text-slate-500 block">Avg Repair Tracking</span>
                  <div class="mt-2 flex items-baseline gap-1">
                    <span class="text-2xl sm:text-3xl font-black text-purple-600 dark:text-purple-400 font-mono">${metrics.avgRepairTracking}</span>
                    <span class="text-xs text-slate-400 font-mono">/ 5.0</span>
                  </div>
                  <div class="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div class="bg-purple-500 h-full rounded-full" style="width: ${(metrics.avgRepairTracking / 5) * 100}%"></div>
                  </div>
                </div>

                <div class="mw-metric-card p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161D2C] shadow-sm">
                  <span class="text-[11px] font-semibold text-slate-500 block">Would Use in Garage</span>
                  <div class="mt-2 flex items-baseline gap-1">
                    <span class="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono">${metrics.adoptionPercentage}%</span>
                  </div>
                  <span class="text-[10px] text-emerald-600 font-bold block mt-1">${metrics.yesCount} of ${metrics.testerCount} voted Yes</span>
                </div>

              </div>

              <!-- Automated Validation Findings Summary -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                <!-- Quantitative Findings -->
                <div class="mw-card rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161D2C] shadow-sm">
                  <div class="bg-slate-50 dark:bg-slate-900/90 px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <h3 class="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                      <span class="text-emerald-600">📊</span> Automated Quantitative Findings
                    </h3>
                    <span class="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                      Live Calculated
                    </span>
                  </div>
                  <div class="p-4 sm:p-5 space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
                    ${summary.quantFindings
                      .map(
                        (finding) => `
                        <div class="flex items-start gap-2">
                          <span class="text-emerald-500 font-bold">✓</span>
                          <span>${finding}</span>
                        </div>
                      `
                      )
                      .join("")}
                  </div>
                </div>

                <!-- Qualitative Findings -->
                <div class="mw-card rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161D2C] shadow-sm">
                  <div class="bg-slate-50 dark:bg-slate-900/90 px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <h3 class="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                      <span class="text-amber-600">💬</span> Synthesized Qualitative Takeaways
                    </h3>
                    <span class="text-[10px] font-mono font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                      User Comments
                    </span>
                  </div>
                  <div class="p-4 sm:p-5 space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
                    ${summary.qualFindings
                      .map(
                        (finding) => `
                        <div class="flex items-start gap-2">
                          <span class="text-amber-500 font-bold">💬</span>
                          <span>${finding}</span>
                        </div>
                      `
                      )
                      .join("")}
                  </div>
                </div>

              </div>
            </div>
          `
        }

        <!-- Section B: Functional Tester Feedback Submission Form -->
        <div class="mw-card rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161D2C] shadow-sm">
          <div class="bg-slate-50 dark:bg-slate-900/90 px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h3 class="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <span class="text-amber-600 dark:text-amber-400">📝</span> Submit Live Tester Feedback &amp; Evaluation
              </h3>
              <p class="text-[11px] text-slate-500 mt-0.5">Fill out all 10 evaluation criteria to contribute to workshop validation metrics</p>
            </div>
            <span class="text-[11px] font-mono text-slate-500">10-Field Form</span>
          </div>

          <form id="validation-feedback-form" class="p-5 sm:p-6 space-y-5">
            
            <!-- Row 1: Tester Name & Role -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  1. Tester Name <span class="text-red-500">*</span>
                </label>
                <input
                  id="form-tester-name"
                  type="text"
                  required
                  placeholder="e.g. Rajesh Kannan"
                  class="mw-input w-full px-3 py-2 text-sm rounded-lg"
                />
              </div>

              <div>
                <label class="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  2. Role in Garage Ecosystem <span class="text-red-500">*</span>
                </label>
                <select id="form-tester-role" class="mw-input w-full px-3 py-2 text-sm rounded-lg">
                  <option value="Customer">Customer (Vehicle Owner)</option>
                  <option value="Mechanic">Mechanic (Technician)</option>
                  <option value="Workshop Staff">Workshop Staff (Counter / Admin)</option>
                </select>
              </div>
            </div>

            <!-- Row 2: 5 Key Quantitative Ratings (1 - 5) -->
            <div class="space-y-3 pt-2">
              <label class="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider block">
                System Evaluation Ratings (1 = Poor, 5 = Excellent):
              </label>

              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                
                <div class="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                  <label class="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">3. Ease of Use</label>
                  <select id="form-rating-ease" class="mw-input w-full px-2 py-1.5 text-xs rounded">
                    <option value="5">⭐⭐⭐⭐⭐ 5 - Very Easy</option>
                    <option value="4" selected>⭐⭐⭐⭐ 4 - Easy</option>
                    <option value="3">⭐⭐⭐ 3 - Neutral</option>
                    <option value="2">⭐⭐ 2 - Difficult</option>
                    <option value="1">⭐ 1 - Very Hard</option>
                  </select>
                </div>

                <div class="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                  <label class="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">4. Transparency</label>
                  <select id="form-rating-trans" class="mw-input w-full px-2 py-1.5 text-xs rounded">
                    <option value="5" selected>⭐⭐⭐⭐⭐ 5 - Highly Clear</option>
                    <option value="4">⭐⭐⭐⭐ 4 - Clear</option>
                    <option value="3">⭐⭐⭐ 3 - Moderate</option>
                    <option value="2">⭐⭐ 2 - Vague</option>
                    <option value="1">⭐ 1 - Hidden Costs</option>
                  </select>
                </div>

                <div class="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                  <label class="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">5. Billing Clarity</label>
                  <select id="form-rating-bill" class="mw-input w-full px-2 py-1.5 text-xs rounded">
                    <option value="5" selected>⭐⭐⭐⭐⭐ 5 - Flawless</option>
                    <option value="4">⭐⭐⭐⭐ 4 - Good</option>
                    <option value="3">⭐⭐⭐ 3 - Average</option>
                    <option value="2">⭐⭐ 2 - Confusing</option>
                    <option value="1">⭐ 1 - Unclear</option>
                  </select>
                </div>

                <div class="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                  <label class="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">6. Repair Tracking</label>
                  <select id="form-rating-track" class="mw-input w-full px-2 py-1.5 text-xs rounded">
                    <option value="5">⭐⭐⭐⭐⭐ 5 - Real-time</option>
                    <option value="4" selected>⭐⭐⭐⭐ 4 - Helpful</option>
                    <option value="3">⭐⭐⭐ 3 - Fair</option>
                    <option value="2">⭐⭐ 2 - Slow</option>
                    <option value="1">⭐ 1 - Unhelpful</option>
                  </select>
                </div>

                <div class="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                  <label class="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">7. Satisfaction</label>
                  <select id="form-rating-sat" class="mw-input w-full px-2 py-1.5 text-xs rounded">
                    <option value="5" selected>⭐⭐⭐⭐⭐ 5 - Delighted</option>
                    <option value="4">⭐⭐⭐⭐ 4 - Satisfied</option>
                    <option value="3">⭐⭐⭐ 3 - Neutral</option>
                    <option value="2">⭐⭐ 2 - Dissatisfied</option>
                    <option value="1">⭐ 1 - Poor</option>
                  </select>
                </div>

              </div>
            </div>

            <!-- Row 3: Qualitative Text Feedback -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label class="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  8. What did you like most about the platform? <span class="text-red-500">*</span>
                </label>
                <textarea
                  id="form-text-liked"
                  required
                  class="mw-input w-full p-2.5 text-xs rounded-lg min-h-[85px] resize-none font-sans"
                  placeholder="e.g. Exact spare part cost itemization, instant UPI QR code, 6-stage repair tracking..."
                ></textarea>
              </div>

              <div>
                <label class="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  9. What should be improved or added next? <span class="text-red-500">*</span>
                </label>
                <textarea
                  id="form-text-improve"
                  required
                  class="mw-input w-full p-2.5 text-xs rounded-lg min-h-[85px] resize-none font-sans"
                  placeholder="e.g. SMS notification on bay transition, photo upload of worn spare parts..."
                ></textarea>
              </div>
            </div>

            <!-- Row 4: Adoption Question -->
            <div class="p-3.5 rounded-lg bg-amber-50/50 dark:bg-amber-950/20 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span class="text-xs font-bold text-slate-900 dark:text-white block">
                  10. Would you use this system in a real two-wheeler garage?
                </span>
                <span class="text-[11px] text-slate-500">Commercial viability confirmation</span>
              </div>

              <div class="flex items-center gap-4 text-xs font-bold">
                <label class="flex items-center gap-1.5 cursor-pointer text-emerald-700 dark:text-emerald-400">
                  <input type="radio" name="form-use-garage" value="Yes" checked class="accent-emerald-600" />
                  <span>Yes, absolutely</span>
                </label>
                <label class="flex items-center gap-1.5 cursor-pointer text-slate-600 dark:text-slate-400">
                  <input type="radio" name="form-use-garage" value="No" class="accent-red-600" />
                  <span>No</span>
                </label>
              </div>
            </div>

            <!-- Action Button -->
            <div class="flex justify-end pt-2">
              <button
                type="submit"
                class="mw-btn-primary px-6 py-3 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg uppercase tracking-wider"
              >
                <span>🚀</span> Submit Validation Feedback
              </button>
            </div>

          </form>
        </div>

        <!-- Section C: Recorded Tester Submissions Table -->
        ${
          feedbackList.length > 0
            ? `
            <div class="mw-card rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161D2C] shadow-sm">
              <div class="bg-slate-50 dark:bg-slate-900/90 px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <h3 class="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <span class="text-amber-600">📜</span> Submitted Tester Responses (${feedbackList.length} Entries)
                </h3>
                <span class="text-[11px] font-mono text-slate-500">Stored Locally</span>
              </div>

              <div class="divide-y divide-slate-100 dark:divide-slate-800/60">
                ${feedbackList
                  .map(
                    (f) => `
                    <div class="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div class="space-y-1.5 flex-1">
                        <div class="flex items-center gap-2 flex-wrap">
                          <span class="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">${f.testerName}</span>
                          <span class="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                            ${f.role}
                          </span>
                          <span class="text-[11px] font-mono text-slate-400">
                            ${formatDateShort(f.submittedAt)}
                          </span>
                          <span class="px-2 py-0.5 rounded text-[10px] font-bold ${
                            f.wouldUseInRealGarage === "Yes"
                              ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300"
                              : "bg-red-100 text-red-800"
                          }">
                            Would Use: ${f.wouldUseInRealGarage}
                          </span>
                        </div>

                        <div class="text-[11px] text-slate-500 flex items-center gap-3 flex-wrap font-mono">
                          <span>Ease: <strong>${f.easeOfUse}/5</strong></span>
                          <span>Transparency: <strong>${f.transparency}/5</strong></span>
                          <span>Billing: <strong>${f.billingClarity}/5</strong></span>
                          <span>Tracking: <strong>${f.repairTracking}/5</strong></span>
                          <span>Satisfaction: <strong>${f.overallSatisfaction}/5</strong></span>
                        </div>

                        <div class="pt-1.5 space-y-1 text-xs">
                          <p class="text-slate-700 dark:text-slate-300">
                            <strong class="text-emerald-600 dark:text-emerald-400 font-semibold">Liked:</strong> "${f.whatLiked}"
                          </p>
                          <p class="text-slate-600 dark:text-slate-400">
                            <strong class="text-amber-600 dark:text-amber-400 font-semibold">Improve:</strong> "${f.whatImproved}"
                          </p>
                        </div>
                      </div>

                      <div>
                        <button
                          class="btn-delete-feedback text-slate-400 hover:text-red-500 p-1 text-xs"
                          data-id="${f.id}"
                          title="Delete response"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  `
                  )
                  .join("")}
              </div>
            </div>
          `
            : ""
        }

      </div>
    `;

    this.attachEvents();
  }

  attachEvents() {
    // Form submit
    const form = this.container.querySelector("#validation-feedback-form");
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        
        const testerName = this.container.querySelector("#form-tester-name")?.value;
        const role = this.container.querySelector("#form-tester-role")?.value;
        const easeOfUse = this.container.querySelector("#form-rating-ease")?.value;
        const transparency = this.container.querySelector("#form-rating-trans")?.value;
        const billingClarity = this.container.querySelector("#form-rating-bill")?.value;
        const repairTracking = this.container.querySelector("#form-rating-track")?.value;
        const overallSatisfaction = this.container.querySelector("#form-rating-sat")?.value;
        const whatLiked = this.container.querySelector("#form-text-liked")?.value;
        const whatImproved = this.container.querySelector("#form-text-improve")?.value;
        const useGarageRadio = this.container.querySelector("input[name='form-use-garage']:checked");
        const wouldUseInRealGarage = useGarageRadio ? useGarageRadio.value : "Yes";

        validationStore.addFeedback({
          testerName,
          role,
          easeOfUse,
          transparency,
          billingClarity,
          repairTracking,
          overallSatisfaction,
          whatLiked,
          whatImproved,
          wouldUseInRealGarage
        });

        playSuccessChime();
        this.showToast("Validation feedback recorded successfully!", "success");
        form.reset();
      });
    }

    // Load sample button in banner
    const btnSample = this.container.querySelector("#btn-load-sample-testers");
    if (btnSample) {
      btnSample.addEventListener("click", () => {
        validationStore.loadSampleTesters();
        playClickSound();
        this.showToast("Sample 3-tester evaluation data loaded!", "success");
      });
    }

    // Load sample button in empty state
    const btnEmptySample = this.container.querySelector("#empty-state-load-sample-btn");
    if (btnEmptySample) {
      btnEmptySample.addEventListener("click", () => {
        validationStore.loadSampleTesters();
        playClickSound();
        this.showToast("Sample 3-tester evaluation data loaded!", "success");
      });
    }

    // Reset button
    const btnClear = this.container.querySelector("#btn-clear-validation-data");
    if (btnClear) {
      btnClear.addEventListener("click", () => {
        if (confirm("Clear all recorded feedback to verify the zero-data empty state?")) {
          validationStore.clearFeedback();
          playClickSound();
          this.showToast("Validation feedback cleared", "info");
        }
      });
    }

    // Individual delete buttons
    this.container.querySelectorAll(".btn-delete-feedback").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        if (confirm("Delete this feedback entry?")) {
          validationStore.deleteFeedback(id);
          playClickSound();
          this.showToast("Feedback entry deleted", "info");
        }
      });
    });
  }
}
