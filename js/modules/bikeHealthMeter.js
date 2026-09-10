/**
 * Bike Health & Predictive Maintenance Calculator Module
 * Real-time Odometer & Wear Prediction Engine
 */

import { inr, sanitizePhone } from "../utils/helpers.js";
import { playClickSound, playSuccessChime } from "../utils/audio.js";

export class BikeHealthMeter {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    this.onBookService = options.onBookService || (() => {});
    
    this.state = {
      odometer: 18500,
      dailyKm: 25,
      vehicleType: "scooter", // scooter | commuter | re_cruiser | performance | ev
      lastServiceMonthsAgo: 4,
      oilChangeKm: 2500,
      brakeCheckKm: 5000,
      chainKm: 6000,
      batteryAgeMonths: 18,
      tyreKm: 14000,
      customerPhone: "9894312456",
      customerName: "Karthik Raja"
    };

    this.render();
  }

  setCustomerData(customer) {
    if (customer) {
      if (customer.phone) this.state.customerPhone = customer.phone;
      if (customer.name) this.state.customerName = customer.name;
    }
  }

  calculateHealth() {
    const { odometer, dailyKm, lastServiceMonthsAgo, batteryAgeMonths } = this.state;

    // 1. Engine Oil Life (Target: Every 3,000 km)
    const kmSinceOil = (odometer % 3000);
    const oilLifePercent = Math.max(5, Math.round(100 - (kmSinceOil / 3000) * 100));
    const oilDueInKm = Math.max(0, 3000 - kmSinceOil);
    const oilDueInDays = Math.max(1, Math.round(oilDueInKm / (dailyKm || 1)));

    // 2. Brake Pads / Shoes (Target: Every 6,000 km)
    const kmSinceBrake = (odometer % 6000);
    const brakeLifePercent = Math.max(10, Math.round(100 - (kmSinceBrake / 6000) * 100));
    const brakeDueInKm = Math.max(0, 6000 - kmSinceBrake);

    // 3. Drive Chain & Sprocket / EV Belt (Target: Every 8,000 km)
    const kmSinceChain = (odometer % 8000);
    const chainLifePercent = Math.max(15, Math.round(100 - (kmSinceChain / 8000) * 100));
    const chainDueInKm = Math.max(0, 8000 - kmSinceChain);

    // 4. 12V Battery Health (Lifespan: 36 Months)
    const batteryLifePercent = Math.max(10, Math.round(100 - (batteryAgeMonths / 36) * 100));
    const batteryVoltage = (12.2 + (batteryLifePercent / 100) * 0.6).toFixed(1);

    // 5. Tyres Tread (Target: Every 20,000 km)
    const kmSinceTyre = (odometer % 20000);
    const tyreLifePercent = Math.max(10, Math.round(100 - (kmSinceTyre / 20000) * 100));

    // Overall Score
    const overallScore = Math.round(
      oilLifePercent * 0.35 +
      brakeLifePercent * 0.25 +
      chainLifePercent * 0.15 +
      batteryLifePercent * 0.15 +
      tyreLifePercent * 0.10
    );

    let statusLabel = "Excellent Condition";
    let statusColor = "text-emerald-500";
    let badgeBg = "bg-emerald-500/10 text-emerald-600 border-emerald-500/30";

    if (overallScore < 50) {
      statusLabel = "Critical Service Required";
      statusColor = "text-rose-500";
      badgeBg = "bg-rose-500/10 text-rose-600 border-rose-500/30";
    } else if (overallScore < 75) {
      statusLabel = "Maintenance Due Soon";
      statusColor = "text-amber-500";
      badgeBg = "bg-amber-500/10 text-amber-600 border-amber-500/30";
    }

    return {
      overallScore,
      statusLabel,
      statusColor,
      badgeBg,
      oil: { percent: oilLifePercent, dueInKm: oilDueInKm, dueInDays: oilDueInDays },
      brake: { percent: brakeLifePercent, dueInKm: brakeDueInKm },
      chain: { percent: chainLifePercent, dueInKm: chainDueInKm },
      battery: { percent: batteryLifePercent, voltage: batteryVoltage },
      tyre: { percent: tyreLifePercent }
    };
  }

  generateWhatsappReminder() {
    const health = this.calculateHealth();
    return [
      `🔔 *QuickMoto AI Garage — Service Due Alert*`,
      `━━━━━━━━━━━━━━━━━━━━`,
      `Hello *${this.state.customerName}* 👋`,
      `Your vehicle diagnostic health analysis indicates routine maintenance is due!`,
      ``,
      `📊 *Current Bike Health Score:* *${health.overallScore} / 100* (${health.statusLabel})`,
      `🛵 *Odometer:* ${this.state.odometer.toLocaleString("en-IN")} km`,
      ``,
      `🔍 *Key Component Status:*`,
      `• *Engine Oil Life:* ${health.oil.percent}% (Due in ~${health.oil.dueInKm} km / ${health.oil.dueInDays} days)`,
      `• *Brake Wear:* ${health.brake.percent}% remaining`,
      `• *Battery Condition:* ${health.battery.percent}% (${health.battery.voltage}V)`,
      ``,
      `⭐️ Book an appointment or doorstep bike pickup today!`,
      `📍 QuickMoto AI Garage, Eachanari Vinayagar Temple NH 83, Coimbatore`,
      `📞 Helpline: +91 98943 12456`,
      `Ride safe! 🏍️✨`
    ].join("\n");
  }

  render() {
    if (!this.container) return;

    const health = this.calculateHealth();

    this.container.innerHTML = `
      <div class="space-y-6">
        <!-- Banner -->
        <div class="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-[#141B2D] to-slate-900 border border-slate-800 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div class="space-y-2">
            <div class="flex items-center gap-2">
              <span class="px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40 uppercase tracking-wide">
                Smart Diagnostics 2.0
              </span>
              <span class="text-xs text-slate-400">Predictive Odometer Wear Engine</span>
            </div>
            <h2 class="text-xl sm:text-2xl font-black tracking-tight font-heading">
              Bike Health Score &amp; Lifespan Meter
            </h2>
            <p class="text-xs sm:text-sm text-slate-300 max-w-2xl">
              Calculate remaining component life, upcoming parts wear, and service schedule based on your daily commute.
            </p>
          </div>

          <!-- Overall Radial Gauge Card -->
          <div class="flex items-center gap-4 bg-slate-950/80 p-4 rounded-xl border border-slate-800 shadow-inner">
            <div class="relative w-24 h-24 flex items-center justify-center">
              <svg class="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  class="text-slate-800"
                  stroke-width="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  class="${health.overallScore >= 75 ? "text-emerald-500" : health.overallScore >= 50 ? "text-amber-500" : "text-rose-500"}"
                  stroke-dasharray="${health.overallScore}, 100"
                  stroke-width="3.5"
                  stroke-linecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div class="absolute flex flex-col items-center">
                <span class="text-2xl font-black font-mono leading-none">${health.overallScore}</span>
                <span class="text-[9px] text-slate-400 uppercase font-bold">/ 100</span>
              </div>
            </div>
            <div>
              <span class="text-xs font-bold block ${health.statusColor}">${health.statusLabel}</span>
              <span class="text-[11px] text-slate-400">Based on ${this.state.odometer.toLocaleString("en-IN")} km</span>
              <button id="btn-send-health-reminder" class="mt-2 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-sm transition-all">
                <span>📲</span> Send Alert on WhatsApp
              </button>
            </div>
          </div>
        </div>

        <!-- Inputs & Slider Row -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
          <!-- Odometer Input -->
          <div class="mw-card p-5 rounded-2xl bg-white dark:bg-[#161D2C] border border-slate-200 dark:border-slate-800 space-y-3">
            <label class="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span>🛵 Current Odometer (km)</span>
              <span class="font-mono text-amber-600 dark:text-amber-400 text-sm font-black" id="odometer-val-display">
                ${this.state.odometer.toLocaleString("en-IN")} km
              </span>
            </label>
            <input
              type="range"
              id="slider-odometer"
              min="500"
              max="80000"
              step="500"
              value="${this.state.odometer}"
              class="w-full accent-amber-500 cursor-pointer"
            />
            <div class="flex justify-between text-[10px] text-slate-600 font-mono">
              <span>0 km (Brand New)</span>
              <span>40k km</span>
              <span>80k km (Veteran)</span>
            </div>
          </div>

          <!-- Daily Running Input -->
          <div class="mw-card p-5 rounded-2xl bg-white dark:bg-[#161D2C] border border-slate-200 dark:border-slate-800 space-y-3">
            <label class="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span>🛣️ Daily Commute (km/day)</span>
              <span class="font-mono text-amber-600 dark:text-amber-400 text-sm font-black" id="daily-km-display">
                ${this.state.dailyKm} km / day
              </span>
            </label>
            <input
              type="range"
              id="slider-daily-km"
              min="5"
              max="120"
              step="5"
              value="${this.state.dailyKm}"
              class="w-full accent-amber-500 cursor-pointer"
            />
            <div class="flex justify-between text-[10px] text-slate-600 font-mono">
              <span>5 km (City run)</span>
              <span>30 km (Daily work)</span>
              <span>100+ km (Highway/Delivery)</span>
            </div>
          </div>

          <!-- Battery Age Input -->
          <div class="mw-card p-5 rounded-2xl bg-white dark:bg-[#161D2C] border border-slate-200 dark:border-slate-800 space-y-3">
            <label class="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span>🔋 12V Battery Age</span>
              <span class="font-mono text-amber-600 dark:text-amber-400 text-sm font-black" id="battery-age-display">
                ${this.state.batteryAgeMonths} Months
              </span>
            </label>
            <input
              type="range"
              id="slider-battery-age"
              min="1"
              max="48"
              step="1"
              value="${this.state.batteryAgeMonths}"
              class="w-full accent-amber-500 cursor-pointer"
            />
            <div class="flex justify-between text-[10px] text-slate-600 font-mono">
              <span>New (1m)</span>
              <span>24m (Average)</span>
              <span>48m (Replace)</span>
            </div>
          </div>
        </div>

        <!-- Component Health Breakdown Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <!-- Engine Oil Card -->
          <div class="mw-card p-5 rounded-2xl bg-white dark:bg-[#161D2C] border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-3">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="text-2xl">🛢️</span>
                <div>
                  <h4 class="text-xs font-bold text-slate-900 dark:text-white">Engine Oil Life</h4>
                  <p class="text-[11px] text-slate-600">Lubrication &amp; Viscosity</p>
                </div>
              </div>
              <span class="text-xs font-black font-mono ${health.oil.percent > 40 ? "text-emerald-500" : "text-rose-500"}">
                ${health.oil.percent}%
              </span>
            </div>
            
            <div class="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
              <div class="h-full ${health.oil.percent > 40 ? "bg-emerald-500" : "bg-rose-500"} transition-all duration-300" style="width: ${health.oil.percent}%"></div>
            </div>

            <div class="text-[11px] text-slate-600 dark:text-slate-400 font-medium pt-1 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
              <span>Due in:</span>
              <span class="font-bold text-slate-900 dark:text-white font-mono">~${health.oil.dueInKm} km (${health.oil.dueInDays} days)</span>
            </div>
          </div>

          <!-- Brakes Card -->
          <div class="mw-card p-5 rounded-2xl bg-white dark:bg-[#161D2C] border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-3">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="text-2xl">🛑</span>
                <div>
                  <h4 class="text-xs font-bold text-slate-900 dark:text-white">Brake Friction</h4>
                  <p class="text-[11px] text-slate-600">Pads &amp; Drum Shoes</p>
                </div>
              </div>
              <span class="text-xs font-black font-mono ${health.brake.percent > 40 ? "text-emerald-500" : "text-amber-500"}">
                ${health.brake.percent}%
              </span>
            </div>
            
            <div class="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
              <div class="h-full ${health.brake.percent > 40 ? "bg-emerald-500" : "bg-amber-500"} transition-all duration-300" style="width: ${health.brake.percent}%"></div>
            </div>

            <div class="text-[11px] text-slate-600 dark:text-slate-400 font-medium pt-1 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
              <span>Good for:</span>
              <span class="font-bold text-slate-900 dark:text-white font-mono">~${health.brake.dueInKm} km</span>
            </div>
          </div>

          <!-- Chain & Drive Belt Card -->
          <div class="mw-card p-5 rounded-2xl bg-white dark:bg-[#161D2C] border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-3">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="text-2xl">⛓️</span>
                <div>
                  <h4 class="text-xs font-bold text-slate-900 dark:text-white">Drive Chain / Belt</h4>
                  <p class="text-[11px] text-slate-600">Slack &amp; Sprocket Teeth</p>
                </div>
              </div>
              <span class="text-xs font-black font-mono text-emerald-500">
                ${health.chain.percent}%
              </span>
            </div>
            
            <div class="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
              <div class="h-full bg-emerald-500 transition-all duration-300" style="width: ${health.chain.percent}%"></div>
            </div>

            <div class="text-[11px] text-slate-600 dark:text-slate-400 font-medium pt-1 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
              <span>Lube Interval:</span>
              <span class="font-bold text-slate-900 dark:text-white font-mono">Every 500 km</span>
            </div>
          </div>

          <!-- Battery & Voltage Card -->
          <div class="mw-card p-5 rounded-2xl bg-white dark:bg-[#161D2C] border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-3">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="text-2xl">⚡</span>
                <div>
                  <h4 class="text-xs font-bold text-slate-900 dark:text-white">12V Battery Health</h4>
                  <p class="text-[11px] text-slate-600">Self Start &amp; Cranking</p>
                </div>
              </div>
              <span class="text-xs font-black font-mono ${health.battery.percent > 50 ? "text-emerald-500" : "text-rose-500"}">
                ${health.battery.percent}%
              </span>
            </div>
            
            <div class="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
              <div class="h-full ${health.battery.percent > 50 ? "bg-emerald-500" : "bg-rose-500"} transition-all duration-300" style="width: ${health.battery.percent}%"></div>
            </div>

            <div class="text-[11px] text-slate-600 dark:text-slate-400 font-medium pt-1 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
              <span>Voltage:</span>
              <span class="font-bold text-slate-900 dark:text-white font-mono">${health.battery.voltage} V (DC)</span>
            </div>
          </div>

        </div>
      </div>
    `;

    this.attachEvents();
  }

  attachEvents() {
    const odoSlider = this.container.querySelector("#slider-odometer");
    if (odoSlider) {
      odoSlider.addEventListener("input", (e) => {
        this.state.odometer = Number(e.target.value);
        this.render();
      });
    }

    const dailySlider = this.container.querySelector("#slider-daily-km");
    if (dailySlider) {
      dailySlider.addEventListener("input", (e) => {
        this.state.dailyKm = Number(e.target.value);
        this.render();
      });
    }

    const batterySlider = this.container.querySelector("#slider-battery-age");
    if (batterySlider) {
      batterySlider.addEventListener("input", (e) => {
        this.state.batteryAgeMonths = Number(e.target.value);
        this.render();
      });
    }

    const waBtn = this.container.querySelector("#btn-send-health-reminder");
    if (waBtn) {
      waBtn.addEventListener("click", () => {
        playSuccessChime();
        const text = this.generateWhatsappReminder();
        const phone = sanitizePhone(this.state.customerPhone);
        const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
        window.open(url, "_blank");
      });
    }
  }
}
