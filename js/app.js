/**
 * Master Application Controller - QuickMoto AI Garage V2
 * Pure Modular Vanilla ES6 Architecture with LocalStorage Persistence
 */

import { DashboardView } from "./modules/dashboardView.js";
import { DiagnosticEngine } from "./modules/diagnosticEngine.js";
import { LiveBaysKanban } from "./modules/liveBaysKanban.js";
import { BillingManager } from "./modules/billingManager.js";
import { UserValidation } from "./modules/userValidation.js";

import { NearbyServicesHub } from "./modules/nearbyServicesHub.js";
import { EmergencySOSModal } from "./modules/emergencySOS.js";
import { DigitalInspection } from "./modules/digitalInspection.js";
import { SparesManager } from "./modules/sparesManager.js";
import { HistoryManager } from "./modules/historyManager.js";
import { CustomerDispatchModal } from "./modules/customerDispatch.js";
import { PrintManager } from "./modules/printManager.js";
import { PickupDropModal } from "./modules/pickupDropModal.js";
import { BikeAnatomyExplorer } from "./modules/bikeAnatomyExplorer.js";

import { jobCardStore } from "./data/jobCardStore.js";
import { POPULAR_VEHICLES, QUICK_SYMPTOM_CHIPS } from "./data/knowledgeBase.js";
import { PRESET_SCENARIOS } from "./data/presetScenarios.js";
import { inr, formatClock, formatDateShort } from "./utils/helpers.js";
import { playClickSound, playSuccessChime, toggleSound } from "./utils/audio.js";

class App {
  constructor() {
    this.currentTab = "dashboard"; // dashboard | diagnosis | bays | billing | decision_log | validation | inspection | spares | nearby | history
    
    // 1. Initialize Theme & Clock
    this.initTheme();
    this.initClock();

    // 2. Initialize Core Modules
    this.initCoreModules();

    // 3. Initialize UI Components & Events
    this.initSpeechRecognition();
    this.populateStaticDropdowns();
    this.attachGlobalEvents();

    // 4. Initial Render
    this.renderDiagnosisView();
    this.updateActiveBaysCount();
  }

