"use client";

import { useState } from "react";
import { Sprout, Truck, Scale, Building2, CheckCircle2, ShieldAlert } from "lucide-react";
import { useProcurementCenters, useCreateBooking, BookingConfirmation } from "../../hooks/useBookings";
import SlotAvailabilityCalendar from "./SlotAvailabilityCalendar";
import { useUIStore } from "../../store/uiStore";
import { getTranslation } from "../../lib/i18n";

export default function SlotBookingForm() {
  const { language } = useUIStore();
  const t = getTranslation(language);

  const { data: centers, isLoading: centersLoading } = useProcurementCenters();
  const createBookingMutation = useCreateBooking();

  const [centerId, setCenterId] = useState("");
  const [cropName, setCropName] = useState("Paddy (Dhan)");
  const [cropVolume, setCropVolume] = useState("50");
  const [vehicleType, setVehicleType] = useState<"tractor_trolley" | "small_pickup" | "heavy_truck" | "bullock_cart">("tractor_trolley");
  const [bookingDate, setBookingDate] = useState(new Date().toISOString().split("T")[0]);

  const [confirmation, setConfirmation] = useState<BookingConfirmation | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!centerId) {
      setErrorMsg("Please select a procurement center.");
      return;
    }

    createBookingMutation.mutate(
      {
        center_id: centerId,
        crop_name: cropName,
        crop_volume_quintals: parseFloat(cropVolume),
        vehicle_type: vehicleType,
        booking_date: bookingDate,
        channel: "web",
      },
      {
        onSuccess: (data) => {
          setConfirmation(data);
        },
        onError: (err: any) => {
          setErrorMsg(err.message || "Booking slot reservation failed.");
        },
      }
    );
  };

  if (confirmation) {
    return (
      <div className="bg-slate-900 border border-emerald-600/50 p-8 rounded-3xl shadow-2xl text-center space-y-6 max-w-lg mx-auto">
        <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/40">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white mb-1">{t.booking.success_title}</h2>
          <p className="text-xs text-emerald-400">SIH Guaranteed Dynamic Slot Token</p>
        </div>

        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
          <div>
            <span className="text-xs text-slate-400 uppercase tracking-widest">{t.booking.token_number}</span>
            <div className="text-4xl font-extrabold text-emerald-400 tracking-wider mt-1">
              {confirmation.token_number}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-slate-800/80 pt-4 text-left">
            <div>
              <span className="text-xs text-slate-400 block">Date</span>
              <span className="text-sm font-semibold text-white">{confirmation.booking_date}</span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block">{t.booking.arrival_window}</span>
              <span className="text-sm font-semibold text-emerald-300">
                {confirmation.slot_start_time} - {confirmation.slot_end_time}
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setConfirmation(null)}
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-emerald-600/20"
        >
          Book Another Token Slot
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-slate-900/90 border border-slate-800 p-8 rounded-3xl shadow-2xl backdrop-blur space-y-6 max-w-xl mx-auto">
      <div className="flex items-center gap-3 mb-2">
        <div className="bg-emerald-500 p-2.5 rounded-2xl text-slate-950">
          <Sprout className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">{t.booking.title}</h2>
          <p className="text-xs text-emerald-400">Guaranteed MSP Token Allocation</p>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3.5 bg-rose-950/60 border border-rose-800/80 rounded-xl text-rose-300 text-xs flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400" />
          {errorMsg}
        </div>
      )}

      {/* Center Selection */}
      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
          <Building2 className="w-4 h-4 text-emerald-400" />
          {t.booking.select_center}
        </label>
        <select
          value={centerId}
          onChange={(e) => setCenterId(e.target.value)}
          required
          className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-emerald-500 transition-all"
        >
          <option value="">-- Choose Procurement Center --</option>
          {centers?.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} ({c.code}) — {c.district}, {c.state}
            </option>
          ))}
          {!centers && (
            <option value="11111111-1111-1111-1111-111111111111">
              Bhopal Main Procurement Mandi (MP-CTR-014)
            </option>
          )}
        </select>
      </div>

      {/* Crop Name */}
      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
          <Sprout className="w-4 h-4 text-emerald-400" />
          {t.booking.crop_name}
        </label>
        <select
          value={cropName}
          onChange={(e) => setCropName(e.target.value)}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-emerald-500 transition-all"
        >
          <option value="Paddy (Dhan)">Paddy (Dhan)</option>
          <option value="Wheat (Gehun)">Wheat (Gehun)</option>
          <option value="Maize (Makka)">Maize (Makka)</option>
          <option value="Mustard (Sarson)">Mustard (Sarson)</option>
        </select>
      </div>

      {/* Volume & Vehicle Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
            <Scale className="w-4 h-4 text-emerald-400" />
            {t.booking.crop_volume}
          </label>
          <input
            type="number"
            min="1"
            max="1000"
            required
            value={cropVolume}
            onChange={(e) => setCropVolume(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-emerald-500 transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
            <Truck className="w-4 h-4 text-emerald-400" />
            {t.booking.vehicle_type}
          </label>
          <select
            value={vehicleType}
            onChange={(e) => setVehicleType(e.target.value as any)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-emerald-500 transition-all"
          >
            <option value="tractor_trolley">Tractor Trolley</option>
            <option value="small_pickup">Small Pickup (Bolero)</option>
            <option value="heavy_truck">Heavy Truck (10-Tyre)</option>
            <option value="bullock_cart">Bullock Cart</option>
          </select>
        </div>
      </div>

      {/* Date Availability Calendar */}
      <SlotAvailabilityCalendar selectedDate={bookingDate} onSelectDate={setBookingDate} />

      <button
        type="submit"
        disabled={createBookingMutation.isPending}
        className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-base transition-all shadow-xl shadow-emerald-500/20 disabled:opacity-50"
      >
        {createBookingMutation.isPending ? "Calculating Dynamic Slot..." : t.booking.submit}
      </button>
    </form>
  );
}
