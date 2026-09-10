/**
 * Customer Dispatch & Dynamic UPI QR Modal Component
 * Simple, Friendly Language
 */

import { generateWhatsappEstimateText, generateWhatsappTamilEstimateText, generateWhatsappReadyText, makeUpiQrUrl, makeUpiString, inr, sanitizePhone } from "../utils/helpers.js";
import { playClickSound, playSuccessChime } from "../utils/audio.js";

export class CustomerDispatchModal {
  constructor(modalId) {
    this.modal = document.getElementById(modalId);
    this.currentTemplate = "estimate"; // estimate | ready | tamil
    this.estimate = null;
    this.customer = null;
    this.render();
  }

  show(estimate, customer) {
    this.estimate = estimate;
    this.customer = customer;
    if (this.modal) {
      this.modal.classList.remove("hidden");
      playClickSound();
      this.render();
    }
  }

  open(estimate, customer) {
    this.show(estimate, customer);
  }

  hide() {
    if (this.modal) {
      this.modal.classList.add("hidden");
    }
  }

  close() {
    this.hide();
  }

  setTemplate(tpl) {
    this.currentTemplate = tpl;
    playClickSound();
    this.render();
  }

  getRenderedMessage() {
    if (!this.estimate || !this.customer) return "";
    if (this.currentTemplate === "ready") {
      return generateWhatsappReadyText(this.estimate, this.customer);
    }
    if (this.currentTemplate === "tamil") {
      return generateWhatsappTamilEstimateText(this.estimate, this.customer);
    }
    return generateWhatsappEstimateText(this.estimate, this.customer, this.estimate.discountPercent, this.estimate.gstPercent);
  }

