import React, { useState } from "react";
import { generateWhatsappEstimateText, generateWhatsappTamilEstimateText, generateWhatsappReadyText, makeUpiQrUrl, makeUpiString, inr, sanitizePhone } from "../utils/helpers";
import { playClickSound, playSuccessChime } from "../utils/audio";

export default function CustomerDispatchModal({ isOpen, onClose, estimate, customer }) {
  const [template, setTemplate] = useState("estimate");

  if (!isOpen || !estimate || !customer) return null;

  const qrUrl = makeUpiQrUrl(estimate.grandTotal, estimate.id, customer.name);
  const upiString = makeUpiString(estimate.grandTotal, estimate.id, customer.name);

  const getMessage = () => {
    if (template === "ready") return generateWhatsappReadyText(estimate, customer);
    if (template === "tamil") return generateWhatsappTamilEstimateText(estimate, customer);
    return generateWhatsappEstimateText(estimate, customer, estimate.discountPercent, estimate.gstPercent);
  };

  const message = getMessage();

  const handleSendWhatsapp = () => {
    playSuccessChime();
    const phone = sanitizePhone(customer.phone);
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-950/80 via-slate-900 to-slate-900 p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-xl">
              📲
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-wide">
                Customer Communications &amp; Instant UPI QR
              </h3>
              <p className="text-xs text-amber-300/80 font-mono">
                Job Card: {estimate.id} · Total: {inr(estimate.grandTotal)}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xl font-bold p-1">
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5 max-h-[75vh] overflow-y-auto">
          {/* WhatsApp Column */}
          <div className="space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-lg border border-slate-800 mb-3">
                <button
                  onClick={() => { playClickSound(); setTemplate("estimate"); }}
                  className={`flex-1 py-1.5 px-2 rounded text-xs font-semibold transition-all ${
                    template === "estimate" ? "bg-amber-600 text-white shadow" : "text-slate-400 hover:text-white"
                  }`}
                >
                  1. 🧾 Easy Bill
                </button>
                <button
                  onClick={() => { playClickSound(); setTemplate("ready"); }}
                  className={`flex-1 py-1.5 px-2 rounded text-xs font-semibold transition-all ${
                    template === "ready" ? "bg-emerald-600 text-white shadow" : "text-slate-400 hover:text-white"
                  }`}
                >
                  2. 🛵 Ready
                </button>
                <button
                  onClick={() => { playClickSound(); setTemplate("tamil"); }}
                  className={`flex-1 py-1.5 px-2 rounded text-xs font-semibold transition-all ${
                    template === "tamil" ? "bg-indigo-600 text-white shadow" : "text-slate-400 hover:text-white"
                  }`}
                >
                  3. 🌐 தமிழ்
                </button>
              </div>

              <div className="bg-emerald-950/30 border border-emerald-500/30 p-3.5 rounded-xl font-sans text-xs text-slate-200 whitespace-pre-line leading-relaxed max-h-[220px] overflow-y-auto select-all shadow-inner">
                {message}
              </div>
            </div>

            <button
              onClick={handleSendWhatsapp}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-4 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all"
            >
              <span>💬</span> Send to {customer.phone} on WhatsApp
            </button>
          </div>

          {/* Dynamic UPI QR Column */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col items-center justify-between text-center space-y-3">
            <div>
              <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
                Scan &amp; Pay via Any UPI App
              </span>
              <p className="text-[11px] text-slate-400">GPay, PhonePe, Paytm, BHIM, Cred</p>
            </div>

            <div className="p-3 bg-white rounded-xl shadow-lg border-2 border-amber-500/50">
              <img
                src={qrUrl}
                alt="Dynamic UPI QR Code"
                className="w-40 h-40 object-contain mx-auto"
              />
            </div>

            <div className="space-y-1">
              <p className="text-base font-bold font-mono text-emerald-400">
                {inr(estimate.grandTotal)}
              </p>
              <p className="text-[10px] font-mono text-slate-400">
                VPA: <span className="text-slate-300 font-semibold">eachanarimotoworks@upi</span>
              </p>
            </div>

            <div className="flex items-center gap-2 w-full pt-1">
              <a
                href={upiString}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold py-2 rounded-lg transition-colors"
              >
                Open UPI App
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-950 p-4 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Customer: <span className="text-white font-semibold">{customer.name}</span> ({customer.phone})
          </span>
          <button onClick={onClose} className="px-4 py-1.5 text-xs font-semibold text-slate-400 hover:text-white">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
