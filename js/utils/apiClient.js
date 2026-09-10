/**
 * QuickMoto AI Garage — Master REST API Client Bridge
 * Connects all frontend views to the Python backend with automatic offline fallback
 */

const API_BASE = window.location.origin;

class ApiClient {
  constructor() {
    this.isOnline = true;
    this.checkHealth();
  }

  async checkHealth() {
    try {
      const res = await fetch(`${API_BASE}/api/health`, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        this.isOnline = true;
        this.updateBadge(true, data);
        return data;
      }
      this.isOnline = false;
      this.updateBadge(false);
      return null;
    } catch (e) {
      this.isOnline = false;
      this.updateBadge(false);
      return null;
    }
  }

  updateBadge(isHealthy, data) {
    const badge = document.getElementById("backend-status-badge");
    if (!badge) return;
    if (isHealthy) {
      badge.className = "px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-500/15 border border-emerald-500/40 text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5 shadow-sm";
      badge.innerHTML = `<span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> REST API Backend Online (${data?.database?.active_jobcards || 0} Jobs)`;
    } else {
      badge.className = "px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-500/15 border border-amber-500/40 text-amber-700 dark:text-amber-400 flex items-center gap-1.5 shadow-sm";
      badge.innerHTML = `<span class="w-2 h-2 rounded-full bg-amber-500"></span> Client-Local Mode`;
    }
  }

  async diagnoseComplaint(payload) {
    try {
      const res = await fetch(`${API_BASE}/api/diagnose`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        return await res.json();
      }
      throw new Error(`API Error: ${res.status}`);
    } catch (e) {
      console.warn("Falling back to client-side diagnosis computation:", e);
      return null; // Signals caller to use client-side fallback
    }
  }

  async saveJobCard(jobcard) {
    try {
      const res = await fetch(`${API_BASE}/api/jobcards`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(jobcard)
      });
      if (res.ok) {
        return await res.json();
      }
      throw new Error(`Save JobCard Error: ${res.status}`);
    } catch (e) {
      console.warn("Jobcard saved to localStorage fallback:", e);
      return null;
    }
  }

  async getAllJobCards() {
    try {
      const res = await fetch(`${API_BASE}/api/jobcards`, { cache: "no-store" });
      if (res.ok) {
        return await res.json();
      }
      throw new Error(`Fetch Jobcards Error: ${res.status}`);
    } catch (e) {
      return null;
    }
  }

  async updateJobStage(jobId, stageIndex) {
    try {
      const res = await fetch(`${API_BASE}/api/jobcards/${encodeURIComponent(jobId)}/stage`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stageIndex })
      });
      if (res.ok) {
        return await res.json();
      }
      throw new Error(`Update Stage Error: ${res.status}`);
    } catch (e) {
      return null;
    }
  }

  async markPaymentSettled(jobId, paymentDetails = {}) {
    try {
      const res = await fetch(`${API_BASE}/api/jobcards/${encodeURIComponent(jobId)}/payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(paymentDetails)
      });
      if (res.ok) {
        return await res.json();
      }
      throw new Error(`Payment Settle Error: ${res.status}`);
    } catch (e) {
      return null;
    }
  }

  async sendEmergencySOS(payload) {
    try {
      const res = await fetch(`${API_BASE}/api/sos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        return await res.json();
      }
      throw new Error(`SOS Dispatch Error: ${res.status}`);
    } catch (e) {
      return null;
    }
  }

  async bookDoorstepPickup(payload) {
    try {
      const res = await fetch(`${API_BASE}/api/pickup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        return await res.json();
      }
      throw new Error(`Pickup Booking Error: ${res.status}`);
    } catch (e) {
      return null;
    }
  }

  async getSparesInventory() {
    try {
      const res = await fetch(`${API_BASE}/api/spares`, { cache: "no-store" });
      if (res.ok) {
        return await res.json();
      }
      throw new Error(`Fetch Spares Error: ${res.status}`);
    } catch (e) {
      return null;
    }
  }

  async pullSparePart(partName, quantity = 1) {
    try {
      const res = await fetch(`${API_BASE}/api/spares/pull`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ partName, quantity })
      });
      if (res.ok) {
        return await res.json();
      }
      throw new Error(`Spare Pull Error: ${res.status}`);
    } catch (e) {
      return null;
    }
  }
}

export const apiClient = new ApiClient();
