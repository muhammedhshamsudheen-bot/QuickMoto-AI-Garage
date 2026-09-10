/**
 * Dynamic Billing & Invoice Manager Component
 * Connects directly to central jobCardStore for real-time recalculation, discounts, GST, UPI QR, and WhatsApp dispatch
 */

import { jobCardStore, STAGES } from "../data/jobCardStore.js";
import { inr, formatDateShort, makeUpiQrUrl, generateWhatsappEstimateText, sanitizePhone } from "../utils/helpers.js";
import { playClickSound, playSuccessChime } from "../utils/audio.js";
import { PrintManager } from "./printManager.js";

export class BillingManager {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    this.showToast = options.showToast || (() => {});
    this.printManager = new PrintManager();

    // Listen for state changes
    window.addEventListener("quickmoto:state-change", () => this.render());
    this.render();
  }

  render() {
    if (!this.container) return;

    const allJobs = jobCardStore.getAllJobs();
    const activeJob = jobCardStore.getActiveJob();

    if (!activeJob) {
      this.container.innerHTML = `
        <div class="mw-card p-10 text-center rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
          <span class="text-4xl">🧾</span>
          <h3 class="text-base font-bold text-slate-900 dark:text-white">No Active Job Selected</h3>
          <p class="text-xs text-slate-500">Please check in a customer or select a job from the dashboard.</p>
        </div>
      `;
      return;
    }

    const isPaid = activeJob.payment?.status === "Paid";
    const upiQrUrl = makeUpiQrUrl(activeJob.finalTotal, activeJob.id, activeJob.customer?.name);

    this.container.innerHTML = `
      <div class="space-y-6">
        
        <!-- Job Card Selector & Status Header -->
        <div class="mw-card p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161D2C] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center text-2xl">
              🧾
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h2 class="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                  BILLING &amp; INVOICE SETTLEMENT
                </h2>
                <span class="font-mono text-xs px-2.5 py-0.5 rounded-full font-bold bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-400/40">
                  ${activeJob.id}
                </span>
              </div>
              <p class="text-xs text-slate-500 mt-0.5">
                Dynamic automated invoice tied directly to central workshop repair state
              </p>
            </div>
          </div>

          <!-- Customer Job Switcher Dropdown -->
          <div class="flex items-center gap-2.5 flex-wrap">
            <span class="text-xs font-semibold text-slate-600 dark:text-slate-400">Select Job Card:</span>
            <select id="billing-job-switcher" class="mw-input px-3 py-1.5 text-xs font-mono font-bold rounded-lg max-w-xs">
              ${allJobs
                .map(
                  (j) => `
                <option value="${j.id}" ${j.id === activeJob.id ? "selected" : ""}>
                  ${j.id} — ${j.customer?.name} (${j.bike?.model})
                </option>
              `
                )
                .join("")}
            </select>
          </div>
        </div>

        <!-- Two Column Layout: Customer Profile & Itemized Invoice -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <!-- Column 1: Customer Profile & Repair Overview -->
          <div class="space-y-5">
            
            <!-- Customer & Bike Card -->
            <div class="mw-card rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161D2C] shadow-sm">
              <div class="bg-slate-50 dark:bg-slate-900/90 px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <h3 class="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <span>👤</span> Customer &amp; Vehicle
                </h3>
                <span class="text-[10px] font-mono text-emerald-600 font-bold">Verified</span>
              </div>

              <div class="p-4 space-y-3 text-xs">
                <div class="flex justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <span class="text-slate-500">Customer Name:</span>
                  <span class="font-bold text-slate-900 dark:text-white">${activeJob.customer?.name}</span>
                </div>
                <div class="flex justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <span class="text-slate-500">Phone Number:</span>
                  <span class="font-mono font-bold text-slate-800 dark:text-slate-200">${activeJob.customer?.phone}</span>
                </div>
                <div class="flex justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <span class="text-slate-500">Bike Model:</span>
                  <span class="font-bold text-slate-900 dark:text-white">${activeJob.bike?.model}</span>
                </div>
                <div class="flex justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <span class="text-slate-500">Reg Plate No:</span>
                  <span class="font-mono font-bold text-amber-700 dark:text-amber-400 uppercase">${activeJob.bike?.regNo}</span>
                </div>
                <div class="flex justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <span class="text-slate-500">Repair Status:</span>
                  <span class="font-bold text-emerald-600 dark:text-emerald-400">${activeJob.status}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-500">Assigned Mechanic:</span>
                  <span class="font-medium text-slate-700 dark:text-slate-300">${activeJob.assignedMechanic || "Selvam (Senior Tech)"}</span>
                </div>
              </div>
            </div>

            <!-- Dynamic UPI QR Card -->
            <div class="mw-card rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161D2C] shadow-sm text-center">
              <div class="bg-slate-50 dark:bg-slate-900/90 px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <h3 class="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <span>📱</span> Dynamic Counter UPI QR
                </h3>
                <span class="text-[10px] font-mono font-bold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded">
                  GPay / PhonePe
                </span>
              </div>

              <div class="p-5 flex flex-col items-center gap-3">
                <div class="p-2.5 bg-white rounded-xl border border-slate-200 shadow-inner">
                  <img src="${upiQrUrl}" alt="UPI QR" class="w-36 h-36 object-contain rounded" />
                </div>
                <div>
                  <div class="text-[11px] text-slate-500">Scan to pay exact bill total:</div>
                  <div class="text-xl font-black font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
                    ${inr(activeJob.finalTotal)}
                  </div>
                </div>

                <!-- Mark as Paid Button -->
                <button
                  id="btn-billing-mark-paid"
                  class="w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow ${
                    isPaid
                      ? "bg-emerald-600 text-white cursor-default"
                      : "bg-slate-900 hover:bg-black text-amber-400"
                  }"
                >
                  ${
                    isPaid
                      ? `<span>✅</span> Payment Settled (${activeJob.payment?.method || 'UPI'})`
                      : `<span>💳</span> Mark Bill as Paid (${inr(activeJob.finalTotal)})`
                  }
                </button>
              </div>
            </div>

          </div>

          <!-- Column 2 & 3: Itemized Billing Breakdown & Adjusters -->
          <div class="lg:col-span-2 space-y-5">
            
            <!-- Itemized Table Card -->
            <div class="mw-card rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161D2C] shadow-sm">
              <div class="bg-slate-50 dark:bg-slate-900/90 px-4 py-3.5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <h3 class="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <span>📑</span> Itemized Services &amp; Spare Parts Breakdown
                </h3>

                <!-- Discount & GST Adjusters -->
                <div class="flex items-center gap-2 flex-wrap text-xs">
                  <div class="flex items-center gap-1">
                    <span class="text-slate-500 font-semibold">Discount:</span>
                    <select id="billing-discount-select" class="mw-input px-2 py-1 text-xs rounded">
                      <option value="0" ${activeJob.discountPercent === 0 ? "selected" : ""}>0% (None)</option>
                      <option value="5" ${activeJob.discountPercent === 5 ? "selected" : ""}>5% (Regular)</option>
                      <option value="10" ${activeJob.discountPercent === 10 ? "selected" : ""}>10% (Festival)</option>
                      <option value="15" ${activeJob.discountPercent === 15 ? "selected" : ""}>15% (Special)</option>
                    </select>
                  </div>

                  <div class="flex items-center gap-1">
                    <span class="text-slate-500 font-semibold">GST Rate:</span>
                    <select id="billing-gst-select" class="mw-input px-2 py-1 text-xs rounded">
                      <option value="0" ${activeJob.taxPercent === 0 ? "selected" : ""}>0% (Nil)</option>
                      <option value="5" ${activeJob.taxPercent === 5 ? "selected" : ""}>5% (Two-Wheeler)</option>
                      <option value="18" ${activeJob.taxPercent === 18 ? "selected" : ""}>18% (Commercial)</option>
                    </select>
                  </div>
                </div>
              </div>

              <!-- Services & Spares Table -->
              <div class="overflow-x-auto">
                <table class="w-full text-left text-xs sm:text-sm">
                  <thead class="bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-400 font-mono text-[11px] uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th class="py-2.5 px-4">Item / Description</th>
                      <th class="py-2.5 px-4">Category / OEM Part No</th>
                      <th class="py-2.5 px-4 text-center">Qty / Time</th>
                      <th class="py-2.5 px-4 text-right">Part Cost</th>
                      <th class="py-2.5 px-4 text-right">Labour Fee</th>
                      <th class="py-2.5 px-4 text-right">Line Total</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100 dark:divide-slate-800/60">
                    
                    <!-- Labour Services -->
                    ${(activeJob.services || []).map((s) => `
                      <tr class="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                        <td class="py-2.5 px-4 font-semibold text-slate-900 dark:text-white">
                          🔧 ${s.label}
                        </td>
                        <td class="py-2.5 px-4 text-slate-500 font-mono text-xs">
                          ${s.category || 'Service'}
                        </td>
                        <td class="py-2.5 px-4 text-center text-slate-500 font-mono text-xs">
                          ${s.duration || 20}m
                        </td>
                        <td class="py-2.5 px-4 text-right font-mono text-slate-400">
                          -
                        </td>
                        <td class="py-2.5 px-4 text-right font-mono font-semibold text-slate-800 dark:text-slate-200">
                          ${inr(s.laborCost)}
                        </td>
                        <td class="py-2.5 px-4 text-right font-mono font-bold text-slate-900 dark:text-white">
                          ${inr(s.laborCost)}
                        </td>
                      </tr>
                    `).join("")}

                    <!-- Spare Parts -->
                    ${(activeJob.spareParts || []).map((p) => {
                      const lineTotal = (Number(p.partCost) || 0) * (Number(p.qty) || 1);
                      return `
                        <tr class="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                          <td class="py-2.5 px-4 font-semibold text-slate-900 dark:text-white">
                            📦 ${p.name}
                          </td>
                          <td class="py-2.5 px-4 text-slate-500 font-mono text-[11px]">
                            ${p.partNumber || 'OEM-GEN'}
                          </td>
                          <td class="py-2.5 px-4 text-center text-slate-700 dark:text-slate-300 font-mono text-xs font-bold">
                            ${p.qty || 1} unit
                          </td>
                          <td class="py-2.5 px-4 text-right font-mono font-semibold text-slate-800 dark:text-slate-200">
                            ${inr(p.partCost)}
                          </td>
                          <td class="py-2.5 px-4 text-right font-mono text-slate-400">
                            -
                          </td>
                          <td class="py-2.5 px-4 text-right font-mono font-bold text-slate-900 dark:text-white">
                            ${inr(lineTotal)}
                          </td>
                        </tr>
                      `;
                    }).join("")}

                    <!-- Additional Charges (if any) -->
                    ${activeJob.additionalTotal > 0 ? `
                      <tr class="bg-amber-50/30 dark:bg-amber-950/10">
                        <td class="py-2.5 px-4 font-semibold text-amber-800 dark:text-amber-300" colspan="3">
                          ⚙️ Shop Consumables, Degreaser &amp; Towing/Pickup Surcharges
                        </td>
                        <td class="py-2.5 px-4 text-right font-mono" colspan="3">
                          <span class="font-bold text-amber-800 dark:text-amber-300">${inr(activeJob.additionalTotal)}</span>
                        </td>
                      </tr>
                    ` : ""}

                  </tbody>
                  
                  <!-- Totals Summary Footer -->
                  <tfoot class="bg-slate-50 dark:bg-slate-950/80 font-mono border-t-2 border-slate-200 dark:border-slate-800 text-xs">
                    <tr>
                      <td colspan="3" class="py-2 px-4 text-slate-600 dark:text-slate-400 font-sans">Gross Subtotal (Labour + Spares + Consumables)</td>
                      <td class="py-2 px-4 text-right">${inr(activeJob.partsTotal)}</td>
                      <td class="py-2 px-4 text-right">${inr(activeJob.labourTotal)}</td>
                      <td class="py-2 px-4 text-right font-bold text-slate-900 dark:text-white">${inr(activeJob.subtotal)}</td>
                    </tr>

                    ${activeJob.discountAmount > 0 ? `
                      <tr class="text-emerald-700 dark:text-emerald-400 bg-emerald-50/40 dark:bg-emerald-950/20">
                        <td colspan="5" class="py-1.5 px-4 font-sans font-semibold">Loyalty / Special Discount (${activeJob.discountPercent}%)</td>
                        <td class="py-1.5 px-4 text-right font-bold">-${inr(activeJob.discountAmount)}</td>
                      </tr>
                    ` : ""}

                    ${activeJob.taxAmount > 0 ? `
                      <tr class="text-slate-700 dark:text-slate-300">
                        <td colspan="5" class="py-1.5 px-4 font-sans">Government GST (${activeJob.taxPercent}%)</td>
                        <td class="py-1.5 px-4 text-right font-bold">+${inr(activeJob.taxAmount)}</td>
                      </tr>
                    ` : ""}

                    <tr class="bg-amber-100/60 dark:bg-amber-950/40 text-slate-900 dark:text-white text-sm sm:text-base font-black">
                      <td colspan="4" class="py-3 px-4 font-sans uppercase">Final Payable Total Amount</td>
                      <td colspan="2" class="py-3 px-4 text-right text-emerald-700 dark:text-emerald-400 text-lg sm:text-xl font-mono font-black">
                        ${inr(activeJob.finalTotal)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            <!-- Print & Dispatch Action Bar -->
            <div class="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161D2C] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span class="text-xs font-bold text-slate-900 dark:text-white block">Invoice Dispatch &amp; Paper Output</span>
                <span class="text-[11px] text-slate-500">Direct WhatsApp messaging and POS thermal printing</span>
              </div>

              <div class="flex items-center gap-2 flex-wrap">
                <button
                  id="btn-billing-send-whatsapp"
                  class="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow"
                >
                  <span>💬</span> Send WhatsApp Bill
                </button>
                <button
                  id="btn-billing-print-a4"
                  class="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1"
                >
                  🖨️ Print A4 Invoice
                </button>
                <button
                  id="btn-billing-print-thermal"
                  class="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1"
                >
                  🧾 Thermal Slip
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>
    `;

    this.attachEvents(activeJob);
  }

  attachEvents(activeJob) {
    // Job switcher dropdown
    const switcher = this.container.querySelector("#billing-job-switcher");
    if (switcher) {
      switcher.addEventListener("change", (e) => {
        jobCardStore.setActiveJobId(e.target.value);
        playClickSound();
      });
    }

    // Discount change
    const discSelect = this.container.querySelector("#billing-discount-select");
    if (discSelect) {
      discSelect.addEventListener("change", (e) => {
        jobCardStore.updateJob(activeJob.id, { discountPercent: Number(e.target.value) });
        playClickSound();
        this.showToast(`Applied ${e.target.value}% discount`, "info");
      });
    }

    // GST change
    const gstSelect = this.container.querySelector("#billing-gst-select");
    if (gstSelect) {
      gstSelect.addEventListener("change", (e) => {
        jobCardStore.updateJob(activeJob.id, { taxPercent: Number(e.target.value) });
        playClickSound();
        this.showToast(`Updated tax to ${e.target.value}% GST`, "info");
      });
    }

    // Mark paid button
    const btnPaid = this.container.querySelector("#btn-billing-mark-paid");
    if (btnPaid) {
      btnPaid.addEventListener("click", () => {
        if (activeJob.payment?.status !== "Paid") {
          jobCardStore.updatePayment(activeJob.id, {
            status: "Paid",
            method: "UPI / Counter GPay"
          });
          playSuccessChime();
          this.showToast(`Payment of ${inr(activeJob.finalTotal)} verified & recorded!`, "success");
        }
      });
    }

    // WhatsApp dispatch
    const btnWa = this.container.querySelector("#btn-billing-send-whatsapp");
    if (btnWa) {
      btnWa.addEventListener("click", () => {
        const text = generateWhatsappEstimateText(
          activeJob,
          activeJob.customer,
          activeJob.discountPercent,
          activeJob.taxPercent
        );
        const phone = sanitizePhone(activeJob.customer?.phone || "9894312456");
        const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
        window.open(url, "_blank");
        this.showToast("WhatsApp estimate dispatched!", "success");
      });
    }

    // Print A4
    const btnPrintA4 = this.container.querySelector("#btn-billing-print-a4");
    if (btnPrintA4) {
      btnPrintA4.addEventListener("click", () => {
        this.printManager.printA4Invoice(
          activeJob,
          activeJob.customer,
          activeJob.discountPercent,
          activeJob.taxPercent
        );
      });
    }

    // Print Thermal
    const btnPrintThermal = this.container.querySelector("#btn-billing-print-thermal");
    if (btnPrintThermal) {
      btnPrintThermal.addEventListener("click", () => {
        this.printManager.printThermalReceipt(
          activeJob,
          activeJob.customer,
          activeJob.discountPercent,
          activeJob.taxPercent
        );
      });
    }
  }
}
