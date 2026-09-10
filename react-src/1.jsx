import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Wrench,
  Bike,
  Clock,
  Phone,
  User,
  Hash,
  ClipboardList,
  Sparkles,
  MessageCircle,
  CheckCircle2,
  Circle,
  Send,
  Wallet,
  Settings2,
  Zap,
  CalendarClock,
  ChevronRight,
  Timer,
  Receipt,
  PackageCheck,
  Loader2,
  MapPin,
} from "lucide-react";
 
/* -------------------------------------------------------------------- */
/*  KNOWLEDGE BASE                                                       */
/* -------------------------------------------------------------------- */
 
const KNOWLEDGE_BASE = [
  {
    key: "oil_change",
    label: "Engine oil change",
    keywords: ["oil change", "engine oil", "oil maathu", "oil poduren", "oil podanum", "oil top up"],
    part: "Engine Oil 1L + Oil Filter",
    partCost: 450,
    laborCost: 100,
    duration: 20,
  },
  {
    key: "brake_front",
    label: "Front brake noise",
    keywords: ["front brake", "munnal brake", "front braking", "front disc sound"],
    part: "Front Brake Pad Set",
    partCost: 350,
    laborCost: 150,
    duration: 30,
  },
  {
    key: "brake_rear",
    label: "Rear brake noise",
    keywords: ["rear brake", "back brake", "pinnal brake", "pin wheel brake"],
    part: "Rear Brake Shoe Set",
    partCost: 280,
    laborCost: 150,
    duration: 30,
  },
  {
    key: "chain_loose",
    label: "Chain loose / sprocket sound",
    keywords: ["chain loose", "chain sound", "chain noise", "saakiri", "chain la sappu", "sprocket sound"],
    part: "Chain Lubrication & Adjustment",
    partCost: 120,
    laborCost: 120,
    duration: 25,
  },
  {
    key: "fork_oil_leak",
    label: "Front fork oil leak",
    keywords: ["fork oil", "fork leak", "front fork", "fork la oil vara"],
    part: "Fork Oil Seal Set + Fork Oil",
    partCost: 420,
    laborCost: 350,
    duration: 60,
  },
  {
    key: "full_wash",
    label: "Full water wash / detailing",
    keywords: ["water wash", "full wash", "kazhuvu", "cleaning pannunga", "vandi wash", "foam wash"],
    part: "Foam Wash & Detailing Kit",
    partCost: 80,
    laborCost: 150,
    duration: 30,
  },
  {
    key: "battery_dead",
    label: "Battery dead / self-start issue",
    keywords: ["battery dead", "self start", "battery low", "start aagala", "self start aagala", "battery problem"],
    part: "12V 5Ah Sealed Battery",
    partCost: 1200,
    laborCost: 100,
    duration: 20,
  },
  {
    key: "clutch_issue",
    label: "Clutch hard / slipping",
    keywords: ["clutch hard", "clutch slip", "clutch problem", "clutch katti", "gear pidikala"],
    part: "Clutch Plate Set",
    partCost: 650,
    laborCost: 300,
    duration: 60,
  },
  {
    key: "headlight",
    label: "Headlight not working",
    keywords: ["headlight", "light not working", "light poagala", "head light problem"],
    part: "Headlight Bulb / LED Unit",
    partCost: 250,
    laborCost: 80,
    duration: 15,
  },
  {
    key: "puncture",
    label: "Tyre puncture / air leak",
    keywords: ["puncture", "tyre air", "air leak", "tube pottu", "wheel air"],
    part: "Tube / Tyre Puncture Repair",
    partCost: 100,
    laborCost: 80,
    duration: 20,
  },
  {
    key: "air_filter",
    label: "Air filter dirty / mileage drop",
    keywords: ["air filter", "mileage", "mayilej kammi", "mileage kammi"],
    part: "Air Filter Replacement",
    partCost: 180,
    laborCost: 60,
    duration: 15,
  },
  {
    key: "spark_plug",
    label: "Pickup / spark plug issue",
    keywords: ["spark plug", "pickup illa", "hesitation", "engine miss", "start la delay"],
    part: "Spark Plug Replacement",
    partCost: 120,
    laborCost: 60,
    duration: 15,
  },
  {
    key: "horn",
    label: "Horn not working",
    keywords: ["horn not working", "horn problem", "horn ordu", "horn illa"],
    part: "Horn Unit Replacement",
    partCost: 150,
    laborCost: 60,
    duration: 10,
  },
  {
    key: "general_service",
    label: "General service / tuning",
    keywords: ["general service", "full service", "tuning pannunga", "vandi tuning", "regular service"],
    part: "Full Service Kit (Oil, Filter, Grease, Cleaning)",
    partCost: 600,
    laborCost: 250,
    duration: 90,
  },
];
 
