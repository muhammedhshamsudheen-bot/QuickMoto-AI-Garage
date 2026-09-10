/**
 * 24x7 Emergency Roadside Assistance & SOS Modal Component
 * Simple & Clear Language
 */

import { generateWhatsappSosText } from "../utils/helpers.js";
import { playSosPulse } from "../utils/audio.js";

export class EmergencySOSModal {
  constructor(modalId) {
    this.modal = document.getElementById(modalId);
    this.sosData = {
      name: "Karthik Raja",
      phone: "9894312456",
      vehicle: "Honda Activa 6G",
      reg: "TN 66 BZ 4521",
      issueType: "24x7 Bike Towing Truck",
      locationName: "NH 83, Near Eachanari Toll Gate / L&T Bypass",
      notes: "Bike stopped suddenly on highway, need quick tow to workshop.",
      lat: 10.9324,
      lng: 76.9745
    };
    this.render();
  }

  render() {
    if (!this.modal) return;

    this.modal.innerHTML = `
      <div class="mw-modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
        <div class="mw-modal-card w-full max-w-xl bg-white dark:bg-slate-900 border border-red-300 dark:border-red-500/50 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          
          <!-- Header with Warning Pulse -->
          <div class="bg-gradient-to-r from-red-600 to-red-700 text-white p-5 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-white/20 border border-white/40 flex items-center justify-center text-xl animate-pulse">
                🚨
              </div>
              <div>
                <h3 class="text-lg font-bold tracking-wide">
                  24/7 Emergency Roadside Help (SOS)
                </h3>
                <p class="text-xs text-red-100 font-medium">
                  Instant message to Kovai South 24/7 Rescue Team
                </p>
              </div>
            </div>
            <button id="btn-close-sos" class="text-red-100 hover:text-white text-2xl font-bold p-1">
              ✕
            </button>
          </div>

          <!-- Body Form -->
          <div class="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
            
            <!-- Issue Type Selector -->
            <div>
              <label class="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-1.5">
                What is the emergency problem?
              </label>
              <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
                ${[
                  { id: "towing", label: "🚛 Bike Towing Truck", desc: "For highway breakdown or accident" },
                  { id: "puncture", label: "🛞 Tyre Puncture Help", desc: "Tubeless / Tube air & patch" },
                  { id: "fuel", label: "⛽ 2 Litres Petrol Delivery", desc: "Fuel tank empty on road" },
                  { id: "jumpstart", label: "⚡ Battery Jumpstart", desc: "Self start not working" },
                  { id: "chain", label: "⛓️ Chain Broken / Jammed", desc: "Drive chain lock & repair" },
                  { id: "ev_charge", label: "🔋 EV Emergency Charge", desc: "Ather / Ola battery boost" }
                ].map((item) => `
                  <button
                    type="button"
                    data-issue="${item.label}"
                    class="mw-sos-issue-btn p-3 rounded-xl border text-left transition-all ${
                      this.sosData.issueType === item.label
                        ? "border-red-500 bg-red-50 dark:bg-red-950/40 text-red-950 dark:text-white font-bold shadow"
                        : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:border-slate-300"
                    }"
                  >
                    <p class="text-xs font-bold leading-tight">${item.label}</p>
                    <p class="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">${item.desc}</p>
                  </button>
                `).join("")}
              </div>
            </div>

            <!-- Location -->
            <div class="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                  📍 Where are you standing now?
                </span>
                <span class="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded font-bold">
                  Eachanari / Pollachi NH
                </span>
              </div>
              <input
                id="sos-location-input"
                type="text"
                class="mw-input w-full text-xs sm:text-sm p-2.5 rounded-lg"
                placeholder="Enter nearest landmark, shop name, or highway milestone..."
                value="${this.sosData.locationName}"
              />
            </div>

            <!-- Details -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Your Name</label>
                <input
                  id="sos-name-input"
                  type="text"
                  class="mw-input w-full text-xs sm:text-sm p-2 rounded-lg"
                  value="${this.sosData.name}"
                />
              </div>
              <div>
                <label class="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Mobile Phone (for mechanic call)</label>
                <input
                  id="sos-phone-input"
                  type="tel"
                  class="mw-input w-full text-xs sm:text-sm p-2 rounded-lg font-mono"
                  value="${this.sosData.phone}"
                />
              </div>
              <div>
                <label class="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Bike Model</label>
                <input
                  id="sos-vehicle-input"
                  type="text"
                  class="mw-input w-full text-xs sm:text-sm p-2 rounded-lg"
                  value="${this.sosData.vehicle}"
                />
              </div>
              <div>
                <label class="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Bike Number (Reg No.)</label>
                <input
                  id="sos-reg-input"
                  type="text"
                  class="mw-input w-full text-xs sm:text-sm p-2 rounded-lg font-mono uppercase"
                  value="${this.sosData.reg}"
                />
              </div>
            </div>

            <!-- Notes -->
            <div>
              <label class="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Extra Details / Remarks</label>
              <textarea
                id="sos-notes-input"
                class="mw-input w-full text-xs p-2.5 rounded-lg min-h-[60px] resize-none"
                placeholder="e.g. Engine made loud noise and stopped, standing under flyover..."
              >${this.sosData.notes}</textarea>
            </div>

            <!-- Hotline Bar -->
            <div class="bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 p-3 rounded-xl flex items-center justify-between gap-2">
              <div class="text-xs">
                <p class="font-bold text-red-950 dark:text-red-200">24/7 Breakdown Control Room</p>
                <p class="text-[11px] text-red-700 dark:text-red-300 font-mono font-bold">+91 98422 99001 · +91 98943 12456</p>
              </div>
              <a
                href="tel:+919842299001"
                class="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3 py-2 rounded-lg shadow flex items-center gap-1"
              >
                📞 Call Directly
              </a>
            </div>
          </div>

          <!-- Footer -->
          <div class="bg-slate-50 dark:bg-slate-950 p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
            <button id="btn-cancel-sos" class="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">
              Cancel
            </button>
            <button
              id="btn-dispatch-sos-whatsapp"
              class="bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-lg transition-all"
            >
              <span>📲</span> Send SOS Message on WhatsApp
            </button>
          </div>
        </div>
      </div>
    `;

