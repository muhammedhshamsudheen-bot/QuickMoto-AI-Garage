/**
 * Central Persistent Job Card & Workshop State Store
 * Manages full lifecycle: Check-In -> Repair Tracking -> Billing -> Payment
 * Backed by LocalStorage with reactive cross-tab and cross-module synchronization
 */

import { makeJobCardId, formatEta, inr } from "../utils/helpers.js";

export const STAGES = [
  { id: "checked_in", label: "Checked In", desc: "Customer registered & vehicle received", icon: "clipboard-check", color: "blue" },
  { id: "inspection", label: "Inspection", desc: "21-point diagnostic check & fault scan", icon: "search", color: "amber" },
  { id: "repair_in_progress", label: "Repair in Progress", desc: "Mechanic working on lift", icon: "wrench", color: "orange" },
  { id: "parts_required", label: "Parts Required", desc: "Awaiting store issue / OEM dispatch", icon: "package", color: "purple" },
  { id: "ready_for_delivery", label: "Ready for Delivery", desc: "Washed, tested & customer notified", icon: "sparkles", color: "emerald" },
  { id: "completed", label: "Completed", desc: "Bill settled & vehicle handed over", icon: "check-circle", color: "slate" }
];

const STORAGE_KEY = "QUICKMOTO_JOBCARDS_V2";
const ACTIVE_ID_KEY = "QUICKMOTO_ACTIVE_JOB_ID";

export const INITIAL_DEMO_JOBS = [
  {
    id: "QM-2026-8921",
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    customer: {
      name: "Karthik Raja",
      phone: "9894312456",
      email: "karthik.raja@email.com",
      address: "Sundarapuram, Coimbatore"
    },
    bike: {
      model: "Honda Activa 6G",
      regNo: "TN 66 BZ 4521",
      odometer: "18,450 km",
      fuelLevel: "50%"
    },
    reportedProblem: "Engine oil change, front brake squeal, chain slack noise, full foam wash",
    services: [
      { id: "srv_1", label: "Engine Oil Replacement Service", category: "Lube Service", laborCost: 100, duration: 20 },
      { id: "srv_2", label: "Front Brake Caliper & Pad Service", category: "Brake System", laborCost: 150, duration: 30 },
      { id: "srv_3", label: "Drive Chain Tension & Lube", category: "Transmission", laborCost: 120, duration: 25 },
      { id: "srv_4", label: "Full Body Foam Wash & Polish", category: "Detailing", laborCost: 150, duration: 30 }
    ],
    spareParts: [
      { id: "prt_1", name: "Castrol 10W-30 4T Semi-Synthetic (800ml)", partNumber: "CAS-ACT-10W30", partCost: 450, qty: 1 },
      { id: "prt_2", name: "Front Brake Pad Set (OEM)", partNumber: "HON-45105-KWP", partCost: 350, qty: 1 },
      { id: "prt_3", name: "Chain Lube Spray (150ml)", partNumber: "MOT-CHL-150", partCost: 120, qty: 1 },
      { id: "prt_4", name: "Foam Wash Shampoo & Wax Kit", partNumber: "3M-WSH-01", partCost: 80, qty: 1 }
    ],
    additionalCharges: {
      consumableFee: 50,
      pickupDropFee: 0,
      emergencyFee: 0,
      notes: "Shop consumables, rag & degreaser"
    },
    discountPercent: 5,
    taxPercent: 5, // 5% GST
    stageIndex: 2, // Repair in Progress
    status: "Repair in Progress",
    assignedMechanic: "Selvam (Senior Tech)",
    bay: "Bay 2 (Active Lift)",
    notes: "Customer requested delivery before 6 PM.",
    payment: {
      status: "Pending",
      method: null,
      txnId: null,
      paidAt: null,
      paidAmount: 0
    }
  },
  {
    id: "QM-2026-7734",
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    customer: {
      name: "Senthil Kumar",
      phone: "9842233100",
      email: "senthil.k@gmail.com",
      address: "Pollachi Road, Eachanari"
    },
    bike: {
      model: "Royal Enfield Classic 350",
      regNo: "TN 38 CB 1024",
      odometer: "26,120 km",
      fuelLevel: "75%"
    },
    reportedProblem: "Starting trouble, battery draining quickly, fork oil leakage on left shock",
    services: [
      { id: "srv_5", label: "Electrical Health Scan & Battery Setup", category: "Electrical", laborCost: 100, duration: 20 },
      { id: "srv_6", label: "Front Telescopic Fork Overhaul", category: "Suspension", laborCost: 350, duration: 60 }
    ],
    spareParts: [
      { id: "prt_5", name: "Exide 12V 14Ah Maintenance-Free Battery", partNumber: "EXI-12V14AH-RE", partCost: 2400, qty: 1 },
      { id: "prt_6", name: "Fork Oil Seal Kit + Fork Fluid 350ml", partNumber: "RE-58201-FOK", partCost: 450, qty: 1 }
    ],
    additionalCharges: {
      consumableFee: 60,
      pickupDropFee: 150,
      emergencyFee: 0,
      notes: "Doorstep bike pickup fee included"
    },
    discountPercent: 0,
    taxPercent: 5,
    stageIndex: 4, // Ready for Delivery
    status: "Ready for Delivery",
    assignedMechanic: "Ramu (Enfield Specialist)",
    bay: "Bay 1 (Heavy Lift)",
    notes: "Old battery handed back to customer for core discount warranty.",
    payment: {
      status: "Pending",
      method: "UPI",
      txnId: null,
      paidAt: null,
      paidAmount: 0
    }
  },
  {
    id: "QM-2026-6140",
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    customer: {
      name: "Praveen Mani",
      phone: "9789012345",
      email: "praveen.m@yahoo.com",
      address: "Malumichampatti, Coimbatore"
    },
    bike: {
      model: "Hero Splendor Plus",
      regNo: "TN 37 AX 9912",
      odometer: "42,800 km",
      fuelLevel: "40%"
    },
    reportedProblem: "Periodic general service, clutch cable tight, mileage drop",
    services: [
      { id: "srv_7", label: "General Periodic Service & Tuning", category: "General Service", laborCost: 250, duration: 60 },
      { id: "srv_8", label: "Clutch Cable Replacement & Free Play Adj", category: "Controls", laborCost: 80, duration: 15 }
    ],
    spareParts: [
      { id: "prt_7", name: "Hero Genuine 4T Plus 10W-30 (900ml)", partNumber: "HER-10W30-GEN", partCost: 380, qty: 1 },
      { id: "prt_8", name: "Air Filter Element", partNumber: "HER-17211-SPL", partCost: 160, qty: 1 },
      { id: "prt_9", name: "Clutch Cable Assembly OEM", partNumber: "HER-22870-SPL", partCost: 130, qty: 1 }
    ],
    additionalCharges: {
      consumableFee: 30,
      pickupDropFee: 0,
      emergencyFee: 0,
      notes: "Grease, carb cleaner & kerosene"
    },
    discountPercent: 10,
    taxPercent: 5,
    stageIndex: 5, // Completed
    status: "Completed",
    assignedMechanic: "Selvam (Senior Tech)",
    bay: "Bay 3 (Express)",
    notes: "Work finished yesterday. Paid via GPay at counter.",
    payment: {
      status: "Paid",
      method: "UPI",
      txnId: "UPI/60909/248190",
      paidAt: new Date(Date.now() - 3600000 * 18).toISOString(),
      paidAmount: 955
    }
  }
];

