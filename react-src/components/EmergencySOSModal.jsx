import React, { useState } from "react";
import { generateWhatsappSosText } from "../utils/helpers";
import { playSosPulse } from "../utils/audio";

export default function EmergencySOSModal({ isOpen, onClose }) {
  const [sosData, setSosData] = useState({
    name: "Karthik Raja",
    phone: "9894312456",
    vehicle: "Honda Activa 6G",
    reg: "TN 66 BZ 4521",
    issueType: "24x7 Hydraulic Bike Towing",
    locationName: "NH 83, Near Eachanari Toll Gate / L&T Bypass",
    notes: "Engine stalled suddenly on highway, need quick tow to workshop.",
    lat: 10.9324,
    lng: 76.9745
  });

  if (!isOpen) return null;

  const issues = [
    { id: "towing", label: "🚛 Hydraulic Bike Towing", desc: "For highway breakdowns & accidents" },
    { id: "puncture", label: "🛞 Mobile Puncture Repair", desc: "Tubeless / Tube air & patch" },
    { id: "fuel", label: "⛽ Emergency Petrol (2L)", desc: "Fuel tank dry roadside topup" },
    { id: "jumpstart", label: "⚡ 12V Battery Jumpstart", desc: "Self start dead & wiring check" },
    { id: "chain", label: "⛓️ Chain Broken / Jammed", desc: "Master link fitment & unlock" },
    { id: "ev_charge", label: "🔋 EV Emergency Mobile Charge", desc: "Ather / Ola roadside booster" }
  ];

  const handleDispatch = () => {
    playSosPulse();
    const text = generateWhatsappSosText(sosData);
    const phone = "919842299001";
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-slate-900 border border-red-500/50 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-950 via-red-900 to-slate-900 p-5 border-b border-red-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-600/30 border border-red-500 flex items-center justify-center text-xl animate-pulse">
              🚨
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-wide">
                24x7 Emergency Roadside Assistance (SOS)
              </h3>
              <p className="text-xs text-red-200 font-medium">
                Direct Dispatch to Kovai South 24/7 Mobile Breakdown Squad
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xl font-bold p-1">
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Issue Selector */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Select Emergency Breakdown Issue
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {issues.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    playSosPulse();
                    setSosData({ ...sosData, issueType: item.label });
                  }}
                  className={`p-2.5 rounded-lg border text-left transition-all ${
                    sosData.issueType === item.label
                      ? "border-red-500 bg-red-950/40 text-white shadow-md"
                      : "border-slate-800 bg-slate-800/60 text-slate-300 hover:border-slate-700"
                  }`}
                >
                  <p className="text-xs font-bold leading-tight">{item.label}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{item.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Location */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                📍 Breakdown Location (Coimbatore South / Eachanari)
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                GPS: 10.9324° N, 76.9745° E
              </span>
            </div>
            <input
              type="text"
              className="mw-input w-full text-xs sm:text-sm p-2.5 rounded-lg"
              value={sosData.locationName}
              onChange={(e) => setSosData({ ...sosData, locationName: e.target.value })}
            />
          </div>

          {/* Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Rider Name</label>
              <input
                type="text"
                className="mw-input w-full text-xs sm:text-sm p-2 rounded-lg"
                value={sosData.name}
                onChange={(e) => setSosData({ ...sosData, name: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Mobile Phone</label>
              <input
                type="tel"
                className="mw-input w-full text-xs sm:text-sm p-2 rounded-lg font-mono"
                value={sosData.phone}
                onChange={(e) => setSosData({ ...sosData, phone: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Two-Wheeler Model</label>
              <input
                type="text"
                className="mw-input w-full text-xs sm:text-sm p-2 rounded-lg"
                value={sosData.vehicle}
                onChange={(e) => setSosData({ ...sosData, vehicle: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Registration No.</label>
              <input
                type="text"
                className="mw-input w-full text-xs sm:text-sm p-2 rounded-lg font-mono uppercase"
                value={sosData.reg}
                onChange={(e) => setSosData({ ...sosData, reg: e.target.value })}
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Remarks</label>
            <textarea
              className="mw-input w-full text-xs p-2.5 rounded-lg min-h-[60px] resize-none"
              value={sosData.notes}
              onChange={(e) => setSosData({ ...sosData, notes: e.target.value })}
            ></textarea>
          </div>

          {/* Hotline */}
          <div className="bg-red-950/50 border border-red-800/80 p-3 rounded-xl flex items-center justify-between gap-2">
            <div className="text-xs">
              <p className="font-bold text-red-200">24x7 Roadside Dispatch Control Room</p>
              <p className="text-[11px] text-red-300 font-mono">+91 98422 99001 · +91 98943 12456</p>
            </div>
            <a
              href="tel:+919842299001"
              className="bg-red-600 hover:bg-red-500 text-white text-xs font-bold px-3 py-2 rounded-lg shadow"
            >
              📞 Call Now
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-950 p-4 border-t border-slate-800 flex items-center justify-between gap-3">
          <button onClick={onClose} className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white">
            Cancel
          </button>
          <button
            onClick={handleDispatch}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold px-5 py-2.5 rounded-lg flex items-center gap-2 shadow-lg"
          >
            <span>📲</span> Dispatch SOS Alert via WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
}
