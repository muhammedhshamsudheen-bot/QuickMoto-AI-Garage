/**
 * Helpers & Storage Utility Functions
 */

export const inr = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

export function makeJobCardId(date = new Date()) {
  const y = String(date.getFullYear()).slice(2);
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `EAM/JC/${y}${m}${d}/${rand}`;
}

export function formatEta(startDate, totalMinutes) {
  const d = startDate instanceof Date ? startDate : new Date(startDate);
  const eta = new Date(d.getTime() + totalMinutes * 60000);
  const sameDay = eta.toDateString() === d.toDateString();
  const time = eta.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
  return sameDay ? `Today · ${time}` : `Tomorrow · ${time}`;
}

export function formatClock(date = new Date()) {
  return date.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", second: "2-digit" });
}

export function formatDateShort(date = new Date()) {
  const d = date instanceof Date ? date : new Date(date);
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export function makeUpiString(amount, jobCardId, customerName = "") {
  const vpa = "quickmotogarage@upi";
  const pn = "QuickMoto AI Garage";
  const tn = encodeURIComponent(`Bill for ${jobCardId} - ${customerName}`);
  return `upi://pay?pa=${vpa}&pn=${encodeURIComponent(pn)}&am=${Number(amount).toFixed(2)}&cu=INR&tn=${tn}`;
}

export function makeUpiQrUrl(amount, jobCardId, customerName = "") {
  const upiPayload = makeUpiString(amount, jobCardId, customerName);
  return `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=8&data=${encodeURIComponent(upiPayload)}`;
}

export function sanitizePhone(phone) {
  const digits = String(phone || "").replace(/\D/g, "");
  return digits.length === 10 ? `91${digits}` : digits;
}

export function generateWhatsappEstimateText(estimate, customer, discountPercent = 0, gstPercent = 0) {
  if (!estimate) return "";

  const partsTotal = Number(estimate.partsCost) || 0;
  const laborTotal = Number(estimate.laborCost) || 0;
  const subtotal = partsTotal + laborTotal;
  const discountAmount = discountPercent > 0 ? subtotal * (discountPercent / 100) : 0;
  const gstAmount = gstPercent > 0 ? (subtotal - discountAmount) * (gstPercent / 100) : 0;
  const finalTotal = estimate.grandTotal || (subtotal - discountAmount + gstAmount);

  const numberEmojis = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"];

  const itemsList = estimate.items && estimate.items.length > 0
    ? estimate.items.map((it, idx) => {
        const num = numberEmojis[idx] || `${idx + 1}.`;
        const itemTotal = (Number(it.partCost) || 0) + (Number(it.laborCost) || 0);
        return `${num} *${it.label}*\n   • Part: ${it.part}\n   • Cost: ${inr(it.partCost)} (Part) + ${inr(it.laborCost)} (Service) = *${inr(itemTotal)}*`;
      }).join("\n\n")
    : "  • General Two-Wheeler Inspection & Tuning";

  const lines = [
    `🏍️ *QUICKMOTO AI GARAGE*`,
    `*Two-Wheeler Service & Repair Bill*`,
    `━━━━━━━━━━━━━━━━━━━━`,
    `Hello *${customer.name || "Customer"}* 👋`,
    `Here is your clear service bill for *${customer.vehicle || "Bike"}* (Reg: *${customer.reg || "TN 38"}*):`,
    ``,
    `📋 *Bill No:* ${estimate.id}`,
    `📅 *Date:* ${formatDateShort(estimate.createdAt)}`,
    `⏱️ *Ready by:* ${estimate.eta || "Today in 2-3 Hours"}`,
    ``,
    `🛠️ *WORK DONE & SPARE PARTS:*`,
    itemsList,
    ``,
    `━━━━━━━━━━━━━━━━━━━━`,
    `💵 *Parts Total:* ${inr(partsTotal)}`,
    `🔧 *Labor / Service Charge:* ${inr(laborTotal)}`,
    discountPercent > 0 ? `🏷️ *Discount (${discountPercent}%):* -${inr(discountAmount)}` : null,
    gstPercent > 0 ? `🧾 *GST (${gstPercent}%):* +${inr(gstAmount)}` : null,
    `━━━━━━━━━━━━━━━━━━━━`,
    `⭐️ *TOTAL AMOUNT TO PAY: ${inr(finalTotal)}*`,
    `━━━━━━━━━━━━━━━━━━━━`,
    ``,
    `💳 *EASY PAYMENT OPTIONS:*`,
    `• *GPay / PhonePe / Paytm / BHIM:*`,
    `  UPI ID: \`quickmotogarage@upi\``,
    `• Or pay with *Cash / Card* directly at workshop`,
    ``,
    `📍 *Workshop Address:*`,
    `QuickMoto AI Garage, Near Eachanari Vinayagar Temple, Pollachi Main Rd, Coimbatore`,
    `📞 *Help / Call:* +91 98943 12456`,
    ``,
    `🙏 Thank you for choosing us! Have a safe ride! 🏍️✨`
  ].filter(Boolean);

  return lines.join("\n");
}

export function generateWhatsappTamilEstimateText(estimate, customer) {
  if (!estimate) return "";
  return [
    `🏍️ *QUICKMOTO AI GARAGE — சர்வீஸ் பில்*`,
    `━━━━━━━━━━━━━━━━━━━━`,
    `வணக்கம் *${customer.name || "Customer"}* அவர்களே! 🙏`,
    `உங்கள் *${customer.vehicle || "பைக்"}* (*${customer.reg || "TN 38"}*) சர்வீஸ் பில் விவரம்:`,
    ``,
    `📋 *பில் எண் (Bill No):* ${estimate.id}`,
    `💰 *மொத்த கட்டணம் (Total Amount):* *${inr(estimate.grandTotal)}*`,
    `⏱️ *டெலிவரி நேரம் (Ready By):* ${estimate.eta || "இன்று"}`,
    ``,
    `💳 *பணம் செலுத்தும் முறை (Payment):*`,
    `• GPay / PhonePe UPI: \`quickmotogarage@upi\``,
    `• அல்லது நேரடி ரொக்கம் (Cash / Card)`,
    ``,
    `📍 *பட்டறை முகவரி (Workshop):*`,
    `ஈச்சனாரி விநாயகர் கோவில் அருகில், பொள்ளாச்சி மெயின் ரோடு, கோயம்புத்தூர்.`,
    `📞 *தொடர்புக்கு:* +91 98943 12456`,
    ``,
    `நன்றி! பாதுகாப்பாக பயணியுங்கள்! 🏍️💨`
  ].join("\n");
}

export function generateWhatsappReadyText(estimate, customer) {
  if (!estimate) return "";
  return [
    `🏍️ *QUICKMOTO AI GARAGE*`,
    `*Your Bike is Ready for Delivery!* 🛵✨`,
    `━━━━━━━━━━━━━━━━━━━━`,
    `Hello *${customer.name || "Customer"}* 👋`,
    `Good news! Your *${customer.vehicle || "bike"}* (*${customer.reg || "TN 38"}*) is fully serviced, quality-tested, and ready for pickup!`,
    ``,
    `📋 *Bill No:* ${estimate.id}`,
    `💰 *Total Bill Amount:* *${inr(estimate.grandTotal)}*`,
    ``,
    `💳 *Payment:* GPay, PhonePe, Paytm, Cash or Card`,
    `⏰ *Timings:* Open today till 09:30 PM`,
    `📍 *Pickup Location:* Near Eachanari Vinayagar Temple, Pollachi Main Road, Coimbatore`,
    `📞 *Helpline:* +91 98943 12456`,
    ``,
    `🙏 Thank you! See you soon & ride safe! 🏍️💨`
  ].join("\n");
}

export function generateWhatsappSosText(sosData) {
  const lat = sosData.lat || "10.9324";
  const lng = sosData.lng || "76.9745";
  return [
    `🚨 *EMERGENCY BREAKDOWN SOS — QUICKMOTO AI GARAGE*`,
    `👤 *Rider:* ${sosData.name || "Rider"} (📞 ${sosData.phone || "N/A"})`,
    `🛵 *Vehicle:* ${sosData.vehicle || "Two-Wheeler"} (${sosData.reg || "N/A"})`,
    `⚠️ *Issue:* ${sosData.issueType || "Breakdown"}${sosData.notes ? ` — ${sosData.notes}` : ""}`,
    `📍 *Location:* ${sosData.locationName || "Eachanari / Pollachi Main Rd"}`,
    `🗺️ *Live GPS Map:* https://maps.google.com/?q=${lat},${lng}`,
    ``,
    `⚡ Please dispatch mobile mechanic / rescue unit immediately!`
  ].join("\n");
}

/* ---------------- LOCAL STORAGE HISTORY ---------------- */
const STORAGE_KEY = "EAM_JOB_CARDS_ARCHIVE_V2";

export function loadHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to load history", e);
    return [];
  }
}

export function saveHistoryItem(record) {
  try {
    const list = loadHistory();
    const existingIdx = list.findIndex((x) => x.id === record.id);
    if (existingIdx >= 0) {
      list[existingIdx] = record;
    } else {
      list.unshift(record);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, 100)));
    return list;
  } catch (e) {
    console.error("Failed to save history", e);
    return [];
  }
}

export function deleteHistoryItem(id) {
  try {
    const list = loadHistory().filter((x) => x.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    return list;
  } catch (e) {
    console.error("Failed to delete history item", e);
    return [];
  }
}

export function exportHistoryCsv(list) {
  if (!list || !list.length) return;
  const headers = ["JobCardID", "Date", "Customer", "Phone", "Vehicle", "RegNo", "GrandTotal", "Stage", "ItemsCount"];
  const rows = list.map((item) => [
    item.id,
    item.createdAt ? formatDateShort(item.createdAt) : "",
    `"${item.customer?.name || ""}"`,
    `"${item.customer?.phone || ""}"`,
    `"${item.customer?.vehicle || ""}"`,
    `"${item.customer?.reg || ""}"`,
    item.grandTotal || 0,
    item.stageLabel || "Diagnosed",
    item.items?.length || 0
  ]);
  const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `Eachanari_JobCards_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
