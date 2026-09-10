/**
 * Nearby Motor Services & Towing Hub Directory Component
 * With Live GPS Location Detection, Interactive Google Map & Directions
 * QuickMoto AI Garage
 */

import { NEARBY_MOTOR_SERVICES } from "../data/nearbyServices.js";
import { calculateDistanceKm } from "../utils/helpers.js";
import { playClickSound, playSuccessChime } from "../utils/audio.js";

export class NearbyServicesHub {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    this.services = [...NEARBY_MOTOR_SERVICES];
    this.selectedCategory = "all";
    this.searchQuery = "";
    this.sortBy = "distance"; // distance | rating
    
    // Default reference location (Eachanari Vinayagar Temple NH 83)
    this.userLocation = {
      lat: 10.9324,
      lng: 76.9745,
      name: "Eachanari Vinayagar Temple (NH 83, Coimbatore)",
      key: "eachanari",
      isLiveGps: false,
      isDetecting: false
    };

    this.selectedServiceId = "eam-prime"; // Default selected workshop for map preview
    this.onSelectService = options.onSelectService || (() => {});
    this.onOpenSos = options.onOpenSos || (() => {
      window.quickMotoApp?.sosModal?.open();
      window.app?.sosModal?.open();
    });
    
    this.recalculateDistances();
    this.render();
  }

  detectLiveGps() {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser. Please select a Coimbatore landmark below.");
      return;
    }

    this.userLocation.isDetecting = true;
    this.render();

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        this.userLocation = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          name: `My Live GPS (${pos.coords.latitude.toFixed(4)}°, ${pos.coords.longitude.toFixed(4)}°)`,
          key: "live",
          isLiveGps: true,
          isDetecting: false
        };
        playSuccessChime();
        this.recalculateDistances();
        this.render();
      },
      (err) => {
        console.warn("GPS error:", err);
        this.userLocation.isDetecting = false;
        alert("GPS permission was denied or unavailable. Using Eachanari Temple reference location.");
        this.render();
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }

  setLandmarkLocation(key) {
    const landmarks = {
      eachanari: { lat: 10.9324, lng: 76.9745, name: "Eachanari Vinayagar Temple (NH 83)" },
      sundarapuram: { lat: 10.9502, lng: 76.9691, name: "Sundarapuram Junction" },
      malumichampatti: { lat: 10.9150, lng: 76.9850, name: "Malumichampatti Bypass" },
      kurichi: { lat: 10.9580, lng: 76.9610, name: "Kurichi SIDCO Industrial Area" },
      podanur: { lat: 10.9650, lng: 76.9850, name: "Podanur Railway Station Junction" },
      kuniamuthur: { lat: 10.9630, lng: 76.9410, name: "Kuniamuthur (Palakkad Rd)" },
      singanallur: { lat: 10.9920, lng: 77.0210, name: "Singanallur Junction (Trichy Rd)" },
      ukkadam: { lat: 10.9880, lng: 76.9580, name: "Ukkadam Bus Stand" },
      gandhipuram: { lat: 11.0168, lng: 76.9688, name: "Gandhipuram Central" },
      kinathukadavu: { lat: 10.8250, lng: 77.0200, name: "Kinathukadavu Main Road" }
    };

    if (landmarks[key]) {
      this.userLocation = {
        ...landmarks[key],
        key,
        isLiveGps: false,
        isDetecting: false
      };
      playClickSound();
      this.recalculateDistances();
      this.render();
    }
  }

  recalculateDistances() {
    this.services = this.services.map((svc) => {
      const dist = calculateDistanceKm(
        this.userLocation.lat,
        this.userLocation.lng,
        svc.lat,
        svc.lng
      );
      // Average 2.2 mins per km in city traffic
      const eta = Math.max(1, Math.round(dist * 2.2));
      return {
        ...svc,
        distanceKm: dist,
        etaMins: eta
      };
    });

    if (this.sortBy === "distance") {
      this.services.sort((a, b) => a.distanceKm - b.distanceKm);
    } else if (this.sortBy === "rating") {
      this.services.sort((a, b) => b.rating - a.rating);
    }
  }

  setCategory(catId) {
    this.selectedCategory = catId;
    playClickSound();
    this.render();
  }

  setSearchQuery(q) {
    this.searchQuery = q.toLowerCase();
    this.render();
  }

  selectService(id) {
    this.selectedServiceId = id;
    playClickSound();
    this.render();
  }

  getFilteredServices() {
    return this.services.filter((svc) => {
      const matchesCat = this.selectedCategory === "all" || svc.category === this.selectedCategory;
      if (!matchesCat) return false;
      if (!this.searchQuery) return true;
      const query = this.searchQuery;
      return (
        svc.name.toLowerCase().includes(query) ||
        svc.brandSpeciality.toLowerCase().includes(query) ||
        svc.address.toLowerCase().includes(query) ||
        svc.landmark?.toLowerCase().includes(query) ||
        svc.tagline.toLowerCase().includes(query) ||
        svc.services.some((s) => s.toLowerCase().includes(query))
      );
    });
  }

  getCategoryCount(id) {
    if (id === "all") return this.services.length;
    return this.services.filter((s) => s.category === id).length;
  }

  getCategoryIcon(id) {
    switch (id) {
      case "authorized": return "🛡️";
      case "emergency_towing": return "🚨";
      case "specialist": return "🔧";
      case "ev_hub": return "⚡";
      case "wash_detailing": return "✨";
      default: return "📍";
    }
  }

  render() {
    if (!this.container) return;
    const filtered = this.getFilteredServices();
    const selectedSvc = this.services.find((s) => s.id === this.selectedServiceId) || this.services[0];

    const simpleCategories = [
      { id: "all", label: "All Workshops", count: this.services.length },
      { id: "authorized", label: "Authorized Showrooms (Honda, TVS, Hero, Yamaha, Suzuki)", count: this.getCategoryCount("authorized") },
      { id: "emergency_towing", label: "24/7 Breakdown & Towing", count: this.getCategoryCount("emergency_towing") },
      { id: "specialist", label: "Local Mechanic Specialists", count: this.getCategoryCount("specialist") },
      { id: "ev_hub", label: "EV Electric Scooters & Charging", count: this.getCategoryCount("ev_hub") },
      { id: "wash_detailing", label: "Water Wash & Detailing", count: this.getCategoryCount("wash_detailing") }
    ];

    // Build Google Map Embed URL
    const mapEmbedUrl = `https://maps.google.com/maps?q=${selectedSvc.lat},${selectedSvc.lng}+(${encodeURIComponent(selectedSvc.name)})&t=&z=15&ie=UTF8&iwloc=B&output=embed`;
    
    // Live directions link from user location to selected workshop
    const directionsUrl = `https://www.google.com/maps/dir/?api=1&origin=${this.userLocation.lat},${this.userLocation.lng}&destination=${selectedSvc.lat},${selectedSvc.lng}&travelmode=driving`;

    this.container.innerHTML = `
      <div class="space-y-6">
        <!-- Live GPS & Location Hero Banner -->
        <div class="mw-nearby-hero p-5 sm:p-6 rounded-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-5 border border-slate-200 dark:border-slate-800 shadow-sm bg-gradient-to-r from-slate-900 via-[#141B2D] to-slate-900 text-white">
          <div class="space-y-2 max-w-2xl">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30">
                🗺️ Live GPS &amp; Google Map Locator
              </span>
              <span class="text-xs ${this.userLocation.isLiveGps ? "text-emerald-400 bg-emerald-950/80 border border-emerald-500/30" : "text-amber-300 bg-amber-950/80 border border-amber-500/30"} font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                <span class="mw-live-pulse-dot"></span>
                ${this.userLocation.isLiveGps ? "Live GPS Connected" : "Custom Location Selected"}
              </span>
              <span class="text-xs text-slate-300 bg-slate-800/80 px-2 py-0.5 rounded-md font-mono">
                ${this.services.length} Centers in Coimbatore
              </span>
            </div>
            
            <h2 class="text-xl sm:text-2xl font-black tracking-tight font-heading text-white">
              Nearby Two-Wheeler Workshops &amp; 24/7 Breakdown Towing
            </h2>
            
            <p class="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
              Current Location: <strong class="text-amber-400 font-bold">${this.userLocation.name}</strong>. Distances and driving times are calculated in real-time from your coordinates.
            </p>
          </div>

          <!-- GPS Detection Button & SOS Action -->
          <div class="flex items-center gap-2.5 flex-wrap">
            <button
              id="btn-detect-live-gps"
              class="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2 shadow-md transition-all ${this.userLocation.isDetecting ? "animate-pulse" : ""}"
            >
              <span>📍</span> ${this.userLocation.isDetecting ? "Detecting GPS..." : "Detect My Live GPS Location"}
            </button>
            <button
              id="btn-open-sos-nearby"
              class="mw-btn-sos px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-md"
            >
              <span>🚨</span> 24/7 Roadside SOS
            </button>
          </div>
        </div>

        <!-- Search Bar, Landmark Selector, and Sort -->
        <div class="grid grid-cols-1 md:grid-cols-12 gap-3">
          <!-- Search input (5 cols) -->
          <div class="md:col-span-5 relative">
            <input
              id="nearby-search-input"
              type="text"
              class="mw-input w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl"
              placeholder="Search by bike (Honda, Hero, RE, Yamaha), service (Towing, Lathe, Puncture), or area..."
              value="${this.searchQuery}"
            />
            <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
            ${this.searchQuery ? `<button id="btn-clear-search" class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white font-bold">✕ Clear</button>` : ""}
          </div>

          <!-- Landmark Location Picker (4 cols) -->
          <div class="md:col-span-4">
            <select id="nearby-location-select" class="mw-input w-full px-3 py-2.5 text-xs sm:text-sm rounded-xl font-medium">
              <option value="eachanari" ${this.userLocation.key === "eachanari" ? "selected" : ""}>📍 Landmark: Eachanari Vinayagar Temple (NH 83)</option>
              <option value="sundarapuram" ${this.userLocation.key === "sundarapuram" ? "selected" : ""}>📍 Landmark: Sundarapuram Junction</option>
              <option value="malumichampatti" ${this.userLocation.key === "malumichampatti" ? "selected" : ""}>📍 Landmark: Malumichampatti Bypass</option>
              <option value="kurichi" ${this.userLocation.key === "kurichi" ? "selected" : ""}>📍 Landmark: Kurichi SIDCO Industrial</option>
              <option value="podanur" ${this.userLocation.key === "podanur" ? "selected" : ""}>📍 Landmark: Podanur Railway Station</option>
              <option value="kuniamuthur" ${this.userLocation.key === "kuniamuthur" ? "selected" : ""}>📍 Landmark: Kuniamuthur (Palakkad Rd)</option>
              <option value="singanallur" ${this.userLocation.key === "singanallur" ? "selected" : ""}>📍 Landmark: Singanallur (Trichy Rd)</option>
              <option value="ukkadam" ${this.userLocation.key === "ukkadam" ? "selected" : ""}>📍 Landmark: Ukkadam Bus Stand</option>
              <option value="gandhipuram" ${this.userLocation.key === "gandhipuram" ? "selected" : ""}>📍 Landmark: Gandhipuram Central</option>
              <option value="kinathukadavu" ${this.userLocation.key === "kinathukadavu" ? "selected" : ""}>📍 Landmark: Kinathukadavu Main Road</option>
            </select>
          </div>

          <!-- Sort Selector (3 cols) -->
          <div class="md:col-span-3">
            <select id="nearby-sort-select" class="mw-input w-full px-3 py-2.5 text-xs sm:text-sm rounded-xl font-bold">
              <option value="distance" ${this.sortBy === "distance" ? "selected" : ""}>⚡ Nearest Distance First</option>
              <option value="rating" ${this.sortBy === "rating" ? "selected" : ""}>⭐ Highest Rating First</option>
            </select>
          </div>
        </div>

        <!-- Category Pills Bar -->
        <div class="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          ${simpleCategories.map((cat) => `
            <button
              data-category="${cat.id}"
              class="mw-pill-btn px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all ${
                this.selectedCategory === cat.id ? "mw-pill-btn-active" : ""
              }"
            >
              ${this.getCategoryIcon(cat.id)}
              <span>${cat.label}</span>
              <span class="mw-pill-badge">${cat.count}</span>
            </button>
          `).join("")}
        </div>

        <!-- Interactive Google Map & List Split View -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          <!-- Column 1: Live Interactive Google Map Frame (5 cols on Desktop) -->
          <div class="lg:col-span-5 mw-card rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161D2C] shadow-md sticky top-[135px]">
            
            <!-- Map Top Bar -->
            <div class="p-4 bg-slate-50 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span class="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider block">
                  📍 Selected Center on Google Map:
                </span>
                <h3 class="text-sm font-bold text-slate-900 dark:text-white leading-tight font-heading">
                  ${selectedSvc.name}
                </h3>
              </div>
              <span class="font-mono text-xs font-bold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/60 px-2.5 py-1 rounded-lg">
                ${selectedSvc.distanceKm === 0 ? "On-Site" : `${selectedSvc.distanceKm} km`}
              </span>
            </div>

            <!-- Live Google Map Iframe -->
            <div class="w-full h-[280px] sm:h-[320px] bg-slate-100 dark:bg-slate-950 relative">
              <iframe
                title="Google Maps Live Location"
                width="100%"
                height="100%"
                frameborder="0"
                scrolling="no"
                marginheight="0"
                marginwidth="0"
                src="${mapEmbedUrl}"
                class="w-full h-full border-0"
                loading="lazy"
              ></iframe>
            </div>

            <!-- Map Footer with Direct Navigation -->
            <div class="p-4 bg-white dark:bg-[#161D2C] space-y-2.5">
              <div class="text-xs text-slate-600 dark:text-slate-300">
                <p class="font-bold text-slate-900 dark:text-white flex items-start gap-1.5">
                  <span>📍</span>
                  <span>${selectedSvc.address}</span>
                </p>
                <p class="text-[11px] text-slate-500 mt-1">
                  🚗 Driving Travel Time: <strong class="text-slate-900 dark:text-white font-bold">~${selectedSvc.etaMins} mins</strong> (${selectedSvc.distanceKm} km)
                </p>
              </div>

              <div class="flex items-center gap-2 pt-1">
                <a
                  href="${directionsUrl}"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all text-center"
                >
                  <span>🗺️</span> Open Driving Directions
                </a>
                <a
                  href="tel:${selectedSvc.rawPhone}"
                  class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-3.5 rounded-xl text-xs flex items-center justify-center gap-1 shadow-sm"
                  title="Call Workshop"
                >
                  📞 Call
                </a>
              </div>
            </div>
          </div>

          <!-- Column 2: Workshop Cards List (7 cols on Desktop) -->
          <div class="lg:col-span-7 space-y-3.5">
            <div class="flex items-center justify-between px-1">
              <span class="text-xs font-bold text-slate-700 dark:text-slate-300">
                Showing ${filtered.length} Workshops (Tap any card to preview on map)
              </span>
              <span class="text-[11px] text-slate-500 font-mono">
                Sorted by ${this.sortBy === "distance" ? "Nearest Distance" : "Top Rating"}
              </span>
            </div>

            ${filtered.length === 0 ? `
              <div class="mw-card p-10 text-center space-y-3 bg-white dark:bg-[#161D2C] rounded-2xl border border-slate-200 dark:border-slate-800">
                <div class="text-4xl">🔍</div>
                <h3 class="text-base font-bold text-slate-900 dark:text-white">No workshops found matching "${this.searchQuery}"</h3>
                <p class="text-xs text-slate-500">Try searching for "Honda", "Puncture", "Towing", "Yamaha", "Royal Enfield", or reset the filter.</p>
                <button id="btn-reset-filters" class="mw-btn-primary px-4 py-2 rounded-xl text-xs font-bold mt-2">
                  Show All 16 Workshops
                </button>
              </div>
            ` : filtered.map((svc) => {
              const isSelected = svc.id === this.selectedServiceId;
              const isPrime = svc.isSelf;
              const badgeColorClass = svc.is24x7 ? "badge-red" : svc.category === "authorized" ? "badge-cyan" : "badge-amber";

              return `
                <div
                  data-svc-id="${svc.id}"
                  class="btn-select-workshop mw-service-card p-4 sm:p-5 rounded-2xl flex flex-col justify-between transition-all cursor-pointer ${
                    isSelected ? "ring-2 ring-amber-500 bg-amber-50/40 dark:bg-amber-950/20 shadow-md" : ""
                  } ${isPrime && !isSelected ? "mw-service-card-prime" : ""}"
                >
                  <div>
                    <div class="flex items-start justify-between gap-2 mb-2">
                      <div class="flex items-center gap-1.5 flex-wrap">
                        <span class="mw-svc-badge ${badgeColorClass} text-[11px] font-bold px-2 py-0.5 rounded-md">
                          ${svc.badge}
                        </span>
                        ${svc.is24x7 ? `
                          <span class="mw-badge-247 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <span class="mw-live-pulse-dot"></span> 24x7 Active
                          </span>
                        ` : `
                          <span class="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                            ● Open Now (${svc.timings})
                          </span>
                        `}
                      </div>

                      <div class="text-right">
                        <span class="font-mono text-xs font-black text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 rounded-md">
                          ${svc.distanceKm === 0 ? "📍 On-Site" : `${svc.distanceKm} km`}
                        </span>
                        ${svc.etaMins > 0 ? `<p class="text-[10px] text-slate-500 font-bold mt-0.5">~${svc.etaMins} mins drive</p>` : ""}
                      </div>
                    </div>

                    <h3 class="text-base font-bold text-slate-900 dark:text-white leading-snug mb-0.5 font-heading">
                      ${svc.name}
                    </h3>
                    <p class="text-xs text-amber-700 dark:text-amber-400 font-bold mb-2">
                      ${svc.brandSpeciality}
                    </p>
                    <p class="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 mb-3 font-medium">
                      ${svc.tagline}
                    </p>

                    <div class="text-xs text-slate-600 dark:text-slate-400 space-y-1 mb-3 bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                      <p class="flex items-start gap-1.5">
                        <span class="text-amber-600">📍</span>
                        <span class="line-clamp-1">${svc.address}</span>
                      </p>
                      ${svc.landmark ? `
                        <p class="text-[11px] text-slate-500 pl-4">
                          Landmark: <strong>${svc.landmark}</strong>
                        </p>
                      ` : ""}
                    </div>

                    <div class="flex flex-wrap gap-1.5 mb-3.5">
                      ${svc.services.map((tag) => `
                        <span class="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                          ${tag}
                        </span>
                      `).join("")}
                    </div>
                  </div>

                  <div class="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2" onclick="event.stopPropagation()">
                    <div class="flex items-center gap-1">
                      <span class="text-amber-500 text-xs">★</span>
                      <span class="text-xs font-bold text-slate-900 dark:text-white">${svc.rating}</span>
                      <span class="text-[10px] text-slate-500">(${svc.reviewCount} reviews)</span>
                    </div>

                    <div class="flex items-center gap-1.5">
                      <a
                        href="tel:${svc.rawPhone}"
                        class="mw-svc-btn-call px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 text-white shadow-sm"
                      >
                        📞 Call
                      </a>
                      <a
                        href="https://wa.me/${svc.rawPhone}?text=${encodeURIComponent(`Hi ${svc.name}, I found your workshop location on QuickMoto AI Garage. I need assistance with my two-wheeler.`)}"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="mw-svc-btn-wa px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 text-white shadow-sm"
                      >
                        💬 WhatsApp
                      </a>
                      <a
                        href="https://www.google.com/maps/dir/?api=1&origin=${this.userLocation.lat},${this.userLocation.lng}&destination=${svc.lat},${svc.lng}&travelmode=driving"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm transition-all"
                      >
                        🗺️ Map
                      </a>
                    </div>
                  </div>
                </div>
              `;
            }).join("")}
          </div>

        </div>
      </div>
    `;

    this.attachEvents();
  }

  attachEvents() {
    // GPS Detect
    const gpsBtn = this.container.querySelector("#btn-detect-live-gps");
    if (gpsBtn) {
      gpsBtn.addEventListener("click", () => this.detectLiveGps());
    }

    // SOS Modal trigger from nearby
    const sosBtn = this.container.querySelector("#btn-open-sos-nearby");
    if (sosBtn) {
      sosBtn.addEventListener("click", () => {
        if (this.onOpenSos) {
          this.onOpenSos();
        } else {
          window.quickMotoApp?.sosModal?.open();
          window.app?.sosModal?.open();
        }
      });
    }

    // Search input
    const searchInput = this.container.querySelector("#nearby-search-input");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        this.setSearchQuery(e.target.value);
      });
    }

    const clearBtn = this.container.querySelector("#btn-clear-search");
    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        this.setSearchQuery("");
      });
    }

    const resetBtn = this.container.querySelector("#btn-reset-filters");
    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        this.selectedCategory = "all";
        this.searchQuery = "";
        this.render();
      });
    }

    // Landmark picker
    const landmarkSelect = this.container.querySelector("#nearby-location-select");
    if (landmarkSelect) {
      landmarkSelect.addEventListener("change", (e) => {
        this.setLandmarkLocation(e.target.value);
      });
    }

    // Sort select
    const sortSelect = this.container.querySelector("#nearby-sort-select");
    if (sortSelect) {
      sortSelect.addEventListener("change", (e) => {
        this.sortBy = e.target.value;
        this.recalculateDistances();
        this.render();
      });
    }

    // Category pills
    const pillBtns = this.container.querySelectorAll(".mw-pill-btn");
    pillBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const cat = btn.getAttribute("data-category");
        this.setCategory(cat);
      });
    });

    // Workshop card click to select for map preview
    const workshopCards = this.container.querySelectorAll(".btn-select-workshop");
    workshopCards.forEach((card) => {
      card.addEventListener("click", () => {
        const id = card.getAttribute("data-svc-id");
        this.selectService(id);
      });
    });
  }
}
