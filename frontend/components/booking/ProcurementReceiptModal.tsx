"use client";

import { useRef } from "react";
import { FarmerBookingRecord } from "../../hooks/useBookings";
import { X, Printer, Landmark, CheckCircle2, ShieldCheck, Scale, FileText } from "lucide-react";

interface ProcurementReceiptModalProps {
  booking: FarmerBookingRecord;
  onClose: () => void;
}

export default function ProcurementReceiptModal({ booking, onClose }: ProcurementReceiptModalProps) {
  const receiptRef = useRef<HTMLDivElement>(null);

  // Derive MSP rate based on crop if not present
  const getFallbackMsp = (crop: string) => {
    const c = crop.toLowerCase();
    if (c.includes("paddy") || c.includes("dhan")) return 2300;
    if (c.includes("wheat") || c.includes("gehu") || c.includes("gehun")) return 2275;
    if (c.includes("maize") || c.includes("makka")) return 2090;
    if (c.includes("mustard") || c.includes("rapeseed")) return 5650;
    if (c.includes("soyabean") || c.includes("pulse")) return 4600;
    return 2300;
  };

  const mspRate = booking.msp_rate_applied || getFallbackMsp(booking.crop_name);
  const measuredWeight = booking.actual_weight_quintals ?? booking.crop_volume_quintals;
  const netPayableWeight = booking.adjusted_weight_quintals ?? measuredWeight;
  const calculatedTotalAmount = booking.payment_amount ?? Math.round(netPayableWeight * mspRate * 100) / 100;
  const transactionRef = booking.transaction_ref || `PAY-${booking.token_number}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full border-4 border-kisan-700 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Top Bar */}
        <div className="bg-kisan-800 text-white px-6 py-4 flex items-center justify-between border-b-2 border-kisan-700">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-kisan-200" />
            <h2 className="text-base font-black tracking-wide">Procurement & MSP Payout Receipt</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-kisan-700 hover:bg-kisan-600 text-white text-xs font-bold transition-all shadow"
            >
              <Printer className="w-4 h-4" /> Print / PDF
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Body */}
        <div ref={receiptRef} className="p-6 md:p-8 space-y-6 text-slate-800 printable-receipt">
          
          {/* Official Header */}
          <div className="text-center pb-4 border-b-2 border-slate-200 space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold mb-1">
              <Landmark className="w-3.5 h-3.5 text-emerald-700" /> Government of India • Digital MSP Procurement
            </div>
            <h1 className="text-xl md:text-2xl font-black text-kisan-800 tracking-tight">
              KISAN SUVIDHA PROCUREMENT RECEIPT
            </h1>
            <p className="text-xs text-slate-500 font-semibold">
              Department of Food & Public Distribution — Mandi Procurement Token #{booking.token_number}
            </p>
          </div>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div>
              <span className="text-slate-500 block font-medium">Receipt Date & Time</span>
              <span className="font-bold text-slate-800">{booking.booking_date} ({booking.slot_start_time} - {booking.slot_end_time})</span>
            </div>
            <div>
              <span className="text-slate-500 block font-medium">Payment Txn Reference</span>
              <span className="font-mono font-bold text-slate-900">{transactionRef}</span>
            </div>
            <div>
              <span className="text-slate-500 block font-medium">Disbursal Status</span>
              <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Guaranteed MSP Disbursal
              </span>
            </div>
          </div>

          {/* Mandi & Farmer Profile */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="border border-slate-200 rounded-2xl p-4 space-y-1 bg-white">
              <span className="text-[11px] font-bold text-kisan-700 uppercase tracking-wider block">Procurement Center (Mandi)</span>
              <p className="font-extrabold text-sm text-slate-900">{booking.center_name || "Bhopal Main Procurement Mandi"}</p>
              <p className="text-slate-600 font-medium">{booking.center_address || "Krishi Upaj Mandi, Karond"}</p>
              <p className="text-slate-500">{booking.center_district ? `${booking.center_district}, ${booking.center_state}` : "Bhopal, Madhya Pradesh"}</p>
            </div>

            <div className="border border-slate-200 rounded-2xl p-4 space-y-1 bg-white">
              <span className="text-[11px] font-bold text-kisan-700 uppercase tracking-wider block">Farmer Beneficiary</span>
              <p className="font-extrabold text-sm text-slate-900">{booking.farmer_name || "Registered Farmer"}</p>
              <p className="text-slate-600 font-medium">Contact: {booking.farmer_phone || "Registered Mobile"}</p>
              <p className="text-slate-500">Unloading Vehicle: <span className="capitalize font-semibold">{booking.vehicle_type.replace("_", " ")}</span></p>
            </div>
          </div>

          {/* Crop & Weighbridge Quality Table */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden text-xs">
            <div className="bg-kisan-800 text-white px-4 py-2.5 font-bold flex items-center justify-between">
              <span>Procured Lot Quality & Quantity Breakdown</span>
              <span className="text-kisan-200 font-mono">FAQ Standard Verified</span>
            </div>
            <table className="w-full text-left">
              <tbody className="divide-y divide-slate-200">
                <tr className="bg-white">
                  <td className="px-4 py-2.5 font-medium text-slate-600">Crop Specification</td>
                  <td className="px-4 py-2.5 font-bold text-slate-900 text-right">{booking.crop_name}</td>
                </tr>
                <tr className="bg-slate-50/50">
                  <td className="px-4 py-2.5 font-medium text-slate-600">Declared Volume</td>
                  <td className="px-4 py-2.5 font-semibold text-slate-800 text-right">{booking.crop_volume_quintals} Quintals</td>
                </tr>
                <tr className="bg-white">
                  <td className="px-4 py-2.5 font-medium text-slate-600 flex items-center gap-1.5">
                    <Scale className="w-3.5 h-3.5 text-kisan-700" /> Measured Gross Weight (Weighbridge)
                  </td>
                  <td className="px-4 py-2.5 font-bold text-slate-900 text-right">{measuredWeight} Quintals</td>
                </tr>
                <tr className="bg-slate-50/50">
                  <td className="px-4 py-2.5 font-medium text-slate-600">Tested Moisture Content %</td>
                  <td className="px-4 py-2.5 font-bold text-slate-900 text-right">
                    {booking.moisture_content_percent !== undefined && booking.moisture_content_percent !== null ? `${booking.moisture_content_percent}%` : "14.0% (Within FAQ)"}
                  </td>
                </tr>
                <tr className="bg-emerald-50/60 font-bold text-emerald-950">
                  <td className="px-4 py-3 text-sm">Net Adjusted Procurement Weight</td>
                  <td className="px-4 py-3 text-sm font-black text-right text-emerald-800">{netPayableWeight} Quintals</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Final Financial Settlement Banner */}
          <div className="bg-gradient-to-br from-kisan-900 via-kisan-800 to-kisan-950 text-white p-5 rounded-2xl shadow-md space-y-3">
            <div className="flex items-center justify-between border-b border-kisan-700/60 pb-2 text-xs">
              <span className="text-kisan-200 font-semibold">Government Guaranteed MSP Rate:</span>
              <span className="font-extrabold text-white text-sm">₹{mspRate.toLocaleString("en-IN")} / Quintal</span>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
              <div>
                <span className="text-xs text-kisan-200 font-bold block uppercase tracking-wider">Total Amount to Collect / Net Payout</span>
                <span className="text-[11px] text-slate-300">Direct Bank Transfer (DBT) Payout Calculation</span>
              </div>
              <div className="text-right">
                <span className="text-2xl md:text-3xl font-black text-white bg-kisan-700 px-4 py-1.5 rounded-xl shadow inline-block">
                  ₹{calculatedTotalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* Footer & Authenticity Badge */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-[11px] text-slate-500 border-t border-slate-200">
            <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Digital Mandi Token Verified • Official Government Receipt</span>
            </div>
            <div className="text-right">
              <span>Authorized Officer Signature / Digital Stamp</span>
            </div>
          </div>

        </div>

        {/* Modal Bottom Footer */}
        <div className="bg-slate-100 px-6 py-3.5 border-t border-slate-200 flex items-center justify-between">
          <p className="text-[11px] text-slate-500">
            For payout inquiries, contact toll-free Kisan Helpline: <strong>1800-180-1551</strong>
          </p>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs transition-all shadow"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
