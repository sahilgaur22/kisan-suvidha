"use client";

import { useState, useEffect } from "react";
import { Sprout, Scale, Truck, Calendar, Building2, CheckCircle2, ShieldAlert } from "lucide-react";
import SlotAvailabilityCalendar from "./SlotAvailabilityCalendar";
import { useProcurementCenters, useCreateBooking } from "../../hooks/useBookings";
import { useUIStore } from "../../store/uiStore";
import { getTranslation } from "../../lib/i18n";

export default function SlotBookingForm() {
  const language = useUIStore((state) => state.language);
  const t = getTranslation(language);

  const { data: centers, isLoading: loadingCenters } = useProcurementCenters();
  const createBookingMutation = useCreateBooking();

  const getLocalDateString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const [selectedCenter, setSelectedCenter] = useState("");
  const [selectedCrop, setSelectedCrop] = useState("Paddy (Dhan)");
  const [cropVolume, setCropVolume] = useState("50");
  const [vehicleType, setVehicleType] = useState("tractor_trolley");
  const [selectedDate, setSelectedDate] = useState(getLocalDateString());

  const [bookingSuccess, setBookingSuccess] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Auto-select first center if available and none chosen
  useEffect(() => {
    if (centers && centers.length > 0 && !selectedCenter) {
      setSelectedCenter(centers[0].id);
    }
  }, [centers, selectedCenter]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!selectedCenter) {
      setErrorMsg("Please select a procurement mandi center.");
      return;
    }

    createBookingMutation.mutate(
      {
        center_id: selectedCenter,
        crop_name: selectedCrop,
        crop_volume_quintals: parseFloat(cropVolume),
        vehicle_type: vehicleType as any,
        booking_date: selectedDate,
      },
      {
        onSuccess: (data) => {
          setBookingSuccess(data);
        },
        onError: (err: any) => {
          setErrorMsg(err.message || "Failed to reserve token. Please check slot limits.");
        },
      }
    );
  };

  if (bookingSuccess) {
    return (
      <div className="bg-[#404E3B] border-2 border-[#7B9669] p-8 rounded-3xl shadow-2xl text-center space-y-4 max-w-xl mx-auto my-6 text-white">
        <div className="w-16 h-16 bg-[#7B9669] text-white rounded-full flex items-center justify-center mx-auto shadow-lg">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-black text-white">{t.booking.success_title}</h2>
        <p className="text-xs text-[#BAC8B1]">Government Procurement Gate Access Issued</p>

        <div className="bg-[#404E3B]/90 border border-[#BAC8B1]/40 p-6 rounded-2xl text-left space-y-3 text-xs">
          <div className="flex justify-between border-b border-[#BAC8B1]/30 pb-2">
            <span className="text-[#BAC8B1]">{t.booking.token_number}:</span>
            <span className="font-mono font-bold text-[#BAC8B1] text-base">{bookingSuccess.token_number}</span>
          </div>
          <div className="flex justify-between border-b border-[#BAC8B1]/30 pb-2">
            <span className="text-[#BAC8B1]">{t.booking.booking_date}:</span>
            <span className="font-bold text-white">{bookingSuccess.booking_date}</span>
          </div>
          <div className="flex justify-between border-b border-[#BAC8B1]/30 pb-2">
            <span className="text-[#BAC8B1]">{t.booking.arrival_window}:</span>
            <span className="font-bold text-[#BAC8B1]">{bookingSuccess.slot_start_time} - {bookingSuccess.slot_end_time}</span>
          </div>
          <div className="flex justify-between border-b border-[#BAC8B1]/30 pb-2">
            <span className="text-[#BAC8B1]">{t.booking.crop_name}:</span>
            <span className="font-semibold text-white">{bookingSuccess.crop_name} ({bookingSuccess.crop_volume_quintals} Qtl)</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setBookingSuccess(null)}
          className="w-full py-3 bg-[#7B9669] hover:bg-[#6C8480] text-white font-bold rounded-xl text-xs transition-all shadow-lg"
        >
          Book Another Token
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-[#404E3B] text-white border-2 border-[#BAC8B1]/40 p-8 rounded-3xl shadow-2xl space-y-6 max-w-xl mx-auto my-6">
      <div className="flex items-center gap-3">
        <div className="bg-[#7B9669] p-2.5 rounded-2xl text-white shadow">
          <Sprout className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-black text-white">{t.booking.title}</h2>
          <p className="text-xs text-[#BAC8B1] font-medium">Guaranteed MSP Token Allocation</p>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3.5 bg-rose-900/80 border border-rose-600 rounded-xl text-rose-100 text-xs flex items-center gap-2 font-semibold">
          <ShieldAlert className="w-4 h-4 shrink-0 text-rose-300" />
          {errorMsg}
        </div>
      )}

      {/* 1. Mandi Selection */}
      <div>
        <label className="block text-xs font-bold text-[#BAC8B1] mb-1.5 flex items-center gap-1.5">
          <Building2 className="w-4 h-4 text-[#7B9669]" />
          {t.booking.select_center}
        </label>
        <select
          value={selectedCenter}
          onChange={(e) => setSelectedCenter(e.target.value)}
          required
          className="w-full bg-[#404E3B] border-2 border-[#6C8480] rounded-xl py-3 px-4 text-xs text-white focus:outline-none focus:border-[#7B9669]"
        >
          <option value="">-- Choose Procurement Center --</option>
          {centers?.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} ({c.code})
            </option>
          ))}
          {!centers && (
            <option value="11111111-1111-1111-1111-111111111111">
              Bhopal Main Procurement Mandi (MP-CTR-014)
            </option>
          )}
        </select>
      </div>

      {/* 2. Crop Selection */}
      <div>
        <label className="block text-xs font-bold text-[#BAC8B1] mb-1.5 flex items-center gap-1.5">
          <Sprout className="w-4 h-4 text-[#7B9669]" />
          {t.booking.crop_name}
        </label>
        <select
          value={selectedCrop}
          onChange={(e) => setSelectedCrop(e.target.value)}
          className="w-full bg-[#404E3B] border-2 border-[#6C8480] rounded-xl py-3 px-4 text-xs text-white focus:outline-none focus:border-[#7B9669]"
        >
          <option value="Paddy (Dhan)">Paddy (Dhan)</option>
          <option value="Wheat (Gehu)">Wheat (Gehu)</option>
          <option value="Maize (Makka)">Maize (Makka)</option>
          <option value="Mustard / Rapeseed">Mustard / Rapeseed</option>
          <option value="Soyabean / Pulses">Soyabean / Pulses</option>
        </select>
      </div>

      {/* 3. Crop Weight & Vehicle Type */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-[#BAC8B1] mb-1.5 flex items-center gap-1.5">
            <Scale className="w-4 h-4 text-[#7B9669]" />
            {t.booking.crop_volume}
          </label>
          <input
            type="number"
            min="1"
            max="500"
            value={cropVolume}
            onChange={(e) => setCropVolume(e.target.value)}
            className="w-full bg-[#404E3B] border-2 border-[#6C8480] rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-[#7B9669] font-bold"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[#BAC8B1] mb-1.5 flex items-center gap-1.5">
            <Truck className="w-4 h-4 text-[#7B9669]" />
            {t.booking.vehicle_type}
          </label>
          <select
            value={vehicleType}
            onChange={(e) => setVehicleType(e.target.value)}
            className="w-full bg-[#404E3B] border-2 border-[#6C8480] rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-[#7B9669] font-semibold"
          >
            <option value="tractor_trolley">Tractor Trolley</option>
            <option value="pickup">Small Pickup / Mini Truck</option>
            <option value="truck">Heavy Commercial Truck</option>
            <option value="bullock_cart">Bullock Cart / Hand Cart</option>
            <option value="other">Other Transport / Custom Vehicle</option>
          </select>
        </div>
      </div>

      {/* 4. Visual 7-Day Date Calendar */}
      <div>
        <label className="block text-xs font-bold text-[#BAC8B1] mb-1.5 flex items-center gap-1.5">
          <Calendar className="w-4 h-4 text-[#7B9669]" />
          {t.booking.booking_date}
        </label>
        <SlotAvailabilityCalendar
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
        />
      </div>

      <button
        type="submit"
        disabled={createBookingMutation.isPending}
        className="w-full py-3.5 bg-[#7B9669] hover:bg-[#6C8480] text-white font-black text-sm rounded-xl transition-all shadow-xl disabled:opacity-50"
      >
        {createBookingMutation.isPending ? "Reserving Slot..." : t.booking.submit}
      </button>
    </form>
  );
}