  render() {
    if (!this.modal) return;
    if (!this.estimate || !this.customer) {
      this.modal.innerHTML = `
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75">
          <div class="mw-card p-6 rounded-2xl text-center bg-white dark:bg-slate-900">
            <p class="text-sm text-slate-700 dark:text-slate-300">No active bill selected.</p>
            <button id="btn-close-dispatch-empty" class="mw-btn-primary px-4 py-2 rounded-lg text-xs font-bold mt-4">Close</button>
          </div>
        </div>
      `;
      const btn = this.modal.querySelector("#btn-close-dispatch-empty");
      if (btn) btn.addEventListener("click", () => this.hide());
      return;
    }

    const qrUrl = makeUpiQrUrl(this.estimate.grandTotal, this.estimate.id, this.customer.name);
    const upiString = makeUpiString(this.estimate.grandTotal, this.estimate.id, this.customer.name);
    const message = this.getRenderedMessage();

    this.modal.innerHTML = `
      <div class="mw-modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
        <div class="mw-modal-card w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          
          <!-- Header -->
          <div class="bg-amber-600 text-white p-5 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-white/20 border border-white/40 flex items-center justify-center text-2xl">
                📲
              </div>
              <div>
                <h3 class="text-base sm:text-lg font-bold tracking-wide">
                  Send WhatsApp Bill &amp; Show UPI Payment QR
                </h3>
                <p class="text-xs text-amber-100 font-mono">
                  Bill No: ${this.estimate.id} · Total: ${inr(this.estimate.grandTotal)}
                </p>
              </div>
            </div>
            <button id="btn-close-dispatch" class="text-amber-100 hover:text-white text-2xl font-bold p-1">
              ✕
            </button>
          </div>

          <!-- Body Grid (WhatsApp Message + Dynamic UPI QR) -->
          <div class="p-5 grid grid-cols-1 md:grid-cols-2 gap-5 max-h-[75vh] overflow-y-auto">
            
            <!-- Column 1: WhatsApp Dispatch -->
            <div class="space-y-3 flex flex-col justify-between">
              <div>
                <!-- Template Switcher -->
                <div class="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 mb-3">
                  <button
                    data-tpl="estimate"
                    class="btn-tpl-switch flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${
                      this.currentTemplate === "estimate" ? "bg-amber-600 text-white shadow-sm" : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                    }"
                  >
                    1. 🧾 Easy Bill
                  </button>
                  <button
                    data-tpl="ready"
                    class="btn-tpl-switch flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${
                      this.currentTemplate === "ready" ? "bg-emerald-600 text-white shadow-sm" : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                    }"
                  >
                    2. 🛵 Ready
                  </button>
                  <button
                    data-tpl="tamil"
                    class="btn-tpl-switch flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${
                      this.currentTemplate === "tamil" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                    }"
                  >
                    3. 🌐 தமிழ்
                  </button>
                </div>

                <!-- Message Preview Box -->
                <div class="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-500/30 p-3.5 rounded-xl font-sans text-xs text-slate-800 dark:text-slate-200 whitespace-pre-line leading-relaxed max-h-[220px] overflow-y-auto select-all shadow-inner">
                  ${message}
                </div>
              </div>

              <!-- Dispatch button -->
              <button
                id="btn-send-whatsapp-now"
                class="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all"
              >
                <span>💬</span> Send Message to ${this.customer.phone}
              </button>
            </div>

            <!-- Column 2: Dynamic UPI QR -->
            <div class="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-between text-center space-y-3">
              <div>
                <span class="text-[11px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider block">
                  Scan &amp; Pay on Any UPI App
                </span>
                <p class="text-[11px] text-slate-500">Google Pay, PhonePe, Paytm, BHIM</p>
              </div>

              <!-- QR Image container -->
              <div class="p-3 bg-white rounded-xl shadow-md border-2 border-amber-500/50">
                <img
                  src="${qrUrl}"
                  alt="Dynamic UPI QR Code"
                  class="w-40 h-40 object-contain mx-auto"
                />
              </div>

              <div class="space-y-0.5">
                <p class="text-lg font-black font-mono text-emerald-700 dark:text-emerald-400">
                  ${inr(this.estimate.grandTotal)}
                </p>
                <p class="text-[10px] font-mono text-slate-500">
                  UPI ID: <span class="font-bold text-slate-700 dark:text-slate-300">quickmotogarage@upi</span>
                </p>
              </div>

              <div class="flex items-center gap-2 w-full pt-1">
                <a
                  href="${upiString}"
                  class="flex-1 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold py-2 rounded-lg transition-colors"
                >
                  Open in Phone UPI App
                </a>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="bg-slate-50 dark:bg-slate-950 p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <span class="text-xs text-slate-600 dark:text-slate-400 font-medium">
              Customer: <span class="text-slate-900 dark:text-white font-bold">${this.customer.name}</span> (${this.customer.phone})
            </span>
            <button id="btn-close-dispatch-footer" class="px-4 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900">
              Close
            </button>
          </div>
        </div>
      </div>
    `;

    this.attachEvents();
  }

  attachEvents() {
    const closeBtn = this.modal.querySelector("#btn-close-dispatch");
    const closeFooterBtn = this.modal.querySelector("#btn-close-dispatch-footer");
    const backdrop = this.modal.querySelector(".mw-modal-backdrop");

    [closeBtn, closeFooterBtn].forEach((b) => {
      if (b) b.addEventListener("click", () => this.hide());
    });

    if (backdrop) {
      backdrop.addEventListener("click", (e) => {
        if (e.target === backdrop) this.hide();
      });
    }

    const tplButtons = this.modal.querySelectorAll(".btn-tpl-switch");
    tplButtons.forEach((b) => {
      b.addEventListener("click", () => {
        const tpl = b.getAttribute("data-tpl");
        this.setTemplate(tpl);
      });
    });

    const sendBtn = this.modal.querySelector("#btn-send-whatsapp-now");
    if (sendBtn) {
      sendBtn.addEventListener("click", () => {
        playSuccessChime();
        const phone = sanitizePhone(this.customer.phone);
        const msg = this.getRenderedMessage();
        const url = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
        window.open(url, "_blank");
      });
    }
  }
}
