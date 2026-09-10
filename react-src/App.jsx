import React, { useState } from "react";
import Header from "./components/Header";
import NavigationTabs from "./components/NavigationTabs";
import AiDiagnosticEngine from "./components/AiDiagnosticEngine";
import NearbyServicesHub from "./components/NearbyServicesHub";
import EmergencySOSModal from "./components/EmergencySOSModal";
import DigitalInspection from "./components/DigitalInspection";
import LiveBaysKanban from "./components/LiveBaysKanban";
import SparesManager from "./components/SparesManager";
import HistoryManager from "./components/HistoryManager";
import CustomerDispatchModal from "./components/CustomerDispatchModal";

export default function App() {
  const [activeTab, setActiveTab] = useState("diagnosis");
  const [isSosOpen, setIsSosOpen] = useState(false);
  const [dispatchState, setDispatchState] = useState({ isOpen: false, estimate: null, customer: null });
  const [currentEstimate, setCurrentEstimate] = useState(null);

  const handleOpenDispatch = (estimate, customer) => {
    setDispatchState({ isOpen: true, estimate, customer });
  };

  const handleCloseDispatch = () => {
    setDispatchState({ isOpen: false, estimate: null, customer: null });
  };

  return (
    <div className="min-h-screen bg-[#090C10] text-[#F8FAFC]">
      {/* Header */}
      <Header onOpenSos={() => setIsSosOpen(true)} />

      {/* Navigation Tabs */}
      <NavigationTabs activeTab={activeTab} onSelectTab={setActiveTab} />

      {/* Main Panels */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {activeTab === "diagnosis" && (
          <AiDiagnosticEngine
            onOpenDispatch={handleOpenDispatch}
            onJobUpdated={setCurrentEstimate}
          />
        )}

        {activeTab === "nearby" && (
          <NearbyServicesHub onOpenSos={() => setIsSosOpen(true)} />
        )}

        {activeTab === "inspection" && (
          <DigitalInspection
            onAddIssuesToJobCard={(items) => {
              setActiveTab("diagnosis");
            }}
          />
        )}

        {activeTab === "bays" && (
          <LiveBaysKanban activeEstimate={currentEstimate} />
        )}

        {activeTab === "spares" && (
          <SparesManager
            onAddSpare={(spare) => {
              setActiveTab("diagnosis");
            }}
          />
        )}

        {activeTab === "history" && (
          <HistoryManager
            onLoadJob={(record) => {
              setCurrentEstimate(record);
              setActiveTab("diagnosis");
            }}
          />
        )}
      </main>

      {/* Modals */}
      <EmergencySOSModal
        isOpen={isSosOpen}
        onClose={() => setIsSosOpen(false)}
      />

      <CustomerDispatchModal
        isOpen={dispatchState.isOpen}
        onClose={handleCloseDispatch}
        estimate={dispatchState.estimate}
        customer={dispatchState.customer}
      />

      {/* Footer */}
      <footer className="mt-12 py-6 border-t border-slate-800/80 bg-[#090C10] text-center text-xs text-slate-500 space-y-1">
        <p>QuickMoto AI Garage · NH 83 Pollachi Main Road, Eachanari, Coimbatore - 641021</p>
        <p className="text-[11px] text-slate-600 font-mono">
          AI Diagnostic Guidance System · Multi-Brand Certified Workshop · Emergency Helpline: +91 98422 99001
        </p>
      </footer>
    </div>
  );
}