const QUICK_CHIPS = [
  "oil change",
  "front brake noise",
  "rear brake noise",
  "chain loose sound",
  "fork oil leak",
  "full water wash",
  "battery dead",
  "clutch slipping",
  "headlight not working",
  "general service",
];
 
const VEHICLES = [
  "Hero Splendor",
  "Honda Activa 6G",
  "Bajaj Pulsar 150",
  "TVS Apache RTR 160",
  "Royal Enfield Classic 350",
];
 
const STAGES = ["Diagnosed", "In Progress", "Ready for Delivery"];
 
/* -------------------------------------------------------------------- */
/*  HELPERS                                                              */
/* -------------------------------------------------------------------- */
 
function analyzeComplaint(text) {
  const lower = text.toLowerCase();
  return KNOWLEDGE_BASE.filter((item) =>
    item.keywords.some((kw) => lower.includes(kw))
  );
}
 
function makeJobCardId(date) {
  const y = String(date.getFullYear()).slice(2);
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `EAM/JC/${y}${m}${d}/${rand}`;
}
 
function formatEta(startDate, totalMinutes) {
  const eta = new Date(startDate.getTime() + totalMinutes * 60000);
  const sameDay = eta.toDateString() === startDate.toDateString();
  const time = eta.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
  return sameDay ? `Today · ${time}` : `Tomorrow · ${time}`;
}
 
function formatClock(date) {
  return date.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", second: "2-digit" });
}
 
function formatDateShort(date) {
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}
 
const inr = (n) => `\u20B9${n.toLocaleString("en-IN")}`;
 
/* -------------------------------------------------------------------- */
/*  MAIN COMPONENT                                                       */
/* -------------------------------------------------------------------- */
 
