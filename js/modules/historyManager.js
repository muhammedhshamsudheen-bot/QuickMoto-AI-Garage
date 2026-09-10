/**
 * Job Card History & Customer Archive Component
 * Simple & Clear Language
 */

import { loadHistory, deleteHistoryItem, exportHistoryCsv, inr, formatDateShort } from "../utils/helpers.js";
import { playClickSound, playSuccessChime } from "../utils/audio.js";

export class HistoryManager {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    this.history = loadHistory();
    this.searchQuery = "";
    this.onLoadJobCard = options.onLoadJobCard || (() => {});
    this.render();
  }

  refresh() {
    this.history = loadHistory();
    this.render();
  }

  setSearchQuery(q) {
    this.searchQuery = q.toLowerCase();
    this.render();
  }

  getFilteredHistory() {
    if (!this.searchQuery) return this.history;
    const q = this.searchQuery;
    return this.history.filter((h) =>
      h.id.toLowerCase().includes(q) ||
      (h.customer?.name || "").toLowerCase().includes(q) ||
      (h.customer?.phone || "").toLowerCase().includes(q) ||
      (h.customer?.reg || "").toLowerCase().includes(q) ||
      (h.customer?.vehicle || "").toLowerCase().includes(q)
    );
  }

  render() {
    if (!this.container) return;
    const filtered = this.getFilteredHistory();

    this.container.innerHTML = `
      <div class="space-y-6">
        <!-- History Header -->
        <div class="mw-card p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
          <div class="space-y-1">
            <span class="mw-badge-glow px-2.5 py-0.5 rounded-full text-xs font-bold uppercase">
              📜 Past Bills Record
            </span>
            <h2 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Past Service Bills &amp; Customer History
            </h2>
            <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium">
              View, search, reopen, or download past bike service records and bills anytime.
            </p>
          </div>

          <div class="flex items-center gap-2">
            <button id="btn-export-csv" class="mw-btn-outline-amber px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-sm">
              📥 Download Excel / CSV File
            </button>
          </div>
        </div>

        <!-- Search input -->
        <div class="relative">
          <input
            id="history-search-input"
            type="text"
            class="mw-input w-full pl-10 pr-4 py-2.5 text-sm rounded-xl"
            placeholder="Search by Bill No. (EAM/JC...), Bike Number (TN 66...), Customer Name, or Phone..."
            value="${this.searchQuery}"
          />
          <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
        </div>

        <!-- History Table -->
        <div class="mw-card rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161D2C] shadow-sm">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs sm:text-sm">
              <thead class="bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-400 font-mono text-[11px] uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th class="py-3 px-4">Bill / Job ID</th>
                  <th class="py-3 px-4">Date</th>
                  <th class="py-3 px-4">Customer &amp; Phone</th>
                  <th class="py-3 px-4">Bike &amp; Number</th>
                  <th class="py-3 px-4 text-center">Items</th>
                  <th class="py-3 px-4 text-right">Bill Total</th>
                  <th class="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 dark:divide-slate-800/60">
                ${filtered.length === 0 ? `
                  <tr>
                    <td colspan="7" class="py-10 text-center text-slate-500 text-xs">
                      ${this.history.length === 0
                        ? "No past bills saved yet. Create a bill from Tab 1 to save your first record!"
                        : `No records matching "${this.searchQuery}".`}
                    </td>
                  </tr>
                ` : filtered.map((rec) => `
                  <tr class="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                    <td class="py-3 px-4 font-mono font-bold text-amber-700 dark:text-amber-400">
                      ${rec.id}
                    </td>
                    <td class="py-3 px-4 text-slate-500 text-xs font-mono">
                      ${rec.createdAt ? formatDateShort(rec.createdAt) : "Today"}
                    </td>
                    <td class="py-3 px-4">
                      <p class="font-bold text-slate-900 dark:text-white">${rec.customer?.name || "Customer"}</p>
                      <p class="text-[11px] font-mono text-slate-500">${rec.customer?.phone || ""}</p>
                    </td>
                    <td class="py-3 px-4">
                      <p class="text-slate-800 dark:text-slate-200 font-semibold">${rec.customer?.vehicle || ""}</p>
                      <p class="text-[11px] font-mono text-amber-700 dark:text-amber-400 font-bold uppercase">${rec.customer?.reg || ""}</p>
                    </td>
                    <td class="py-3 px-4 text-center font-mono text-slate-600 dark:text-slate-300 font-medium">
                      ${rec.items?.length || 1} tasks
                    </td>
                    <td class="py-3 px-4 text-right font-mono font-bold text-emerald-700 dark:text-emerald-400">
                      ${inr(rec.grandTotal)}
                    </td>
                    <td class="py-3 px-4 text-right">
                      <div class="flex items-center justify-end gap-1.5">
                        <button
                          data-load-id="${rec.id}"
                          class="btn-load-history-job px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white text-xs font-bold border border-slate-200 dark:border-slate-700"
                          title="Open this Bill in Editor"
                        >
                          📂 Open
                        </button>
                        <button
                          data-delete-id="${rec.id}"
                          class="btn-delete-history-job px-2 py-1.5 rounded-lg bg-red-100 dark:bg-red-950/60 hover:bg-red-200 dark:hover:bg-red-900 text-red-700 dark:text-red-400 text-xs font-bold"
                          title="Delete Record"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    this.attachEvents();
  }

  attachEvents() {
    const searchInput = this.container.querySelector("#history-search-input");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        this.setSearchQuery(e.target.value);
      });
    }

    const exportBtn = this.container.querySelector("#btn-export-csv");
    if (exportBtn) {
      exportBtn.addEventListener("click", () => {
        playSuccessChime();
        exportHistoryCsv(this.history);
      });
    }

    const loadButtons = this.container.querySelectorAll(".btn-load-history-job");
    loadButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-load-id");
        const record = this.history.find((h) => h.id === id);
        if (record) {
          playClickSound();
          this.onLoadJobCard(record);
        }
      });
    });

    const deleteButtons = this.container.querySelectorAll(".btn-delete-history-job");
    deleteButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-delete-id");
        if (confirm(`Delete bill record ${id}?`)) {
          this.history = deleteHistoryItem(id);
          this.render();
        }
      });
    });
  }
}