class JobCardStore {
  constructor() {
    this.jobs = this.loadJobs();
    this.activeJobId = localStorage.getItem(ACTIVE_ID_KEY) || (this.jobs[0] ? this.jobs[0].id : null);
  }

  loadJobs() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((j) => this.computeCalculations(j));
        }
      }
    } catch (e) {
      console.warn("Error loading jobs from LocalStorage:", e);
    }
    const defaults = INITIAL_DEMO_JOBS.map((j) => this.computeCalculations(j));
    this.saveJobsDirect(defaults);
    return defaults;
  }

  saveJobsDirect(jobsList) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(jobsList));
    } catch (e) {
      console.warn("Storage save error:", e);
    }
  }

  save() {
    this.saveJobsDirect(this.jobs);
    if (this.activeJobId) {
      localStorage.setItem(ACTIVE_ID_KEY, this.activeJobId);
    }
    this.broadcast();
  }

  broadcast() {
    window.dispatchEvent(new CustomEvent("quickmoto:state-change", {
      detail: {
        jobs: this.jobs,
        activeJobId: this.activeJobId,
        activeJob: this.getActiveJob()
      }
    }));
  }

  computeCalculations(job) {
    const labourTotal = (job.services || []).reduce((sum, s) => sum + (Number(s.laborCost) || 0), 0);
    const partsTotal = (job.spareParts || []).reduce((sum, p) => sum + ((Number(p.partCost) || 0) * (Number(p.qty) || 1)), 0);
    
    const consumableFee = Number(job.additionalCharges?.consumableFee) || 0;
    const pickupDropFee = Number(job.additionalCharges?.pickupDropFee) || 0;
    const emergencyFee = Number(job.additionalCharges?.emergencyFee) || 0;
    const additionalTotal = consumableFee + pickupDropFee + emergencyFee;

    const subtotal = labourTotal + partsTotal + additionalTotal;
    
    const discountPct = Number(job.discountPercent) || 0;
    const discountAmount = Math.round((subtotal * discountPct) / 100);
    const taxableAmount = Math.max(0, subtotal - discountAmount);

    const taxPct = Number(job.taxPercent) || 0;
    const taxAmount = Math.round((taxableAmount * taxPct) / 100);

    const finalTotal = Math.max(0, taxableAmount + taxAmount);

    const durationMinutes = (job.services || []).reduce((sum, s) => sum + (Number(s.duration) || 0), 0) + 20;

    const stageIdx = typeof job.stageIndex === "number" ? job.stageIndex : 0;
    const stageObj = STAGES[stageIdx] || STAGES[0];

    return {
      ...job,
      stageIndex: stageIdx,
      status: stageObj.label,
      labourTotal,
      partsTotal,
      additionalTotal,
      subtotal,
      discountPercent: discountPct,
      discountAmount,
      taxPercent: taxPct,
      taxAmount,
      finalTotal,
      durationMinutes,
      eta: formatEta(job.createdAt || new Date(), durationMinutes)
    };
  }

  getAllJobs() {
    return this.jobs;
  }

  getJobById(id) {
    return this.jobs.find((j) => j.id === id) || null;
  }

  getActiveJob() {
    if (!this.activeJobId && this.jobs.length > 0) {
      this.activeJobId = this.jobs[0].id;
    }
    return this.getJobById(this.activeJobId) || (this.jobs[0] || null);
  }

  setActiveJobId(id) {
    this.activeJobId = id;
    localStorage.setItem(ACTIVE_ID_KEY, id);
    this.broadcast();
  }

  createJob(jobData) {
    const now = new Date();
    const newId = jobData.id || makeJobCardId(now);
    
    const newRecord = this.computeCalculations({
      id: newId,
      createdAt: now.toISOString(),
      customer: {
        name: jobData.customer?.name || "Customer",
        phone: jobData.customer?.phone || "9894300000",
        email: jobData.customer?.email || "",
        address: jobData.customer?.address || "Coimbatore"
      },
      bike: {
        model: jobData.bike?.model || "Two-Wheeler",
        regNo: (jobData.bike?.regNo || "TN 66 XX 0000").toUpperCase(),
        odometer: jobData.bike?.odometer || "0 km",
        fuelLevel: jobData.bike?.fuelLevel || "50%"
      },
      reportedProblem: jobData.reportedProblem || "General Checkup",
      services: jobData.services || [],
      spareParts: jobData.spareParts || [],
      additionalCharges: jobData.additionalCharges || {
        consumableFee: 50,
        pickupDropFee: 0,
        emergencyFee: 0,
        notes: "Shop consumables & degreaser"
      },
      discountPercent: Number(jobData.discountPercent) || 0,
      taxPercent: Number(jobData.taxPercent !== undefined ? jobData.taxPercent : 5),
      stageIndex: 0, // Checked In
      status: STAGES[0].label,
      assignedMechanic: jobData.assignedMechanic || "Selvam (Senior Tech)",
      bay: jobData.bay || "Bay 1 (Active)",
      notes: jobData.notes || "",
      payment: {
        status: "Pending",
        method: null,
        txnId: null,
        paidAt: null,
        paidAmount: 0
      }
    });

    this.jobs.unshift(newRecord);
    this.activeJobId = newRecord.id;
    this.save();
    return newRecord;
  }

  updateJob(id, updates) {
    const index = this.jobs.findIndex((j) => j.id === id);
    if (index === -1) return null;

    const merged = { ...this.jobs[index], ...updates };
    
    // If status updated to Completed, auto-mark payment if appropriate
    if (updates.stageIndex === 5 && merged.payment.status === "Pending") {
      merged.payment = {
        ...merged.payment,
        status: "Paid",
        method: merged.payment.method || "Cash/UPI",
        txnId: merged.payment.txnId || `TXN/${Date.now().toString().slice(-6)}`,
        paidAt: new Date().toISOString(),
        paidAmount: merged.finalTotal
      };
    }

    const calculated = this.computeCalculations(merged);
    this.jobs[index] = calculated;
    this.save();
    return calculated;
  }

  updateStage(id, stageIndex) {
    const validIdx = Math.max(0, Math.min(stageIndex, STAGES.length - 1));
    return this.updateJob(id, { stageIndex: validIdx });
  }

  updatePayment(id, paymentUpdates) {
    const job = this.getJobById(id);
    if (!job) return null;

    const newPayment = {
      ...job.payment,
      ...paymentUpdates,
      paidAt: paymentUpdates.status === "Paid" ? (paymentUpdates.paidAt || new Date().toISOString()) : null,
      paidAmount: paymentUpdates.status === "Paid" ? (paymentUpdates.paidAmount || job.finalTotal) : 0
    };

    const stageUpdates = paymentUpdates.status === "Paid" ? { stageIndex: 5 } : {};

    return this.updateJob(id, {
      payment: newPayment,
      ...stageUpdates
    });
  }

  addSparePart(jobId, part) {
    const job = this.getJobById(jobId);
    if (!job) return null;

    const newPart = {
      id: `prt_${Date.now()}`,
      name: part.name || "Replacement Spare Part",
      partNumber: part.partNumber || "OEM-GEN-00",
      partCost: Number(part.partCost || part.price || 0),
      qty: Number(part.qty || 1)
    };

    const spareParts = [...(job.spareParts || []), newPart];
    return this.updateJob(jobId, { spareParts });
  }

  removeSparePart(jobId, partId) {
    const job = this.getJobById(jobId);
    if (!job) return null;

    const spareParts = (job.spareParts || []).filter((p) => p.id !== partId);
    return this.updateJob(jobId, { spareParts });
  }

  addService(jobId, service) {
    const job = this.getJobById(jobId);
    if (!job) return null;

    const newService = {
      id: `srv_${Date.now()}`,
      label: service.label || service.name || "Mechanical Service",
      category: service.category || "General",
      laborCost: Number(service.laborCost || service.labor || 0),
      duration: Number(service.duration || 20)
    };

    const services = [...(job.services || []), newService];
    return this.updateJob(jobId, { services });
  }

  removeService(jobId, serviceId) {
    const job = this.getJobById(jobId);
    if (!job) return null;

    const services = (job.services || []).filter((s) => s.id !== serviceId);
    return this.updateJob(jobId, { services });
  }

  deleteJob(id) {
    this.jobs = this.jobs.filter((j) => j.id !== id);
    if (this.activeJobId === id) {
      this.activeJobId = this.jobs[0] ? this.jobs[0].id : null;
    }
    this.save();
    return true;
  }

  resetDemoData() {
    this.jobs = INITIAL_DEMO_JOBS.map((j) => this.computeCalculations(j));
    this.activeJobId = this.jobs[0].id;
    this.save();
    return this.jobs;
  }

  getStats() {
    const totalJobs = this.jobs.length;
    const activeJobs = this.jobs.filter((j) => j.stageIndex < 5).length;
    const completedJobs = this.jobs.filter((j) => j.stageIndex === 5).length;
    const paidJobs = this.jobs.filter((j) => j.payment?.status === "Paid");
    const totalRevenue = paidJobs.reduce((sum, j) => sum + (Number(j.finalTotal) || 0), 0);
    const pendingRevenue = this.jobs
      .filter((j) => j.payment?.status !== "Paid")
      .reduce((sum, j) => sum + (Number(j.finalTotal) || 0), 0);
    
    const avgDuration = totalJobs > 0
      ? Math.round(this.jobs.reduce((sum, j) => sum + (Number(j.durationMinutes) || 0), 0) / totalJobs)
      : 0;

    return {
      totalJobs,
      activeJobs,
      completedJobs,
      totalRevenue,
      pendingRevenue,
      avgDuration
    };
  }

  filterJobs({ query = "", status = "all", payment = "all" } = {}) {
    return this.jobs.filter((j) => {
      const q = query.toLowerCase().trim();
      const matchQuery = !q ||
        j.id.toLowerCase().includes(q) ||
        j.customer?.name?.toLowerCase().includes(q) ||
        j.customer?.phone?.includes(q) ||
        j.bike?.model?.toLowerCase().includes(q) ||
        j.bike?.regNo?.toLowerCase().includes(q);

      const matchStatus = status === "all" ||
        (status === "active" && j.stageIndex < 5) ||
        (status === "completed" && j.stageIndex === 5) ||
        j.status.toLowerCase().replace(/\s+/g, "_") === status.toLowerCase() ||
        STAGES[j.stageIndex]?.id === status;

      const matchPayment = payment === "all" ||
        (payment === "paid" && j.payment?.status === "Paid") ||
        (payment === "pending" && j.payment?.status !== "Paid");

      return matchQuery && matchStatus && matchPayment;
    });
  }
}

// Global Singleton Instance
export const jobCardStore = new JobCardStore();
