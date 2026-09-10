/**
 * Spares Inventory & Price Estimator Component
 * Simple, User-Friendly Wording
 */

import { SPARES_INVENTORY } from "../data/sparesInventory.js";
import { inr } from "../utils/helpers.js";
import { playClickSound, playSuccessChime } from "../utils/audio.js";

export class SparesManager {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    this.spares = SPARES_INVENTORY;
    this.searchQuery = "";
    this.selectedCategory = "all";
    this.onAddSpareToJobCard = options.onAddSpareToJobCard || (() => {});
    this.render();
  }

  setSearchQuery(q) {
    this.searchQuery = q.toLowerCase();
    this.render();
  }

  setCategory(cat) {
    this.selectedCategory = cat;
    playClickSound();
    this.render();
  }

  getFilteredSpares() {
    return this.spares.filter((sp) => {
      const matchesCat = this.selectedCategory === "all" || sp.category.toLowerCase().includes(this.selectedCategory.toLowerCase());
      if (!matchesCat) return false;
      if (!this.searchQuery) return true;
      const q = this.searchQuery;
      return (
        sp.name.toLowerCase().includes(q) ||
        sp.partNumber.toLowerCase().includes(q) ||
        sp.brand.toLowerCase().includes(q) ||
        sp.compatibility.toLowerCase().includes(q)
      );
    });
  }

  render() {
    if (!this.container) return;
    const filtered = this.getFilteredSpares();
    const categories = ["all", "Oils & Lubricants", "Braking", "Electricals", "Drive & Transmission", "Filters & Intake", "Suspension", "EV Specific"];

    this.container.innerHTML = `
      <div class="space-y-6">
        <!-- Spares Header -->
        <div class="mw-card p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
          <div class="space-y-1">
            <span class="mw-badge-glow px-2.5 py-0.5 rounded-full text-xs font-bold uppercase">
              📦 Spare Parts Catalog
            </span>
            <h2 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Genuine Bike Spare Parts &amp; Labor Price List
            </h2>
            <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium">
              Check prices for engine oils, brake pads, batteries, chains, spark plugs, and EV belts. You can add any item directly to your bill estimate.
            </p>
          </div>

          <div class="bg-slate-50 dark:bg-slate-950 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-right">
            <span class="text-xs text-slate-500 block font-medium">Available in Store</span>
            <span class="text-base font-bold text-amber-700 dark:text-amber-400 font-mono">${this.spares.length} Standard Parts</span>
          </div>
        </div>

        <!-- Search & Filter Controls -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div class="md:col-span-2 relative">
            <input
              id="spares-search-input"
              type="text"
              class="mw-input w-full pl-10 pr-4 py-2.5 text-sm rounded-xl"
              placeholder="Search part by name (Motul, Brake, Battery), part number, or bike model..."
              value="${this.searchQuery}"
            />
            <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
          </div>

          <div>
            <select id="spares-category-select" class="mw-input w-full px-3 py-2.5 text-xs sm:text-sm rounded-xl appearance-none font-medium">
              ${categories.map((c) => `
                <option value="${c}" ${this.selectedCategory === c ? "selected" : ""}>
                  ${c === "all" ? "📁 All Spare Parts" : `📁 ${c}`}
                </option>
              `).join("")}
            </select>
          </div>
        </div>

        <!-- Spares Table -->
        <div class="mw-card rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161D2C] shadow-sm">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs sm:text-sm">
              <thead class="bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-400 font-mono text-[11px] uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th class="py-3 px-4">Part Name &amp; Code</th>
                  <th class="py-3 px-4">Category &amp; Brand</th>
                  <th class="py-3 px-4">Fits Which Bikes?</th>
                  <th class="py-3 px-4 text-right">Part Price</th>
                  <th class="py-3 px-4 text-right">Labor Fee</th>
                  <th class="py-3 px-4 text-center">Stock</th>
                  <th class="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 dark:divide-slate-800/60">
                ${filtered.length === 0 ? `
                  <tr>
                    <td colspan="7" class="py-8 text-center text-slate-500 text-xs">
                      No spare parts found matching "${this.searchQuery}".
                    </td>
                  </tr>
                ` : filtered.map((sp) => `
                  <tr class="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                    <td class="py-3 px-4">
                      <p class="font-bold text-slate-900 dark:text-white leading-snug">${sp.name}</p>
                      <p class="text-[11px] font-mono text-amber-700 dark:text-amber-400 font-bold">${sp.partNumber}</p>
                    </td>
                    <td class="py-3 px-4">
                      <span class="text-slate-800 dark:text-slate-300 font-medium block">${sp.category}</span>
                      <span class="text-[10px] text-slate-500 font-mono">${sp.brand}</span>
                    </td>
                    <td class="py-3 px-4 text-slate-600 dark:text-slate-400 text-xs max-w-[200px]">
                      ${sp.compatibility}
                    </td>
                    <td class="py-3 px-4 text-right font-mono font-bold text-slate-900 dark:text-white">
                      ${inr(sp.price)}
                    </td>
                    <td class="py-3 px-4 text-right font-mono text-slate-600 dark:text-slate-400">
                      ${inr(sp.labor)}
                    </td>
                    <td class="py-3 px-4 text-center">
                      <span class="text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        sp.stock > 10 ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400" : "bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-400"
                      }">
                        ${sp.stock} in stock
                      </span>
                    </td>
                    <td class="py-3 px-4 text-right">
                      <button
                        data-part-id="${sp.id}"
                        class="btn-add-spare-to-job px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-1 ml-auto shadow-sm"
                      >
                        + Add to Bill
                      </button>
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
    const searchInput = this.container.querySelector("#spares-search-input");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        this.setSearchQuery(e.target.value);
      });
    }

    const catSelect = this.container.querySelector("#spares-category-select");
    if (catSelect) {
      catSelect.addEventListener("change", (e) => {
        this.setCategory(e.target.value);
      });
    }

    const addButtons = this.container.querySelectorAll(".btn-add-spare-to-job");
    addButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-part-id");
        const item = this.spares.find((s) => s.id === id);
        if (item) {
          playSuccessChime();
          this.onAddSpareToJobCard(item);
        }
      });
    });
  }
}
