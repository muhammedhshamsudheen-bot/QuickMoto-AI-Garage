/**
 * AI Diagnostic & Customer Check-In Engine
 * Integrates directly with central jobCardStore and LocalStorage persistence
 */

import { KNOWLEDGE_BASE } from "../data/knowledgeBase.js";
import { jobCardStore } from "../data/jobCardStore.js";
import { inr, makeJobCardId, formatEta } from "../utils/helpers.js";
import { playWrenchSound, playSuccessChime } from "../utils/audio.js";
import { apiClient } from "../utils/apiClient.js";

export class DiagnosticEngine {
  constructor(options = {}) {
    this.knowledgeBase = KNOWLEDGE_BASE;
    this.onStateChange = options.onStateChange || (() => {});
    
    // Load from central store active job or initialize defaults
    const active = jobCardStore.getActiveJob();

    this.customer = active ? { ...active.customer } : {
      name: "Karthik Raja",
      phone: "9894312456",
      vehicle: "Honda Activa 6G",
      reg: "TN 66 BZ 4521"
    };

    this.complaintText = active ? active.reportedProblem :
      "oil change pannanum, front brake la sound varudhu, chain loose ah irukku sound varudhu, fork oil leak, full water wash pannunga";
    
    this.customItems = [];
    this.discountPercent = active ? active.discountPercent : 5;
    this.gstPercent = active ? active.taxPercent : 5;
    this.assignedMechanic = active ? active.assignedMechanic : "Selvam (Senior Tech)";
    this.isAnalyzing = false;
    this.currentEstimate = active || null;
    this.currentStageIndex = active ? active.stageIndex : 0;

    // Listen to central store updates
    window.addEventListener("quickmoto:state-change", (e) => {
      if (e.detail?.activeJob) {
        const j = e.detail.activeJob;
        this.customer = { ...j.customer, vehicle: j.bike?.model, reg: j.bike?.regNo };
        this.complaintText = j.reportedProblem || this.complaintText;
        this.discountPercent = j.discountPercent;
        this.gstPercent = j.taxPercent;
        this.currentStageIndex = j.stageIndex;
        this.currentEstimate = j;
        this.onStateChange();
      }
    });
  }

  notifyStateChange() {
    this.onStateChange();
  }

  setCustomer(newCustomer) {
    this.customer = { ...this.customer, ...newCustomer };
    if (this.currentEstimate) {
      jobCardStore.updateJob(this.currentEstimate.id, {
        customer: {
          name: this.customer.name,
          phone: this.customer.phone,
          email: this.customer.email || "",
          address: this.customer.address || "Coimbatore"
        },
        bike: {
          model: this.customer.vehicle || "Two-Wheeler",
          regNo: this.customer.reg || "TN 66 XX 0000"
        }
      });
    }
    this.notifyStateChange();
  }

  setComplaint(text) {
    this.complaintText = text;
    if (this.currentEstimate) {
      jobCardStore.updateJob(this.currentEstimate.id, {
        reportedProblem: text
      });
    }
    this.notifyStateChange();
  }

  addSymptomChip(chip) {
    const lower = this.complaintText.toLowerCase();
    if (lower.includes(chip.toLowerCase())) return;
    this.complaintText = this.complaintText.trim().length
      ? `${this.complaintText.trim()}, ${chip}`
      : chip;
    if (this.currentEstimate) {
      jobCardStore.updateJob(this.currentEstimate.id, {
        reportedProblem: this.complaintText
      });
    }
    this.notifyStateChange();
  }

  setDiscount(percent) {
    this.discountPercent = Number(percent);
    if (this.currentEstimate) {
      jobCardStore.updateJob(this.currentEstimate.id, {
        discountPercent: this.discountPercent
      });
    }
    this.notifyStateChange();
  }

  setGst(percent) {
    this.gstPercent = Number(percent);
    if (this.currentEstimate) {
      jobCardStore.updateJob(this.currentEstimate.id, {
        taxPercent: this.gstPercent
      });
    }
    this.notifyStateChange();
  }

  setMechanic(name) {
    this.assignedMechanic = name;
    if (this.currentEstimate) {
      jobCardStore.updateJob(this.currentEstimate.id, {
        assignedMechanic: name
      });
    }
    this.notifyStateChange();
  }

  setStageIndex(index) {
    this.currentStageIndex = index;
    if (this.currentEstimate) {
      jobCardStore.updateStage(this.currentEstimate.id, index);
    }
    this.notifyStateChange();
  }

  addCustomItem(item) {
    if (!this.currentEstimate) {
      this.runDiagnosis();
    }
    
    // Add as service or spare part
    if (item.laborCost > 0) {
      jobCardStore.addService(this.currentEstimate.id, {
        label: item.label || "Mechanical Service",
        laborCost: item.laborCost,
        duration: item.duration || 20
      });
    }
    if (item.partCost > 0 || item.part) {
      jobCardStore.addSparePart(this.currentEstimate.id, {
        name: item.part || item.label,
        partNumber: item.partNumber || "OEM-GEN-00",
        partCost: item.partCost || 0,
        qty: 1
      });
    }

    this.currentEstimate = jobCardStore.getJobById(this.currentEstimate.id);
    this.notifyStateChange();
  }

  removeItem(key) {
    if (!this.currentEstimate) return;
    jobCardStore.removeService(this.currentEstimate.id, key);
    jobCardStore.removeSparePart(this.currentEstimate.id, key);
    this.currentEstimate = jobCardStore.getJobById(this.currentEstimate.id);
    this.notifyStateChange();
  }

  analyzeText(text) {
    const lower = text.toLowerCase();
    return this.knowledgeBase.filter((item) =>
      item.keywords.some((kw) => lower.includes(kw))
    );
  }

  async runDiagnosis(callback) {
    this.isAnalyzing = true;
    this.notifyStateChange();
    playWrenchSound();

    const matched = this.analyzeText(this.complaintText);
    
    // Convert matched items to services and spare parts
    const services = matched.map((m, idx) => ({
      id: `srv_${idx}_${Date.now()}`,
      label: m.label,
      category: "Diagnostic Match",
      laborCost: m.laborCost,
      duration: m.duration
    }));

    const spareParts = matched.map((m, idx) => ({
      id: `prt_${idx}_${Date.now()}`,
      name: m.part,
      partNumber: `OEM-${m.key.toUpperCase()}`,
      partCost: m.partCost,
      qty: 1
    }));

    const newJob = jobCardStore.createJob({
      customer: {
        name: this.customer.name || "Customer",
        phone: this.customer.phone || "9894312456"
      },
      bike: {
        model: this.customer.vehicle || "Two-Wheeler",
        regNo: this.customer.reg || "TN 66 BZ 4521"
      },
      reportedProblem: this.complaintText,
      services,
      spareParts,
      discountPercent: this.discountPercent,
      taxPercent: this.gstPercent,
      assignedMechanic: this.assignedMechanic
    });

    this.currentEstimate = newJob;
    this.isAnalyzing = false;
    playSuccessChime();
    this.notifyStateChange();

    if (callback) callback(newJob);
  }

  loadPreset(preset) {
    this.customer = {
      name: preset.customer?.name || "Customer",
      phone: preset.customer?.phone || "9894312456",
      vehicle: preset.customer?.vehicle || "Honda Activa 6G",
      reg: preset.customer?.reg || "TN 66 BZ 4521"
    };
    this.complaintText = preset.complaint;
    this.runDiagnosis();
  }
}
