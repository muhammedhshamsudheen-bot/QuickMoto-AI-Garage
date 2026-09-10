/**
 * Doorstep Bike Pickup & Drop Modal
 * QuickMoto AI Garage
 */

import { sanitizePhone } from "../utils/helpers.js";
import { playClickSound, playSuccessChime } from "../utils/audio.js";

export class PickupDropModal {
  constructor(modalId) {
    this.modal = document.getElementById(modalId);
    this.pickupData = {
      name: "Karthik Raja",
      phone: "9894312456",
      vehicle: "Honda Activa 6G",
      reg: "TN 66 BZ 4521",
      slot: "Morning (09:00 AM – 11:30 AM)",
      address: "No. 42, Pollachi Main Road, Near Eachanari Vinayagar Temple, Coimbatore - 641021",
      serviceNeed: "Full Periodic Service + Brake Inspection",
      requiresDrop: true
    };
    this.isBooked = false;
    this.render();
  }

  show(customer = null) {
    if (customer) {
      if (customer.name) this.pickupData.name = customer.name;
      if (customer.phone) this.pickupData.phone = customer.phone;
      if (customer.vehicle) this.pickupData.vehicle = customer.vehicle;
      if (customer.reg) this.pickupData.reg = customer.reg;
    }
    this.isBooked = false;
    if (this.modal) {
      this.modal.classList.remove("hidden");
      playClickSound();
      this.render();
    }
  }

  open(customer = null) {
    this.show(customer);
  }

  hide() {
    if (this.modal) {
      this.modal.classList.add("hidden");
    }
  }

  close() {
    this.hide();
  }

  generateWhatsappBookingText() {
    return [
      `🛵 *DOORSTEP BIKE PICKUP REQUEST — QUICKMOTO AI GARAGE*`,
      `━━━━━━━━━━━━━━━━━━━━`,
      `👤 *Customer:* ${this.pickupData.name} (📞 ${this.pickupData.phone})`,
      `🛵 *Vehicle:* ${this.pickupData.vehicle} (${this.pickupData.reg})`,
      `⏰ *Preferred Slot:* ${this.pickupData.slot}`,
      `📍 *Pickup Address:* ${this.pickupData.address}`,
      `🛠️ *Service Required:* ${this.pickupData.serviceNeed}`,
      `🔄 *Drop Service:* ${this.pickupData.requiresDrop ? "Yes, Doorstep Return Drop Needed" : "No, Will Collect at Workshop"}`,
      `━━━━━━━━━━━━━━━━━━━━`,
      `Please confirm driver dispatch for my two-wheeler pickup!`
    ].join("\n");
  }