  showToast(message, type = "success") {
    const container = document.getElementById("toast-container");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `toast-msg p-3.5 rounded-xl shadow-lg border text-xs font-semibold flex items-center justify-between gap-3 text-white ${
      type === "success"
        ? "bg-emerald-600 border-emerald-500 shadow-emerald-900/30"
        : type === "error"
        ? "bg-red-600 border-red-500 shadow-red-900/30"
        : "bg-slate-900 border-slate-700 shadow-black/40 text-amber-300"
    }`;

    toast.innerHTML = `
      <div class="flex items-center gap-2">
        <span>${type === "success" ? "✅" : type === "error" ? "❌" : "ℹ️"}</span>
        <span>${message}</span>
      </div>
      <button class="text-white/70 hover:text-white text-sm leading-none">&times;</button>
    `;

    const closeBtn = toast.querySelector("button");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => toast.remove());
    }

    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add("toast-hiding");
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  initTheme() {
    const savedTheme = localStorage.getItem("EAM_THEME") || "light";
    this.setTheme(savedTheme);
  }

  setTheme(theme) {
    const isDark = theme === "dark";
    if (isDark) {
      document.body.classList.add("dark");
      document.documentElement.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("EAM_THEME", theme);

    const iconEl = document.getElementById("theme-icon");
    const labelEl = document.getElementById("theme-label");
    if (iconEl) iconEl.textContent = isDark ? "☀️" : "🌙";
    if (labelEl) labelEl.textContent = isDark ? "Light Mode" : "Dark Mode";
  }

  toggleTheme() {
    const isDark = document.body.classList.contains("dark");
    this.setTheme(isDark ? "light" : "dark");
    playClickSound();
  }

  initClock() {
    const clockEl = document.getElementById("live-clock-display");
    const dateEl = document.getElementById("live-date-display");
    const update = () => {
      const now = new Date();
      if (clockEl) clockEl.textContent = formatClock(now);
      if (dateEl) dateEl.textContent = formatDateShort(now);
    };
    update();
    setInterval(update, 1000);
  }

  initCoreModules() {
    // 1. Dashboard View
    this.dashboardView = new DashboardView("dashboard-view-container", {
      onNavigate: (tab) => this.switchTab(tab),
      onSelectJob: (jobId) => {
        jobCardStore.setActiveJobId(jobId);
        this.switchTab("bays");
      },
      showToast: (msg, type) => this.showToast(msg, type)
    });

    // 2. Diagnostic Engine (Customer Check-in)
    this.diagnosticEngine = new DiagnosticEngine({
      onStateChange: () => {
        this.renderDiagnosisView();
        this.updateActiveBaysCount();
      }
    });

    // 3. Live Bays Kanban (Repair Tracking)
    this.liveBays = new LiveBaysKanban("live-bays-container", {
      onNavigate: (tab) => this.switchTab(tab),
      showToast: (msg, type) => this.showToast(msg, type)
    });

    // 4. Billing Manager
    this.billingManager = new BillingManager("billing-view-container", {
      showToast: (msg, type) => this.showToast(msg, type)
    });

    // 5. User Validation Module
    this.userValidation = new UserValidation("user-validation-container", {
      showToast: (msg, type) => this.showToast(msg, type)
    });

    // 7. Auxiliary Modals & Hubs
    this.sosModal = new EmergencySOSModal("emergency-sos-modal");
    this.dispatchModal = new CustomerDispatchModal("customer-dispatch-modal");
    this.pickupModal = new PickupDropModal("doorstep-pickup-modal");
    this.nearbyHub = new NearbyServicesHub("nearby-services-container", {
      onOpenSos: () => {
        this.sosModal.open();
      }
    });

    this.digitalInspection = new DigitalInspection("digital-inspection-container", {
      onAddIssuesToJobCard: (flaggedItems) => {
        flaggedItems.forEach((it) => {
          this.diagnosticEngine.addSymptomChip(it.name);
        });
        this.switchTab("diagnosis");
        this.diagnosticEngine.runDiagnosis();
        this.showToast(`Added ${flaggedItems.length} inspection issues to Check-in!`, "success");
      }
    });

    this.sparesManager = new SparesManager("spares-catalog-container", {
      onAddSpareToJobCard: (spare) => {
        const activeJob = jobCardStore.getActiveJob();
        if (activeJob) {
          jobCardStore.addSparePart(activeJob.id, {
            name: spare.name,
            partNumber: spare.partNumber,
            partCost: spare.price,
            qty: 1
          });
          this.showToast(`Added ${spare.name} to Job ${activeJob.id}!`, "success");
        } else {
          this.diagnosticEngine.addCustomItem({
            label: spare.name,
            part: `${spare.name} (${spare.partNumber})`,
            partCost: spare.price,
            laborCost: spare.labor,
            duration: 25,
            severity: "routine"
          });
        }
        this.switchTab("billing");
      }
    });

    this.historyManager = new HistoryManager("job-history-container", {
      onLoadJobCard: (record) => {
        jobCardStore.createJob({
          ...record,
          id: undefined
        });
        this.switchTab("billing");
        this.showToast("Loaded job card into workshop queue!", "success");
      }
    });

    this.bikeAnatomy = new BikeAnatomyExplorer("bike-anatomy-container", {
      onAddIssue: (issue) => {
        this.diagnosticEngine.addCustomItem({
          label: issue.label,
          part: issue.part,
          partCost: issue.partCost,
          laborCost: issue.laborCost,
          duration: issue.duration,
          severity: "routine"
        });
        this.showToast(`Added ${issue.label} to Job Card!`, "success");
      }
    });
  }

  updateActiveBaysCount() {
    const stats = jobCardStore.getStats();
    const badge = document.getElementById("nav-badge-active-bays");
    if (badge) {
      badge.textContent = `${stats.activeJobs} Live`;
    }
  }

  populateStaticDropdowns() {
    // 1. Vehicles
    const vehicleSelect = document.getElementById("customer-vehicle-select");
    if (vehicleSelect) {
      vehicleSelect.innerHTML = POPULAR_VEHICLES.map(
        (v) => `<option value="${v.name}">${v.name} (${v.type})</option>`
      ).join("");
    }

    // 2. Preset Scenarios
    const presetsContainer = document.getElementById("preset-scenarios-container");
    if (presetsContainer) {
      presetsContainer.innerHTML = PRESET_SCENARIOS.map(
        (p) => `
        <button
          type="button"
          class="preset-scenario-btn p-2 rounded-lg bg-slate-100 dark:bg-slate-800/90 hover:bg-amber-100 dark:hover:bg-amber-500/20 border border-slate-200 dark:border-slate-700 text-left transition-all"
          data-preset-id="${p.id}"
        >
          <div class="flex items-center gap-1.5 font-bold text-xs text-slate-800 dark:text-slate-200">
            <span>${p.icon}</span>
            <span class="truncate">${p.title}</span>
          </div>
          <p class="text-[10px] text-slate-500 truncate mt-0.5">${p.customer.vehicle}</p>
        </button>
      `
      ).join("");

      presetsContainer.querySelectorAll(".preset-scenario-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          const id = btn.getAttribute("data-preset-id");
          const preset = PRESET_SCENARIOS.find((p) => p.id === id);
          if (preset) {
            this.diagnosticEngine.loadPreset(preset);
            playClickSound();
            this.showToast(`Loaded example: ${preset.title}`, "info");
          }
        });
      });
    }

    // 3. Quick symptom chips
    const chipsContainer = document.getElementById("quick-symptom-chips");
    if (chipsContainer) {
      chipsContainer.innerHTML = QUICK_SYMPTOM_CHIPS.map(
        (chip) => `
        <button
          type="button"
          class="quick-symptom-chip mw-chip px-2.5 py-1 rounded-md text-xs flex items-center gap-1"
          data-chip="${chip}"
        >
          <span class="text-amber-600 font-bold">+</span>
          <span>${chip}</span>
        </button>
      `
      ).join("");

      chipsContainer.querySelectorAll(".quick-symptom-chip").forEach((btn) => {
        btn.addEventListener("click", () => {
          const chip = btn.getAttribute("data-chip");
          this.diagnosticEngine.addSymptomChip(chip);
          playClickSound();
        });
      });
    }
  }

  attachGlobalEvents() {
    // Nav Tab Buttons
    document.querySelectorAll(".nav-tab-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const tab = btn.getAttribute("data-tab");
        if (tab) {
          playClickSound();
          this.switchTab(tab);
        }
      });
    });

    // Header buttons
    const btnTheme = document.getElementById("btn-toggle-theme");
    if (btnTheme) btnTheme.addEventListener("click", () => this.toggleTheme());

    const btnSound = document.getElementById("btn-toggle-sound");
    if (btnSound) {
      btnSound.addEventListener("click", () => {
        const enabled = toggleSound();
        btnSound.textContent = enabled ? "🔊 Sound ON" : "🔇 Sound OFF";
        playClickSound();
      });
    }

    const btnSos = document.getElementById("header-btn-sos");
    if (btnSos) btnSos.addEventListener("click", () => this.sosModal.open());

    const btnPickup = document.getElementById("header-btn-pickup");
    if (btnPickup) btnPickup.addEventListener("click", () => this.pickupModal.open());

    // Customer Check-in Form Inputs
    const nameInput = document.getElementById("customer-name-input");
    const phoneInput = document.getElementById("customer-phone-input");
    const vehicleSelect = document.getElementById("customer-vehicle-select");
    const regInput = document.getElementById("customer-reg-input");
    const complaintText = document.getElementById("complaint-textarea");

    if (nameInput) {
      nameInput.addEventListener("input", (e) => {
        this.diagnosticEngine.setCustomer({ name: e.target.value });
      });
    }
    if (phoneInput) {
      phoneInput.addEventListener("input", (e) => {
        this.diagnosticEngine.setCustomer({ phone: e.target.value });
      });
    }
    if (vehicleSelect) {
      vehicleSelect.addEventListener("change", (e) => {
        this.diagnosticEngine.setCustomer({ vehicle: e.target.value });
      });
    }
    if (regInput) {
      regInput.addEventListener("input", (e) => {
        this.diagnosticEngine.setCustomer({ reg: e.target.value });
      });
    }
    if (complaintText) {
      complaintText.addEventListener("input", (e) => {
        this.diagnosticEngine.setComplaint(e.target.value);
      });
    }

    // Run Diagnosis / Create Job Card Button
    const btnRunDiagnosis = document.getElementById("btn-run-diagnosis");
    if (btnRunDiagnosis) {
      btnRunDiagnosis.addEventListener("click", () => {
        this.diagnosticEngine.runDiagnosis((newJob) => {
          this.showToast(`Job Card ${newJob.id} generated & saved!`, "success");
        });
      });
    }

    // Add Custom Work Button
    const btnAddCustom = document.getElementById("btn-add-custom-repair");
    if (btnAddCustom) {
      btnAddCustom.addEventListener("click", () => {
        const label = prompt("Enter service or repair name:", "Brake adjustment & oiling");
        if (!label) return;
        const partCost = Number(prompt("Enter spare part cost (₹):", "150")) || 0;
        const laborCost = Number(prompt("Enter mechanic labor fee (₹):", "100")) || 0;

        this.diagnosticEngine.addCustomItem({
          label,
          part: label,
          partCost,
          laborCost,
          duration: 20
        });
        playClickSound();
        this.showToast(`Added ${label} to estimate!`, "success");
      });
    }

    // Check-in Navigation to Tracking / Billing buttons
    const btnGoTrack = document.getElementById("checkin-btn-goto-tracking");
    if (btnGoTrack) {
      btnGoTrack.addEventListener("click", () => {
        playClickSound();
        this.switchTab("bays");
      });
    }

    const btnGoBill = document.getElementById("checkin-btn-goto-billing");
    if (btnGoBill) {
      btnGoBill.addEventListener("click", () => {
        playClickSound();
        this.switchTab("billing");
      });
    }
  }

  switchTab(tabName) {
    this.currentTab = tabName;

    // Update active tab buttons
    document.querySelectorAll(".nav-tab-btn").forEach((btn) => {
      const t = btn.getAttribute("data-tab");
      if (t === tabName) {
        btn.classList.add("nav-tab-active");
      } else {
        btn.classList.remove("nav-tab-active");
      }
    });

    // Hide all panels, show target panel
    document.querySelectorAll(".tab-content-panel").forEach((panel) => {
      panel.classList.add("hidden");
    });

    const targetPanel = document.getElementById(`tab-panel-${tabName}`);
    if (targetPanel) {
      targetPanel.classList.remove("hidden");
    }

    // Trigger re-render of dynamic components if needed
    if (tabName === "dashboard" && this.dashboardView) this.dashboardView.render();
    if (tabName === "bays" && this.liveBays) this.liveBays.render();
    if (tabName === "billing" && this.billingManager) this.billingManager.render();
    if (tabName === "validation" && this.userValidation) this.userValidation.render();

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  renderDiagnosisView() {
    const c = this.diagnosticEngine.customer;
    const nameInput = document.getElementById("customer-name-input");
    const phoneInput = document.getElementById("customer-phone-input");
    const vehicleSelect = document.getElementById("customer-vehicle-select");
    const regInput = document.getElementById("customer-reg-input");
    const complaintText = document.getElementById("complaint-textarea");

    if (nameInput && nameInput.value !== c.name) nameInput.value = c.name || "";
    if (phoneInput && phoneInput.value !== c.phone) phoneInput.value = c.phone || "";
    if (vehicleSelect && vehicleSelect.value !== c.vehicle) vehicleSelect.value = c.vehicle || "";
    if (regInput && regInput.value !== c.reg) regInput.value = c.reg || "";
    if (complaintText && complaintText.value !== this.diagnosticEngine.complaintText) {
      complaintText.value = this.diagnosticEngine.complaintText || "";
    }

    const est = this.diagnosticEngine.currentEstimate;
    if (!est) return;

    // Metrics
    const metricJobId = document.getElementById("metric-job-id");
    const metricPartsCost = document.getElementById("metric-parts-cost");
    const metricLaborCost = document.getElementById("metric-labor-cost");
    const metricGrandTotal = document.getElementById("metric-grand-total");
    const metricEstEta = document.getElementById("metric-est-eta");

    if (metricJobId) metricJobId.textContent = est.id;
    if (metricPartsCost) metricPartsCost.textContent = inr(est.partsTotal || est.partsCost || 0);
    if (metricLaborCost) metricLaborCost.textContent = inr(est.labourTotal || est.laborCost || 0);
    if (metricGrandTotal) metricGrandTotal.textContent = inr(est.finalTotal || est.grandTotal || 0);
    if (metricEstEta) metricEstEta.textContent = est.eta || "Today";

    // Table rows
    const tbody = document.getElementById("estimate-items-tbody");
    if (tbody) {
      const items = est.spareParts && est.services
        ? [
            ...est.services.map((s) => ({ label: s.label, part: "-", partCost: 0, laborCost: s.laborCost, duration: s.duration, key: s.id })),
            ...est.spareParts.map((p) => ({ label: p.name, part: p.partNumber, partCost: p.partCost * p.qty, laborCost: 0, duration: 0, key: p.id }))
          ]
        : est.items || [];

      tbody.innerHTML = items
        .map(
          (it) => `
        <tr class="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
          <td class="py-2.5 px-4 font-semibold text-slate-900 dark:text-white">${it.label}</td>
          <td class="py-2.5 px-4 text-slate-500 font-mono text-xs">${it.part}</td>
          <td class="py-2.5 px-4 text-right font-mono text-slate-800 dark:text-slate-200">${it.partCost > 0 ? inr(it.partCost) : "-"}</td>
          <td class="py-2.5 px-4 text-right font-mono text-slate-800 dark:text-slate-200">${it.laborCost > 0 ? inr(it.laborCost) : "-"}</td>
          <td class="py-2.5 px-4 text-right font-mono font-bold text-slate-900 dark:text-white">${inr((it.partCost || 0) + (it.laborCost || 0))}</td>
          <td class="py-2.5 px-4 text-right">
            <button class="text-slate-400 hover:text-red-500 p-1 text-xs btn-remove-item" data-key="${it.key || it.label}">✕</button>
          </td>
        </tr>
      `
        )
        .join("");

      tbody.querySelectorAll(".btn-remove-item").forEach((btn) => {
        btn.addEventListener("click", () => {
          const key = btn.getAttribute("data-key");
          this.diagnosticEngine.removeItem(key);
          playClickSound();
        });
      });
    }

    // Summary footer
    const tableParts = document.getElementById("table-parts-total");
    const tableLabor = document.getElementById("table-labor-total");
    const tableGrand = document.getElementById("table-grand-total-val");
    const tableDuration = document.getElementById("table-duration-total");

    if (tableParts) tableParts.textContent = inr(est.partsTotal || est.partsCost || 0);
    if (tableLabor) tableLabor.textContent = inr(est.labourTotal || est.laborCost || 0);
    if (tableGrand) tableGrand.textContent = inr(est.finalTotal || est.grandTotal || 0);
    if (tableDuration) tableDuration.textContent = `${est.durationMinutes || est.duration || 30}m`;
  }

  initSpeechRecognition() {
    const btnVoice = document.getElementById("btn-voice-dictate");
    if (!btnVoice) return;

    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) {
      btnVoice.title = "Voice recognition not supported in this browser";
      return;
    }

    const recognition = new SpeechRec();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-IN"; // Supports Indian English & Tanglish pronunciation

    let isRecording = false;

    btnVoice.addEventListener("click", () => {
      if (isRecording) {
        recognition.stop();
        return;
      }

      try {
        recognition.start();
        isRecording = true;
        btnVoice.classList.add("bg-red-500", "text-white");
        btnVoice.innerHTML = `<span>🔴</span> Listening... Speak your problem`;
      } catch (e) {
        console.warn("Speech error", e);
      }
    });

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      this.diagnosticEngine.setComplaint(
        this.diagnosticEngine.complaintText.length
          ? `${this.diagnosticEngine.complaintText}, ${transcript}`
          : transcript
      );
      this.showToast(`Voice transcribed: "${transcript}"`, "info");
    };

    recognition.onend = () => {
      isRecording = false;
      btnVoice.classList.remove("bg-red-500", "text-white");
      btnVoice.innerHTML = `<span>🎤</span> Speak Problem`;
    };
  }
}

// Instantiate on DOM load or immediately if already loaded
function initApp() {
  if (!window.quickMotoApp) {
    const app = new App();
    window.quickMotoApp = app;
    window.app = app;
  }
}

if (document.readyState === "loading") {
  window.addEventListener("DOMContentLoaded", initApp);
} else {
  initApp();
}

// Global click event delegation for SOS and Pickup triggers
document.addEventListener("click", (e) => {
  const sosTrigger = e.target.closest("#header-btn-sos, #btn-open-sos-nearby, .mw-btn-sos, [data-action='open-sos']");
  if (sosTrigger) {
    e.preventDefault();
    window.quickMotoApp?.sosModal?.open();
    return;
  }

  const pickupTrigger = e.target.closest("#header-btn-pickup, [data-action='open-pickup']");
  if (pickupTrigger) {
    e.preventDefault();
    window.quickMotoApp?.pickupModal?.open();
    return;
  }
});
