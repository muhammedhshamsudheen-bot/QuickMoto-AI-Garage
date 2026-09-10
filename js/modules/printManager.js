/**
 * Print Engine for A4 Workshop Job Sheet & 80mm Thermal POS Receipt
 */

import { inr, formatDateShort, makeUpiQrUrl } from "../utils/helpers.js";

export class PrintManager {
  static printA4(estimate, customer) {
    if (!estimate || !customer) return;
    const printArea = document.getElementById("print-sheet-area");
    if (!printArea) return;

    const qrUrl = makeUpiQrUrl(estimate.grandTotal, estimate.id, customer.name);

    printArea.innerHTML = `
      <div class="print-a4-page p-8 bg-white text-slate-900 font-sans max-w-4xl mx-auto">
        <!-- Header -->
        <div class="flex items-start justify-between border-b-2 border-slate-900 pb-4 mb-6">
          <div>
            <h1 class="text-2xl font-black tracking-tight text-slate-900">QUICKMOTO AI GARAGE</h1>
            <p class="text-xs text-slate-600 font-medium mt-0.5">Advanced Two-Wheeler Diagnostics, Overhauls &amp; EV Care</p>
            <p class="text-xs text-slate-500">NH 83, Near Eachanari Vinayagar Temple, Coimbatore - 641021</p>
            <p class="text-xs text-slate-500 font-mono">GSTIN: 33AAAAE1234F1Z8 · Helpline: +91 98943 12456</p>
          </div>
          <div class="text-right">
            <span class="inline-block bg-slate-900 text-white text-xs font-bold px-3 py-1 uppercase tracking-wider mb-1">
              TAX INVOICE / JOB CARD
            </span>
            <p class="text-xs font-mono font-bold text-slate-800">${estimate.id}</p>
            <p class="text-xs text-slate-500">${formatDateShort(estimate.createdAt)}</p>
          </div>
        </div>

        <!-- Customer & Vehicle Grid -->
        <div class="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded border border-slate-200 mb-6 text-xs">
          <div>
            <span class="font-bold text-slate-500 uppercase tracking-wider text-[10px] block mb-1">CUSTOMER DETAILS</span>
            <p class="font-bold text-sm text-slate-900">${customer.name}</p>
            <p class="text-slate-600 font-mono">Ph: +91 ${customer.phone}</p>
          </div>
          <div>
            <span class="font-bold text-slate-500 uppercase tracking-wider text-[10px] block mb-1">VEHICLE DETAILS</span>
            <p class="font-bold text-sm text-slate-900">${customer.vehicle}</p>
            <p class="text-slate-800 font-mono font-bold uppercase">Reg: ${customer.reg}</p>
          </div>
        </div>

        <!-- Line items table -->
        <table class="w-full text-left text-xs mb-6 border-collapse">
          <thead>
            <tr class="border-b-2 border-slate-900 bg-slate-100 font-mono uppercase text-[11px]">
              <th class="py-2.5 px-3">#</th>
              <th class="py-2.5 px-3">Fault / Service Item</th>
              <th class="py-2.5 px-3">Recommended Spares</th>
              <th class="py-2.5 px-3 text-right">Parts (₹)</th>
              <th class="py-2.5 px-3 text-right">Labor (₹)</th>
              <th class="py-2.5 px-3 text-right">Total (₹)</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200">
            ${estimate.items.map((it, idx) => `
              <tr>
                <td class="py-2.5 px-3 text-slate-500">${idx + 1}</td>
                <td class="py-2.5 px-3 font-semibold text-slate-900">${it.label}</td>
                <td class="py-2.5 px-3 text-slate-600">${it.part}</td>
                <td class="py-2.5 px-3 text-right font-mono">${inr(it.partCost)}</td>
                <td class="py-2.5 px-3 text-right font-mono">${inr(it.laborCost)}</td>
                <td class="py-2.5 px-3 text-right font-mono font-bold">${inr(it.partCost + it.laborCost)}</td>
              </tr>
            `).join("")}
          </tbody>
          <tfoot>
            <tr class="border-t-2 border-slate-900 font-bold bg-slate-50">
              <td colspan="3" class="py-2.5 px-3 text-slate-800">Subtotal</td>
              <td class="py-2.5 px-3 text-right font-mono">${inr(estimate.partsCost)}</td>
              <td class="py-2.5 px-3 text-right font-mono">${inr(estimate.laborCost)}</td>
              <td class="py-2.5 px-3 text-right font-mono">${inr(estimate.partsCost + estimate.laborCost)}</td>
            </tr>
            ${estimate.discountPercent > 0 ? `
              <tr class="text-xs text-slate-600">
                <td colspan="5" class="py-1 px-3 text-right">Discount (${estimate.discountPercent}%)</td>
                <td class="py-1 px-3 text-right font-mono text-emerald-700">-${inr(estimate.discountAmount)}</td>
              </tr>
            ` : ""}
            ${estimate.gstPercent > 0 ? `
              <tr class="text-xs text-slate-600">
                <td colspan="5" class="py-1 px-3 text-right">GST (${estimate.gstPercent}%)</td>
                <td class="py-1 px-3 text-right font-mono">+${inr(estimate.gstAmount)}</td>
              </tr>
            ` : ""}
            <tr class="text-sm font-black border-t border-slate-900 bg-slate-100">
              <td colspan="5" class="py-3 px-3 text-right uppercase">Net Amount Payable</td>
              <td class="py-3 px-3 text-right font-mono text-base">${inr(estimate.grandTotal)}</td>
            </tr>
          </tfoot>
        </table>

        <!-- Signatures and QR Code -->
        <div class="grid grid-cols-3 gap-6 pt-4 border-t border-slate-300 text-xs">
          <!-- UPI QR -->
          <div class="flex items-center gap-3">
            <img src="${qrUrl}" alt="UPI QR" class="w-20 h-20 border border-slate-300 p-1" />
            <div>
              <p class="font-bold text-[11px]">Instant UPI Pay</p>
              <p class="text-[10px] text-slate-500 font-mono">quickmotogarage@upi</p>
            </div>
          </div>

          <!-- Customer Sign -->
          <div class="flex flex-col justify-end text-center pt-8">
            <div class="border-t border-slate-400 pt-1">
              <p class="text-[11px] font-semibold text-slate-700">Customer Signature</p>
            </div>
          </div>

          <!-- Workshop Authorized Sign -->
          <div class="flex flex-col justify-end text-center pt-8">
            <div class="border-t border-slate-400 pt-1">
              <p class="text-[11px] font-semibold text-slate-700">Authorized Workshop Signatory</p>
            </div>
          </div>
        </div>

        <!-- Terms -->
        <div class="mt-6 pt-3 border-t border-slate-200 text-[10px] text-slate-400 leading-tight">
          <p>1. Spares supplied carry standard manufacturer warranty against manufacturing defects.</p>
          <p>2. Vehicle delivery against full settlement of bill. Estimates valid for 7 days from generation.</p>
        </div>
      </div>
    `;

    window.print();
  }

