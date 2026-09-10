import React, { useState, useEffect } from "react";
import { formatClock, formatDateShort } from "../utils/helpers";
import { toggleSound, isSoundEnabled } from "../utils/audio";

export default function Header({ onOpenSos }) {
  const [now, setNow] = useState(new Date());
  const [soundOn, setSoundOn] = useState(isSoundEnabled());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSoundToggle = () => {
    const state = toggleSound();
    setSoundOn(state);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#0E131C]/95 backdrop-blur-md border-b border-amber-500/20 px-4 sm:px-6 py-3.5 shadow-xl">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-2xl shadow-inner">
            🏍️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide leading-none font-heading">
                QUICKMOTO AI GARAGE
              </h1>
              <span className="mw-badge-glow px-2 py-0.5 rounded text-[10px] font-bold uppercase hidden sm:inline-block">
                PRO V2.5
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
              <span className="text-amber-400">📍</span> Eachanari Vinayagar Temple NH 83, Coimbatore · Ph: +91 98943 12456
            </p>
          </div>
        </div>

        {/* Controls & Live Time */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800 text-xs font-mono text-slate-300 flex items-center gap-1.5">
            <span className="text-amber-400">🕒</span>
            <span>{formatDateShort(now)}</span> · <span className="font-bold text-white">{formatClock(now)}</span>
          </div>

          <button
            onClick={handleSoundToggle}
            className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 font-semibold transition-colors"
            title="Toggle Mechanical Workshop Audio"
          >
            {soundOn ? "🔊 Audio ON" : "🔇 Muted"}
          </button>

          <button
            onClick={onOpenSos}
            className="mw-btn-sos px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5"
          >
            <span>🚨</span> 24/7 Roadside SOS
          </button>
        </div>
      </div>
    </header>
  );
}
