/**
 * Visual Bike Anatomy & Component Hotspot Explorer
 * QuickMoto AI Garage
 */

import { inr } from "../utils/helpers.js";
import { playClickSound, playWrenchSound } from "../utils/audio.js";

export const BIKE_ANATOMY_ZONES = [
  {
    id: "front_wheel",
    name: "Front Wheel & Disc Brakes",
    icon: "🛑",
    coords: { x: "18%", y: "65%" },
    symptoms: ["Front brake noise", "Brake lever spongy", "Front wheel wobbling", "Fork oil leak"],
    primaryIssue: {
      key: "brake_front",
      label: "Front Brake Noise & Pad Replacement",
      part: "Ceramic Front Brake Pads + Rotor Clean",
      partCost: 350,
      laborCost: 150,
      duration: 30
    }
  },
  {
    id: "engine_block",
    name: "Engine, Piston & Transmission",
    icon: "⚙️",
    coords: { x: "46%", y: "58%" },
    symptoms: ["Engine oil dark / low", "Engine overheating", "Clutch slipping", "Mileage low / RPM jerk"],
    primaryIssue: {
      key: "oil_change",
      label: "Engine Oil Change & Filter Replacement",
      part: "Motul Semi-Synthetic Oil (1L) + Oil Filter",
      partCost: 450,
      laborCost: 100,
      duration: 20
    }
  },
  {
    id: "electricals_battery",
    name: "12V Battery & Self-Start Ignition",
    icon: "⚡",
    coords: { x: "55%", y: "38%" },
    symptoms: ["Starting trouble in morning", "Self-start dead click", "Headlight dimming", "Horn weak"],
    primaryIssue: {
      key: "battery_weak",
      label: "12V Battery Diagnostic & Terminal Cleaning",
      part: "Terminal Anti-Corrosion Spray + 12V Load Test",
      partCost: 150,
      laborCost: 100,
      duration: 20
    }
  },
  {
    id: "chain_drive",
    name: "Drive Chain & Rear Sprocket",
    icon: "⛓️",
    coords: { x: "68%", y: "68%" },
    symptoms: ["Chain loose / hitting cover", "Chain dry & noisy", "Sprocket teeth worn", "Gear shifting hard"],
    primaryIssue: {
      key: "chain_loose",
      label: "Drive Chain Tightening & O-Ring Lubrication",
      part: "Motul Heavy Duty Chain Lube & Cleaner",
      partCost: 180,
      laborCost: 120,
      duration: 25
    }
  },
  {
    id: "rear_wheel_suspension",
    name: "Rear Suspension & Brake Drum",
    icon: "🛞",
    coords: { x: "82%", y: "65%" },
    symptoms: ["Rear brake slipping", "Suspension thud on potholes", "Rear tyre puncture / worn", "Wheel bearing play"],
    primaryIssue: {
      key: "brake_rear",
      label: "Rear Brake Drum Service & New Brake Shoes",
      part: "Ceramic Rear Brake Shoes Set",
      partCost: 280,
      laborCost: 150,
      duration: 30
    }
  }
];

