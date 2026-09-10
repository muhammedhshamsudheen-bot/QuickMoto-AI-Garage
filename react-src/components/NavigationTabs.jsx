import React from "react";

export default function NavigationTabs({ activeTab, onSelectTab }) {
  const tabs = [
    { id: "diagnosis", label: "AI Job Card & Diagnosis", icon: "📋" },
    { id: "nearby", label: "Nearby Motor Services & Towing", icon: "🗺️", badge: "11 Centers" },
    { id: "inspection", label: "21-Point Digital Inspection (DVI)", icon: "🔍" },
    { id: "bays", label: "Live Bay Kanban", icon: "🛠️" },
    { id: "spares", label: "Spares & Rate Estimator", icon: "📦" },
    { id: "history", label: "Job History & Bills", icon: "📜" }
  ];

  return (
    <nav className="bg-[#121722] border-b border-slate-800 px-4 sm:px-6 sticky top-[69px] z-30 overflow-x-auto scrollbar-none shadow-md">
      <div className="max-w-7xl mx-auto flex items-center gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onSelectTab(tab.id)}
            className={`nav-tab-btn px-4 py-3 text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === tab.id ? "nav-tab-active" : ""
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
            {tab.badge && (
              <span className="bg-amber-500/20 text-amber-300 text-[10px] px-1.5 py-0.2 rounded-full font-mono">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>
    </nav>
  );
}