  static printThermal(estimate, customer) {
    if (!estimate || !customer) return;
    const printArea = document.getElementById("print-sheet-area");
    if (!printArea) return;

    printArea.innerHTML = `
      <div class="print-thermal-receipt p-4 bg-white text-slate-900 font-mono text-[11px] max-w-[80mm] mx-auto leading-snug">
        <div class="text-center pb-2 border-b border-dashed border-slate-900 mb-2">
          <h2 class="font-black text-sm">QUICKMOTO AI GARAGE</h2>
          <p class="text-[10px]">Eachanari NH 83, Coimbatore</p>
          <p class="text-[10px]">Ph: 9894312456</p>
        </div>

        <div class="space-y-0.5 mb-2 pb-2 border-b border-dashed border-slate-900 text-[10px]">
          <p><strong>JC:</strong> ${estimate.id}</p>
          <p><strong>Date:</strong> ${formatDateShort(estimate.createdAt)}</p>
          <p><strong>Cust:</strong> ${customer.name} (${customer.phone})</p>
          <p><strong>Veh:</strong> ${customer.vehicle}</p>
          <p><strong>Reg:</strong> ${customer.reg}</p>
        </div>

        <div class="space-y-1.5 mb-2 pb-2 border-b border-dashed border-slate-900">
          ${estimate.items.map((it) => `
            <div class="flex justify-between">
              <span>${it.label.slice(0, 20)}</span>
              <span>${inr(it.partCost + it.laborCost)}</span>
            </div>
          `).join("")}
        </div>

        <div class="space-y-0.5 text-right font-bold text-xs pb-2 border-b border-dashed border-slate-900">
          <div class="flex justify-between">
            <span>Parts:</span>
            <span>${inr(estimate.partsCost)}</span>
          </div>
          <div class="flex justify-between">
            <span>Labor:</span>
            <span>${inr(estimate.laborCost)}</span>
          </div>
          <div class="flex justify-between text-sm font-black pt-1">
            <span>TOTAL:</span>
            <span>${inr(estimate.grandTotal)}</span>
          </div>
        </div>

        <div class="text-center pt-2 text-[9px] text-slate-600">
          <p>Thank You For Choosing Us!</p>
          <p>UPI: quickmotogarage@upi</p>
        </div>
      </div>
    `;

    window.print();
  }
}