    this.attachEvents();
  }

  attachEvents() {
    const closeBtn = this.modal.querySelector("#btn-close-sos");
    const cancelBtn = this.modal.querySelector("#btn-cancel-sos");
    const backdrop = this.modal.querySelector(".mw-modal-backdrop");

    [closeBtn, cancelBtn].forEach((btn) => {
      if (btn) {
        btn.addEventListener("click", () => {
          this.modal.classList.add("hidden");
        });
      }
    });

    if (backdrop) {
      backdrop.addEventListener("click", (e) => {
        if (e.target === backdrop) this.modal.classList.add("hidden");
      });
    }

    const issueButtons = this.modal.querySelectorAll(".mw-sos-issue-btn");
    issueButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        this.sosData.issueType = btn.getAttribute("data-issue");
        playSosPulse();
        this.render();
      });
    });

    const nameInput = this.modal.querySelector("#sos-name-input");
    if (nameInput) {
      nameInput.addEventListener("input", (e) => { this.sosData.name = e.target.value; });
    }
    const phoneInput = this.modal.querySelector("#sos-phone-input");
    if (phoneInput) {
      phoneInput.addEventListener("input", (e) => { this.sosData.phone = e.target.value; });
    }
    const vehicleInput = this.modal.querySelector("#sos-vehicle-input");
    if (vehicleInput) {
      vehicleInput.addEventListener("input", (e) => { this.sosData.vehicle = e.target.value; });
    }
    const regInput = this.modal.querySelector("#sos-reg-input");
    if (regInput) {
      regInput.addEventListener("input", (e) => { this.sosData.reg = e.target.value; });
    }
    const locationInput = this.modal.querySelector("#sos-location-input");
    if (locationInput) {
      locationInput.addEventListener("input", (e) => { this.sosData.locationName = e.target.value; });
    }
    const notesInput = this.modal.querySelector("#sos-notes-input");
    if (notesInput) {
      notesInput.addEventListener("input", (e) => { this.sosData.notes = e.target.value; });
    }

    const dispatchBtn = this.modal.querySelector("#btn-dispatch-sos-whatsapp");
    if (dispatchBtn) {
      dispatchBtn.addEventListener("click", () => {
        playSosPulse();
        const text = generateWhatsappSosText(this.sosData);
        const phone = "919842299001";
        const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
        window.open(url, "_blank");
        this.modal.classList.add("hidden");
      });
    }
  }

  show() {
    if (this.modal) {
      this.modal.classList.remove("hidden");
      this.render();
      playSosPulse();
    }
  }

  open() {
    this.show();
  }

  close() {
    if (this.modal) {
      this.modal.classList.add("hidden");
    }
  }
}