export class BikeAnatomyExplorer {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    this.onAddIssue = options.onAddIssue || (() => {});
    this.selectedZone = BIKE_ANATOMY_ZONES[0];
    this.render();
  }

  selectZone(zoneId) {
    const found = BIKE_ANATOMY_ZONES.find((z) => z.id === zoneId);
    if (found) {
      this.selectedZone = found;
      playClickSound();
      this.render();
    }
  }

  render() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="mw-card rounded-2xl bg-white dark:bg-[#161D2C] border border-slate-200 dark:border-slate-800 p-5 space-y-4 shadow-md">
        
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <span class="text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded border border-amber-500/20">
              Visual Diagnostics
            </span>
            <h3 class="text-sm sm:text-base font-black text-slate-900 dark:text-white mt-1 font-heading">
              Interactive Two-Wheeler Anatomy Explorer
            </h3>
            <p class="text-xs text-slate-500">
              Tap any bike zone to inspect common problems and add fixes to the estimate bill.
            </p>
          </div>
        </div>

        <!-- Zone Badges Bar -->
        <div class="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          ${BIKE_ANATOMY_ZONES.map(
            (z) => `
              <button
                type="button"
                data-zone="${z.id}"
                class="anatomy-zone-btn px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 border ${
                  this.selectedZone.id === z.id
                    ? "bg-amber-600 text-white border-amber-600 shadow-md"
                    : "bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-amber-500/50"
                }"
              >
                <span>${z.icon}</span> ${z.name}
              </button>
            `
          ).join("")}
        </div>

        <!-- Visual Diagram & Inspector Card -->
        <div class="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          
          <!-- Visual Motorcycle Outline Container (Hotspots) -->
          <div class="md:col-span-7 relative bg-gradient-to-b from-slate-900 to-slate-950 rounded-2xl p-6 border border-slate-800 flex items-center justify-center min-h-[220px] overflow-hidden shadow-inner">
            
            <!-- Graphic Silhouette -->
            <div class="text-slate-700 text-7xl select-none opacity-40 transform scale-125">
              🏍️
            </div>

            <!-- Hotspot Pins -->
            ${BIKE_ANATOMY_ZONES.map(
              (z) => `
                <button
                  type="button"
                  data-zone="${z.id}"
                  style="left: ${z.coords.x}; top: ${z.coords.y};"
                  title="${z.name}"
                  class="anatomy-hotspot-pin absolute -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-transform ${
                    this.selectedZone.id === z.id
                      ? "bg-amber-500 text-slate-950 scale-125 shadow-lg ring-4 ring-amber-400/30 z-20 animate-pulse"
                      : "bg-slate-800/90 text-amber-400 border border-amber-500/40 hover:scale-110 z-10"
                  }"
                >
                  ${z.icon}
                </button>
              `
            ).join("")}
          </div>

          <!-- Zone Detail & Fix Card -->
          <div class="md:col-span-5 p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
            <div>
              <div class="flex items-center gap-2">
                <span class="text-xl">${this.selectedZone.icon}</span>
                <h4 class="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                  ${this.selectedZone.name}
                </h4>
              </div>
              <p class="text-[11px] text-slate-500 mt-1">Common warning signs:</p>
            </div>

            <!-- Symptoms List -->
            <div class="space-y-1">
              ${this.selectedZone.symptoms.map(
                (s) => `
                  <div class="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300">
                    <span class="text-amber-500 text-xs">⚠️</span>
                    <span>${s}</span>
                  </div>
                `
              ).join("")}
            </div>

            <!-- Recommended Fix Box -->
            <div class="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-lg space-y-1">
              <span class="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 block">
                Recommended Solution:
              </span>
              <p class="text-xs font-bold text-slate-900 dark:text-white">
                ${this.selectedZone.primaryIssue.label}
              </p>
              <div class="flex items-center justify-between text-xs pt-1">
                <span class="text-slate-600 dark:text-slate-400 font-mono text-[11px]">
                  Parts: ${inr(this.selectedZone.primaryIssue.partCost)} | Labor: ${inr(this.selectedZone.primaryIssue.laborCost)}
                </span>
                <span class="font-black text-amber-600 dark:text-amber-400 font-mono">
                  ${inr(this.selectedZone.primaryIssue.partCost + this.selectedZone.primaryIssue.laborCost)}
                </span>
              </div>
            </div>

            <!-- Add to Bill Button -->
            <button
              id="btn-add-anatomy-fix"
              class="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-3 rounded-lg text-xs flex items-center justify-center gap-1.5 shadow transition-all"
            >
              <span>➕</span> Add Fix to Job Card Estimate
            </button>
          </div>

        </div>
      </div>
    `;

    this.attachEvents();
  }

  attachEvents() {
    const btns = this.container.querySelectorAll(".anatomy-zone-btn, .anatomy-hotspot-pin");
    btns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const zoneId = btn.getAttribute("data-zone");
        this.selectZone(zoneId);
      });
    });

    const addBtn = this.container.querySelector("#btn-add-anatomy-fix");
    if (addBtn) {
      addBtn.addEventListener("click", () => {
        playWrenchSound();
        this.onAddIssue(this.selectedZone.primaryIssue);
      });
    }
  }
}