  render() {
    if (!this.modal) return;

    if (this.isBooked) {
      this.modal.innerHTML = `
        <div class="mw-modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div class="mw-modal-card w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 text-center space-y-4 shadow-2xl">
            <div class="w-16 h-16 rounded-2xl bg-emerald-500/20 border-2 border-emerald-500/40 text-emerald-500 mx-auto flex items-center justify-center text-3xl animate-bounce">
              🛵
            </div>
            <h3 class="text-xl font-black text-slate-900 dark:text-white font-heading">
              Doorstep Pickup Booked!
            </h3>
            <p class="text-xs text-slate-600 dark:text-slate-300">
              Our verified pickup driver will arrive at your address during the slot: <br/>
              <strong class="text-amber-600 dark:text-amber-400 font-mono">${this.pickupData.slot}</strong>
            </p>
            <div class="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-left space-y-1">
              <p><span class="text-slate-400">Driver:</span> <strong>Ramesh K. (QuickMoto Fleet ID #12)</strong></p>
              <p><span class="text-slate-400">Vehicle:</span> <strong>${this.pickupData.vehicle} (${this.pickupData.reg})</strong></p>
              <p><span class="text-slate-400">Address:</span> <strong>${this.pickupData.address}</strong></p>
            </div>
            <div class="flex items-center gap-2 pt-2">
              <button id="btn-close-pickup-success" class="flex-1 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200">
                Close
              </button>
              <button id="btn-wa-pickup-confirm" class="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white flex items-center justify-center gap-1 shadow">
                <span>💬</span> WhatsApp Summary
              </button>
            </div>
          </div>
        </div>
      `;
      this.attachSuccessEvents();
      return;
    }

    this.modal.innerHTML = `
      <div class="mw-modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
        <div class="mw-modal-card w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
          
          <!-- Header -->
          <div class="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-white p-5 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-white/20 border border-white/40 flex items-center justify-center text-2xl">
                🛵
              </div>
              <div>
                <h3 class="text-base sm:text-lg font-bold tracking-wide font-heading">
                  Book Doorstep Bike Pickup &amp; Drop
                </h3>
                <p class="text-xs text-amber-100">
                  Free pickup &amp; return in Coimbatore &amp; Eachanari Area
                </p>
              </div>
            </div>
            <button id="btn-close-pickup" class="text-white hover:text-amber-100 text-2xl font-bold p-1">
              ✕
            </button>
          </div>

          <!-- Body -->
          <div class="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
            
            <!-- Time Slot Selector -->
            <div>
              <label class="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                📅 Select Convenient Time Slot
              </label>
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  data-slot="Morning (09:00 AM – 11:30 AM)"
                  class="pickup-slot-btn py-2.5 px-3 rounded-xl border text-xs font-bold text-left transition-all ${
                    this.pickupData.slot.includes("Morning")
                      ? "bg-amber-500 text-white border-amber-600 shadow"
                      : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
                  }"
                >
                  🌅 Morning<br/><span class="text-[10px] font-normal opacity-90">9:00 - 11:30 AM</span>
                </button>
                <button
                  type="button"
                  data-slot="Afternoon (02:00 PM – 04:30 PM)"
                  class="pickup-slot-btn py-2.5 px-3 rounded-xl border text-xs font-bold text-left transition-all ${
                    this.pickupData.slot.includes("Afternoon")
                      ? "bg-amber-500 text-white border-amber-600 shadow"
                      : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
                  }"
                >
                  ☀️ Afternoon<br/><span class="text-[10px] font-normal opacity-90">2:00 - 4:30 PM</span>
                </button>
                <button
                  type="button"
                  data-slot="Evening (05:00 PM – 07:30 PM)"
                  class="pickup-slot-btn py-2.5 px-3 rounded-xl border text-xs font-bold text-left transition-all ${
                    this.pickupData.slot.includes("Evening")
                      ? "bg-amber-500 text-white border-amber-600 shadow"
                      : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
                  }"
                >
                  🌙 Evening<br/><span class="text-[10px] font-normal opacity-90">5:00 - 7:30 PM</span>
                </button>
              </div>
            </div>

            <!-- Customer & Bike Info -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Your Name</label>
                <input
                  type="text"
                  id="pickup-input-name"
                  value="${this.pickupData.name}"
                  class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label class="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Mobile Phone (WhatsApp)</label>
                <input
                  type="tel"
                  id="pickup-input-phone"
                  value="${this.pickupData.phone}"
                  class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 dark:text-white font-mono"
                />
              </div>
            </div>

            <!-- Vehicle & Reg Number -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Bike Model</label>
                <input
                  type="text"
                  id="pickup-input-vehicle"
                  value="${this.pickupData.vehicle}"
                  class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label class="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Registration No.</label>
                <input
                  type="text"
                  id="pickup-input-reg"
                  value="${this.pickupData.reg}"
                  class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white font-mono uppercase"
                />
              </div>
            </div>

            <!-- Address Field -->
            <div>
              <label class="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                📍 Doorstep Pickup Address (House / Office / Landmark)
              </label>
              <textarea
                id="pickup-input-address"
                rows="2"
                class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs font-medium text-slate-900 dark:text-white leading-relaxed"
              >${this.pickupData.address}</textarea>
            </div>

            <!-- Return Drop Option -->
            <label class="flex items-center gap-2 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl cursor-pointer">
              <input
                type="checkbox"
                id="pickup-check-drop"
                ${this.pickupData.requiresDrop ? "checked" : ""}
                class="accent-amber-500 w-4 h-4 rounded"
              />
              <span class="text-xs font-bold text-amber-900 dark:text-amber-300">
                ✨ Also deliver bike back to my doorstep after service is completed
              </span>
            </label>

          </div>

          <!-- Footer Action -->
          <div class="bg-slate-50 dark:bg-slate-950 p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <button id="btn-cancel-pickup" class="text-xs font-bold text-slate-600 dark:text-slate-400 px-3 py-2">
              Cancel
            </button>
            <button
              id="btn-confirm-pickup"
              class="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm px-6 py-2.5 rounded-xl flex items-center gap-2 shadow-lg transition-all"
            >
              <span>🛵</span> Confirm Pickup Booking
            </button>
          </div>

        </div>
      </div>
    `;

    this.attachEvents();
  }

  attachEvents() {
    const closeBtn = this.modal.querySelector("#btn-close-pickup");
    const cancelBtn = this.modal.querySelector("#btn-cancel-pickup");
    const backdrop = this.modal.querySelector(".mw-modal-backdrop");

    [closeBtn, cancelBtn].forEach((b) => {
      if (b) b.addEventListener("click", () => this.hide());
    });

    if (backdrop) {
      backdrop.addEventListener("click", (e) => {
        if (e.target === backdrop) this.hide();
      });
    }

    const slotButtons = this.modal.querySelectorAll(".pickup-slot-btn");
    slotButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        this.pickupData.slot = btn.getAttribute("data-slot");
        playClickSound();
        this.render();
      });
    });

    const nameIn = this.modal.querySelector("#pickup-input-name");
    if (nameIn) nameIn.addEventListener("input", (e) => { this.pickupData.name = e.target.value; });

    const phoneIn = this.modal.querySelector("#pickup-input-phone");
    if (phoneIn) phoneIn.addEventListener("input", (e) => { this.pickupData.phone = e.target.value; });

    const vehIn = this.modal.querySelector("#pickup-input-vehicle");
    if (vehIn) vehIn.addEventListener("input", (e) => { this.pickupData.vehicle = e.target.value; });

    const regIn = this.modal.querySelector("#pickup-input-reg");
    if (regIn) regIn.addEventListener("input", (e) => { this.pickupData.reg = e.target.value; });

    const addrIn = this.modal.querySelector("#pickup-input-address");
    if (addrIn) addrIn.addEventListener("input", (e) => { this.pickupData.address = e.target.value; });

    const dropIn = this.modal.querySelector("#pickup-check-drop");
    if (dropIn) dropIn.addEventListener("change", (e) => { this.pickupData.requiresDrop = e.target.checked; });

    const confirmBtn = this.modal.querySelector("#btn-confirm-pickup");
    if (confirmBtn) {
      confirmBtn.addEventListener("click", () => {
        playSuccessChime();
        this.isBooked = true;
        this.render();
      });
    }
  }

  attachSuccessEvents() {
    const closeBtn = this.modal.querySelector("#btn-close-pickup-success");
    if (closeBtn) closeBtn.addEventListener("click", () => this.hide());

    const waBtn = this.modal.querySelector("#btn-wa-pickup-confirm");
    if (waBtn) {
      waBtn.addEventListener("click", () => {
        const text = this.generateWhatsappBookingText();
        const phone = "919842299001";
        const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
        window.open(url, "_blank");
        this.hide();
      });
    }
  }
}