export default function App() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
 
  const [customer, setCustomer] = useState({
    name: "Karthik Raja",
    phone: "9894312456",
    vehicle: "Honda Activa 6G",
    reg: "TN 66 BZ 4521",
  });
 
  const [complaint, setComplaint] = useState(
    "oil change pannanum, front brake la sound varudhu, chain loose ah irukku sound varudhu, fork oil leak, full water wash pannunga"
  );
 
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [estimate, setEstimate] = useState(null);
  const [stage, setStage] = useState(0);
 
  const runDiagnosis = useCallback(() => {
    setIsAnalyzing(true);
    setStage(0);
    const genAt = new Date();
    window.setTimeout(() => {
      const matches = analyzeComplaint(complaint);
      const partsCost = matches.reduce((s, m) => s + m.partCost, 0);
      const laborCost = matches.reduce((s, m) => s + m.laborCost, 0);
      const duration = matches.reduce((s, m) => s + m.duration, 0) + 20; // diagnostic buffer
      setEstimate({
        id: makeJobCardId(genAt),
        createdAt: genAt,
        items: matches,
        partsCost,
        laborCost,
        grandTotal: partsCost + laborCost,
        duration,
        eta: formatEta(genAt, duration),
      });
      setIsAnalyzing(false);
    }, 850);
  }, [complaint]);
 
  // pre-load sample estimate once on mount
  useEffect(() => {
    runDiagnosis();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
 
  const addChip = (chip) => {
    setComplaint((prev) => {
      const lower = prev.toLowerCase();
      if (lower.includes(chip)) return prev;
      return prev.trim().length ? `${prev.trim()}, ${chip}` : chip;
    });
  };
 
  const whatsappMessage = useMemo(() => {
    if (!estimate) return "";
    const lines = [
      `*Eachanari AI MotoWorks*`,
      `Job Card: ${estimate.id}`,
      `Vehicle: ${customer.vehicle} (${customer.reg})`,
      ``,
      `Diagnosed issues:`,
      ...estimate.items.map(
        (it) => `• ${it.label} — ${it.part} (${inr(it.partCost + it.laborCost)})`
      ),
      ``,
      `Parts: ${inr(estimate.partsCost)}`,
      `Labor: ${inr(estimate.laborCost)}`,
      `*Grand Total: ${inr(estimate.grandTotal)}*`,
      ``,
      `Estimated ready by: ${estimate.eta}`,
      `Thank you for choosing Eachanari AI MotoWorks!`,
    ];
    return lines.join("\n");
  }, [estimate, customer]);
 
  const sendWhatsapp = () => {
    const digits = customer.phone.replace(/\D/g, "");
    const number = digits.length === 10 ? `91${digits}` : digits;
    const url = `https://wa.me/${number}?text=${encodeURIComponent(whatsappMessage)}`;
    window.open(url, "_blank");
  };
 
  return (
    <div className="mw-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@600;700;800&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
 
        .mw-root {
          --ink: #1C201E;
          --paper: #E9E6DD;
          --card: #FCFBF7;
          --card-line: #D8D3C4;
          --amber: #DE9B2E;
          --amber-dark: #B57A1E;
          --rust: #B14328;
          --steel: #3E5C63;
          --green: #3C8256;
          --dark: #16181A;
          font-family: 'Inter', system-ui, sans-serif;
          color: var(--ink);
          background: var(--paper);
          min-height: 100vh;
        }
        .mw-display { font-family: 'Big Shoulders Display', sans-serif; letter-spacing: 0.01em; }
        .mw-mono { font-family: 'JetBrains Mono', monospace; }
 
        .mw-header {
          background: var(--dark);
          color: #F2EFE6;
          border-bottom: 3px solid var(--amber);
        }
        .mw-badge {
          background: rgba(222,155,46,0.14);
          border: 1px solid rgba(222,155,46,0.55);
          color: var(--amber);
        }
        .mw-dot {
          width: 7px; height: 7px; border-radius: 999px; background: var(--amber);
          box-shadow: 0 0 0 0 rgba(222,155,46,0.7);
          animation: mw-pulse 1.8s infinite;
        }
        @keyframes mw-pulse {
          0% { box-shadow: 0 0 0 0 rgba(222,155,46,0.55); }
          70% { box-shadow: 0 0 0 7px rgba(222,155,46,0); }
          100% { box-shadow: 0 0 0 0 rgba(222,155,46,0); }
        }
 
        .mw-card {
          background: var(--card);
          border: 1px solid var(--card-line);
          border-radius: 6px;
        }
        .mw-tag {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.06em;
          color: #6B675A;
          border-bottom: 1px solid var(--card-line);
        }
        .mw-input {
          background: #FFFFFF;
          border: 1px solid #CFC9B8;
          border-radius: 4px;
          color: var(--ink);
        }
        .mw-input:focus {
          outline: none;
          border-color: var(--amber-dark);
          box-shadow: 0 0 0 3px rgba(222,155,46,0.18);
        }
        .mw-chip {
          background: #FFFFFF;
          border: 1px solid #CFC9B8;
          color: #3A382F;
          transition: background 0.15s ease, border-color 0.15s ease, transform 0.1s ease;
        }
        .mw-chip:hover {
          border-color: var(--amber-dark);
          background: #FBF0DC;
          transform: translateY(-1px);
        }
        .mw-btn-primary {
          background: var(--amber);
          color: var(--dark);
          transition: background 0.15s ease, transform 0.1s ease;
        }
        .mw-btn-primary:hover { background: var(--amber-dark); }
        .mw-btn-primary:active { transform: translateY(1px); }
        .mw-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
 
        .mw-metric {
          background: var(--card);
          border: 1px solid var(--card-line);
          border-left: 3px solid var(--amber);
          border-radius: 4px;
        }
 
        .mw-table-wrap {
          background: var(--card);
          border: 1px solid var(--card-line);
          border-radius: 6px;
        }
        .mw-table thead th {
          background: var(--dark);
          color: #F2EFE6;
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }
        .mw-table tbody tr { border-bottom: 1px dashed #D3CDBC; }
        .mw-table tbody tr:last-child { border-bottom: none; }
        .mw-table tbody tr:hover { background: #F4F1E8; }
        .mw-table tfoot td {
          border-top: 2px solid var(--dark);
          font-weight: 700;
        }
 
        .mw-fade-in {
          animation: mw-fadein 0.45s ease both;
        }
        @keyframes mw-fadein {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
 
        .mw-bubble {
          background: #DCF3D6;
          border: 1px solid #BEE3B4;
          border-radius: 10px 10px 10px 2px;
          color: #1E2B1A;
        }
 
        .mw-track-line { background: #CFC9B8; }
        .mw-track-line-active { background: var(--amber); }
        .mw-node-done { background: var(--amber); color: var(--dark); border-color: var(--amber-dark); }
        .mw-node-pending { background: #FFFFFF; color: #8A8574; border-color: #CFC9B8; }
 
        ::selection { background: rgba(222,155,46,0.35); }
      `}</style>
 
      {/* ---------------- HEADER ---------------- */}
      <header className="mw-header px-4 sm:px-6 py-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-md flex items-center justify-center" style={{ background: "rgba(222,155,46,0.15)", border: "1px solid rgba(222,155,46,0.5)" }}>
              <Wrench size={22} color="#DE9B2E" />
            </div>
            <div>
              <h1 className="mw-display text-xl sm:text-2xl font-bold leading-none tracking-wide">
                EACHANARI AI MOTOWORKS
              </h1>
              <p className="text-xs sm:text-sm text-[#B9B5A8] mt-1">
                Smart Job-Card &amp; Diagnostic Portal · Eachanari, Coimbatore
              </p>
            </div>
          </div>
 
          <div className="flex items-center gap-3 flex-wrap">
            <span className="mw-badge px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-2">
              <span className="mw-dot" />
              AI Diagnostics Active
            </span>
            <span className="mw-mono text-xs sm:text-sm text-[#D8D4C7] flex items-center gap-1.5">
              <Clock size={14} />
              {formatDateShort(now)} · {formatClock(now)}
            </span>
          </div>
        </div>
      </header>
 
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
        {/* ---------------- INPUT SECTION ---------------- */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Customer details */}
          <div className="mw-card overflow-hidden">
            <div className="mw-tag px-4 py-2 flex items-center gap-2">
              <User size={13} /> CUSTOMER &amp; VEHICLE DETAILS
            </div>
            <div className="p-4 sm:p-5 space-y-4">
              <div>
                <label className="text-xs font-medium text-[#5C594D] mb-1 block">Customer name</label>
                <div className="relative">
                  <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9A9584]" />
                  <input
                    className="mw-input w-full pl-9 pr-3 py-2 text-sm"
                    value={customer.name}
                    onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                    placeholder="Enter customer name"
                  />
                </div>
              </div>
 
              <div>
                <label className="text-xs font-medium text-[#5C594D] mb-1 block">Phone number</label>
                <div className="relative">
                  <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9A9584]" />
                  <input
                    className="mw-input w-full pl-9 pr-3 py-2 text-sm mw-mono"
                    value={customer.phone}
                    onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                    placeholder="10-digit mobile number"
                  />
                </div>
              </div>
 
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-[#5C594D] mb-1 block">Vehicle model</label>
                  <div className="relative">
                    <Bike size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9A9584]" />
                    <select
                      className="mw-input w-full pl-9 pr-2 py-2 text-sm appearance-none"
                      value={customer.vehicle}
                      onChange={(e) => setCustomer({ ...customer, vehicle: e.target.value })}
                    >
                      {VEHICLES.map((v) => (
                        <option key={v} value={v}>{v}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-[#5C594D] mb-1 block">Registration no.</label>
                  <div className="relative">
                    <Hash size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9A9584]" />
                    <input
                      className="mw-input w-full pl-9 pr-3 py-2 text-sm mw-mono uppercase"
                      value={customer.reg}
                      onChange={(e) => setCustomer({ ...customer, reg: e.target.value })}
                      placeholder="TN 66 XX 0000"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
 
          {/* Complaint diagnostic box */}
          <div className="mw-card overflow-hidden flex flex-col">
            <div className="mw-tag px-4 py-2 flex items-center gap-2">
              <ClipboardList size={13} /> COMPLAINT DIAGNOSTIC BOX
            </div>
            <div className="p-4 sm:p-5 flex flex-col gap-3 flex-1">
              <textarea
                className="mw-input w-full text-sm p-3 flex-1 min-h-[110px] resize-none"
                value={complaint}
                onChange={(e) => setComplaint(e.target.value)}
                placeholder="Type complaint in Tanglish / Tamil / English — e.g. oil change, front brake noise, chain loose sound..."
              />
              <div>
                <p className="text-xs font-medium text-[#5C594D] mb-2">Quick symptoms — tap to add</p>
                <div className="flex flex-wrap gap-2">
                  {QUICK_CHIPS.map((chip) => (
                    <button
                      key={chip}
                      onClick={() => addChip(chip)}
                      className="mw-chip px-3 py-1.5 rounded-full text-xs capitalize"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
 
        {/* ---------------- RUN BUTTON ---------------- */}
        <div className="flex justify-center">
          <button
            onClick={runDiagnosis}
            disabled={isAnalyzing}
            className="mw-btn-primary px-6 py-3 rounded-md font-semibold text-sm flex items-center gap-2 shadow-sm"
          >
            {isAnalyzing ? (
              <>
                <Loader2 size={18} className="animate-spin" /> Running AI Diagnosis…
              </>
            ) : (
              <>
                <Sparkles size={18} /> Run AI Diagnosis &amp; Generate Job Card
              </>
            )}
          </button>
        </div>
 
        {/* ---------------- OUTPUT DASHBOARD ---------------- */}
        {estimate && !isAnalyzing && (
          <div className="mw-fade-in space-y-6">
            <div className="flex items-center gap-2">
              <div className="h-px flex-1" style={{ background: "#CFC9B8" }} />
              <span className="mw-tag border-none text-[#6B675A] px-2">JOB CARD DASHBOARD</span>
              <div className="h-px flex-1" style={{ background: "#CFC9B8" }} />
            </div>
 
            {/* Metric cards */}
            <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              <MetricCard icon={<Hash size={16} />} label="Job Card ID" value={estimate.id} mono small />
              <MetricCard icon={<Wallet size={16} />} label="Parts Cost" value={inr(estimate.partsCost)} mono />
              <MetricCard icon={<Settings2 size={16} />} label="Labor Cost" value={inr(estimate.laborCost)} mono />
              <MetricCard icon={<Receipt size={16} />} label="Grand Total" value={inr(estimate.grandTotal)} mono highlight />
              <MetricCard icon={<CalendarClock size={16} />} label="Est. Delivery" value={estimate.eta} mono />
            </section>
 
            {estimate.items.length === 0 ? (
              <div className="mw-card p-6 text-center text-sm text-[#6B675A]">
                No matching symptoms found yet. Try adding details or tap a quick symptom chip above, then re-run diagnosis.
              </div>
            ) : (
              <>
                {/* Itemized job card table */}
                <section className="mw-table-wrap overflow-hidden">
                  <div className="mw-tag px-4 py-2 flex items-center gap-2">
                    <ClipboardList size={13} /> ITEMIZED JOB CARD — {customer.vehicle} ({customer.reg})
                  </div>
                  <div className="overflow-x-auto">
                    <table className="mw-table w-full text-sm">
                      <thead>
                        <tr>
                          <th className="text-left px-4 py-2.5">Issue</th>
                          <th className="text-left px-4 py-2.5">Recommended part</th>
                          <th className="text-right px-4 py-2.5">Part cost</th>
                          <th className="text-right px-4 py-2.5">Labor</th>
                          <th className="text-right px-4 py-2.5">Total</th>
                          <th className="text-right px-4 py-2.5">Time</th>
                        </tr>
                      </thead>
                      <tbody>
                        {estimate.items.map((it) => (
                          <tr key={it.key}>
                            <td className="px-4 py-2.5">{it.label}</td>
                            <td className="px-4 py-2.5 text-[#5C594D]">{it.part}</td>
                            <td className="px-4 py-2.5 text-right mw-mono">{inr(it.partCost)}</td>
                            <td className="px-4 py-2.5 text-right mw-mono">{inr(it.laborCost)}</td>
                            <td className="px-4 py-2.5 text-right mw-mono font-semibold">
                              {inr(it.partCost + it.laborCost)}
                            </td>
                            <td className="px-4 py-2.5 text-right mw-mono text-[#5C594D]">{it.duration}m</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr>
                          <td className="px-4 py-3" colSpan={2}>Grand Total</td>
                          <td className="px-4 py-3 text-right mw-mono">{inr(estimate.partsCost)}</td>
                          <td className="px-4 py-3 text-right mw-mono">{inr(estimate.laborCost)}</td>
                          <td className="px-4 py-3 text-right mw-mono">{inr(estimate.grandTotal)}</td>
                          <td className="px-4 py-3 text-right mw-mono">{estimate.duration}m</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </section>
 
                {/* Dispatch card + Status tracker */}
                <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  <div className="mw-card overflow-hidden flex flex-col">
                    <div className="mw-tag px-4 py-2 flex items-center gap-2">
                      <MessageCircle size={13} /> CUSTOMER DISPATCH PREVIEW
                    </div>
                    <div className="p-4 sm:p-5 flex flex-col gap-4 flex-1">
                      <div className="mw-bubble px-4 py-3 text-sm whitespace-pre-line leading-relaxed">
                        {whatsappMessage}
                      </div>
                      <button
                        onClick={sendWhatsapp}
                        className="mt-auto self-start px-4 py-2.5 rounded-md text-sm font-semibold flex items-center gap-2 text-white"
                        style={{ background: "#3C8256" }}
                      >
                        <Send size={15} /> Send WhatsApp Estimate
                      </button>
                    </div>
                  </div>
 
                  <div className="mw-card overflow-hidden flex flex-col">
                    <div className="mw-tag px-4 py-2 flex items-center gap-2">
                      <PackageCheck size={13} /> STATUS TRACKER
                    </div>
                    <div className="p-4 sm:p-5 flex-1 flex flex-col justify-center">
                      <div className="flex items-center">
                        {STAGES.map((s, i) => (
                          <React.Fragment key={s}>
                            <div className="flex flex-col items-center gap-2" style={{ width: 90 }}>
                              <div
                                className={`w-9 h-9 rounded-full border-2 flex items-center justify-center ${
                                  i <= stage ? "mw-node-done" : "mw-node-pending"
                                }`}
                              >
                                {i < stage ? <CheckCircle2 size={18} /> : i === stage ? <Circle size={18} fill={i <= stage ? "#16181A" : "none"} /> : <Circle size={18} />}
                              </div>
                              <span className={`text-[11px] text-center font-medium ${i <= stage ? "text-[#1C201E]" : "text-[#9A9584]"}`}>
                                {s}
                              </span>
                            </div>
                            {i < STAGES.length - 1 && (
                              <div className={`h-0.5 flex-1 -mt-6 ${i < stage ? "mw-track-line-active" : "mw-track-line"}`} />
                            )}
                          </React.Fragment>
                        ))}
                      </div>
 
                      <div className="mt-6 flex items-center justify-between gap-3">
                        <p className="text-xs text-[#6B675A] flex items-center gap-1.5">
                          <Timer size={13} /> Current stage: <span className="font-semibold text-[#1C201E]">{STAGES[stage]}</span>
                        </p>
                        <button
                          disabled={stage >= STAGES.length - 1}
                          onClick={() => setStage((s) => Math.min(s + 1, STAGES.length - 1))}
                          className="mw-btn-primary px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1"
                        >
                          Advance <ChevronRight size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </section>
              </>
            )}
          </div>
        )}
 
        <footer className="pt-4 pb-2 flex items-center justify-center gap-2 text-xs text-[#8A8574]">
          <MapPin size={13} /> Eachanari, Coimbatore · Estimates are AI-generated guidance — confirm final pricing at the counter.
        </footer>
      </main>
    </div>
  );
}
 
/* -------------------------------------------------------------------- */
/*  METRIC CARD                                                          */
/* -------------------------------------------------------------------- */
 
function MetricCard({ icon, label, value, mono, highlight, small }) {
  return (
    <div
      className="mw-metric p-3.5 flex flex-col gap-1.5"
      style={highlight ? { borderLeftColor: "#B14328", borderLeftWidth: 3 } : undefined}
    >
      <div className="flex items-center gap-1.5 text-[#6B675A]">
        {icon}
        <span className="text-[11px] font-medium">{label}</span>
      </div>
      <span
        className={`${mono ? "mw-mono" : ""} font-bold leading-tight ${small ? "text-xs" : "text-base sm:text-lg"}`}
        style={highlight ? { color: "#B14328" } : undefined}
      >
        {value}
      </span>
    </div>
  );
}
 