import React, { useState, useEffect } from "react";
import { NEARBY_MOTOR_SERVICES } from "../data/nearbyServices";
import { calculateDistanceKm } from "../utils/helpers";
import { playClickSound, playSuccessChime } from "../utils/audio";

export default function NearbyServicesHub({ onOpenSos }) {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("distance");
  const [selectedServiceId, setSelectedServiceId] = useState("eam-prime");

  const [userLocation, setUserLocation] = useState({
    lat: 10.9324,
    lng: 76.9745,
    name: "Eachanari Vinayagar Temple (Coimbatore)",
    isLiveGps: false,
    isDetecting: false
  });

  const detectLiveGps = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setUserLocation((prev) => ({ ...prev, isDetecting: true }));
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          name: `My Live GPS (${pos.coords.latitude.toFixed(4)}°, ${pos.coords.longitude.toFixed(4)}°)`,
          isLiveGps: true,
          isDetecting: false
        });
        playSuccessChime();
      },
      () => {
        setUserLocation((prev) => ({ ...prev, isDetecting: false }));
        alert("Could not access live GPS. You can choose a landmark from the dropdown.");
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleLandmarkChange = (key) => {
    const landmarks = {
      eachanari: { lat: 10.9324, lng: 76.9745, name: "Eachanari Vinayagar Temple (NH 83)" },
      sundarapuram: { lat: 10.9502, lng: 76.9691, name: "Sundarapuram Junction" },
      malumichampatti: { lat: 10.9150, lng: 76.9850, name: "Malumichampatti Bypass" },
      kurichi: { lat: 10.9580, lng: 76.9610, name: "Kurichi SIDCO Industrial Area" },
      podanur: { lat: 10.9650, lng: 76.9850, name: "Podanur Railway Station Junction" }
    };
    if (landmarks[key]) {
      setUserLocation({ ...landmarks[key], isLiveGps: false, isDetecting: false });
      playClickSound();
    }
  };

  const servicesWithDistance = NEARBY_MOTOR_SERVICES.map((svc) => {
    const dist = calculateDistanceKm(userLocation.lat, userLocation.lng, svc.lat, svc.lng);
    const eta = Math.max(1, Math.round(dist * 2.2));
    return { ...svc, distanceKm: dist, etaMins: eta };
  });

  if (sortBy === "distance") {
    servicesWithDistance.sort((a, b) => a.distanceKm - b.distanceKm);
  } else {
    servicesWithDistance.sort((a, b) => b.rating - a.rating);
  }

  const filtered = servicesWithDistance.filter((svc) => {
    const matchesCat = selectedCategory === "all" || svc.category === selectedCategory;
    if (!matchesCat) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      svc.name.toLowerCase().includes(q) ||
      svc.brandSpeciality.toLowerCase().includes(q) ||
      svc.address.toLowerCase().includes(q) ||
      svc.tagline.toLowerCase().includes(q) ||
      svc.services.some((s) => s.toLowerCase().includes(q))
    );
  });

  const selectedSvc = servicesWithDistance.find((s) => s.id === selectedServiceId) || servicesWithDistance[0];
  const mapEmbedUrl = `https://maps.google.com/maps?q=${selectedSvc.lat},${selectedSvc.lng}+(${encodeURIComponent(selectedSvc.name)})&t=&z=15&ie=UTF8&iwloc=B&output=embed`;
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${selectedSvc.lat},${selectedSvc.lng}&travelmode=driving`;

  return (
    <div className="space-y-6">
      {/* Live GPS Hero */}
      <div className="mw-nearby-hero p-5 sm:p-6 rounded-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-5 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="mw-badge-glow px-2.5 py-0.5 rounded-full text-xs font-bold uppercase">
              🗺️ Live GPS Location &amp; Google Map
            </span>
            <span className={`text-xs ${userLocation.isLiveGps ? "text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60" : "text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60"} font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1.5`}>
              <span className="mw-live-pulse-dot"></span>
              {userLocation.isLiveGps ? "Live GPS Connected" : "Custom Location Selected"}
            </span>
          </div>
          
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Nearby Two-Wheeler Workshops &amp; 24/7 Breakdown Towing
          </h2>
          
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
            Current Location: <strong className="text-slate-900 dark:text-white font-bold">{userLocation.name}</strong>. Distances are calculated live from your location.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={detectLiveGps}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2 shadow-md transition-all ${userLocation.isDetecting ? "animate-pulse" : ""}`}
          >
            <span>📍</span> {userLocation.isDetecting ? "Finding GPS..." : "Detect My Live GPS Location"}
          </button>
          <button
            onClick={onOpenSos}
            className="mw-btn-sos px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-md"
          >
            <span>🚨</span> 24/7 Roadside SOS
          </button>
        </div>
      </div>

      {/* Search & Location Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="md:col-span-2 relative">
          <input
            type="text"
            className="mw-input w-full pl-10 pr-4 py-2.5 text-sm rounded-xl"
            placeholder="Search by bike brand (Honda, Hero, RE, Ather), service, or street..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
        </div>

        <div>
          <select
            className="mw-input w-full px-3 py-2.5 text-xs sm:text-sm rounded-xl appearance-none font-medium"
            onChange={(e) => handleLandmarkChange(e.target.value)}
          >
            <option value="eachanari">📍 Landmark: Eachanari Temple</option>
            <option value="sundarapuram">📍 Landmark: Sundarapuram Junction</option>
            <option value="malumichampatti">📍 Landmark: Malumichampatti Bypass</option>
            <option value="kurichi">📍 Landmark: Kurichi SIDCO Industrial</option>
            <option value="podanur">📍 Landmark: Podanur Station</option>
          </select>
        </div>

        <div>
          <select
            className="mw-input w-full px-3 py-2.5 text-xs sm:text-sm rounded-xl appearance-none font-bold"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="distance">⚡ Sort: Closest to Me First</option>
            <option value="rating">⭐ Sort: Highest Rating</option>
          </select>
        </div>
      </div>

      {/* Interactive Google Map & Split List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Google Map Sticky Frame */}
        <div className="lg:col-span-5 mw-card rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md sticky top-[135px]">
          <div className="p-4 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider block">
                📍 Selected Center on Map:
              </span>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                {selectedSvc.name}
              </h3>
            </div>
            <span className="font-mono text-xs font-bold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/60 px-2 py-1 rounded-lg">
              {selectedSvc.distanceKm === 0 ? "On-Site" : `${selectedSvc.distanceKm} km`}
            </span>
          </div>

          <div className="w-full h-[280px] sm:h-[320px] bg-slate-100 dark:bg-slate-950">
            <iframe
              title="Google Map Live View"
              width="100%"
              height="100%"
              frameBorder="0"
              src={mapEmbedUrl}
              className="w-full h-full border-0"
              loading="lazy"
            ></iframe>
          </div>

          <div className="p-4 bg-white dark:bg-slate-900 space-y-2.5">
            <div className="text-xs text-slate-600 dark:text-slate-300">
              <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
                <span>📍</span> {selectedSvc.address}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Travel Time: <strong className="text-slate-900 dark:text-white font-bold">~{selectedSvc.etaMins} mins</strong>
              </p>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                class="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all text-center"
              >
                <span>🗺️</span> Get Driving Directions on Google Maps
              </a>
              <a
                href={`tel:${selectedSvc.rawPhone}`}
                className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2.5 px-3.5 rounded-xl text-xs flex items-center justify-center gap-1 shadow-sm"
              >
                📞 Call
              </a>
            </div>
          </div>
        </div>

        {/* Cards List */}
        <div className="lg:col-span-7 space-y-3.5">
          {filtered.map((svc) => (
            <div
              key={svc.id}
              onClick={() => setSelectedServiceId(svc.id)}
              className={`mw-service-card p-4 sm:p-5 rounded-2xl flex flex-col justify-between transition-all cursor-pointer ${
                svc.id === selectedServiceId ? "ring-2 ring-amber-500 bg-amber-50/40 dark:bg-amber-950/20 shadow-md" : ""
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">{svc.name}</span>
                  <span className="font-mono text-xs font-bold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 rounded-md">
                    {svc.distanceKm === 0 ? "📍 On-Site" : `${svc.distanceKm} km`}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 mb-2">{svc.tagline}</p>
                <p className="text-[11px] text-slate-500">📍 {svc.address}</p>
              </div>

              <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
                <span className="text-xs font-bold text-amber-500">★ {svc.rating}</span>
                <div className="flex items-center gap-1.5">
                  <a href={`tel:${svc.rawPhone}`} className="mw-svc-btn-call px-3 py-1.5 rounded-lg text-xs font-bold text-white">📞 Call</a>
                  <a href={`https://wa.me/${svc.rawPhone}`} target="_blank" rel="noopener noreferrer" className="mw-svc-btn-wa px-3 py-1.5 rounded-lg text-xs font-bold text-white">💬 WhatsApp</a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
