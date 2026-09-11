"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sprout, Lock, Phone, User, ArrowLeft, ShieldAlert, UserPlus, LogIn, Mail, ShieldCheck, CheckCircle2, Building2 } from "lucide-react";
import LoginToggle, { LoginTab } from "../../components/auth/LoginToggle";
import LanguageSwitcher from "../../components/LanguageSwitcher";
import { useAuthStore } from "../../store/authStore";
import { useUIStore } from "../../store/uiStore";
import { getTranslation } from "../../lib/i18n";
import { apiClient } from "../../lib/api-client";
import { useProcurementCenters } from "../../hooks/useBookings";

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const language = useUIStore((state) => state.language);
  const t = getTranslation(language);
  const { data: centers } = useProcurementCenters();

  const [activeTab, setActiveTab] = useState<LoginTab>("farmer");
  const [subMode, setSubMode] = useState<"login" | "register">("login");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [selectedCenterId, setSelectedCenterId] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const resetForm = () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setOtpSent(false);
    setFullName("");
    setEmail("");
    setPhone("");
    setPassword("");
    setSelectedCenterId("");
    setOtp("");
  };

  const handleAdminStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    const roleToAssign = activeTab === "admin" ? "center_admin" : "staff";

    try {
      if (subMode === "register") {
        // Register New Admin or Ground Staff Account
        const regData = await apiClient<{
          access_token: string;
          user_id: string;
          full_name: string;
          role: "center_admin" | "staff";
          center_id: string | null;
        }>("/auth/register", {
          method: "POST",
          body: JSON.stringify({
            full_name: fullName,
            email,
            phone: phone || "9876543210",
            password,
            role: roleToAssign,
            center_id: selectedCenterId || undefined,
          }),
        });

        if (roleToAssign === "staff") {
          setSuccessMsg("Registration successful! Ground staff account was created and is pending approval by the Center Admin.");
          setSubMode("login");
          return;
        }

        // If Center Admin, log in immediately with token returned
        setAuth(
          {
            id: regData.user_id,
            fullName: regData.full_name,
            phone: phone,
            role: regData.role,
            centerId: regData.center_id,
          },
          regData.access_token
        );
        router.push("/admin/dashboard");
      } else {
        // Login Existing Admin or Staff
        const data = await apiClient<{
          access_token: string;
          user_id: string;
          full_name: string;
          role: "center_admin" | "staff";
          center_id: string | null;
        }>("/auth/login", {
          method: "POST",
          body: JSON.stringify({
            email,
            password,
            login_context: activeTab === "admin" ? "center_admin" : activeTab,
          }),
        });

        setAuth(
          {
            id: data.user_id,
            fullName: data.full_name,
            phone: "",
            role: data.role,
            centerId: data.center_id,
          },
          data.access_token
        );

        if (data.role === "center_admin") {
          router.push("/admin/dashboard");
        } else {
          router.push("/staff/queue");
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Operation failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const isReg = subMode === "register";
      await apiClient("/auth/farmer/otp/send", {
        method: "POST",
        body: JSON.stringify({
          phone: phone.trim(),
          full_name: isReg ? fullName.trim() : undefined,
          is_registration: isReg,
        }),
      });
      setOtpSent(true);
      if (isReg) {
        setSuccessMsg("Registration OTP sent! Enter the code below to complete registration.");
      } else {
        setSuccessMsg("Login OTP sent to your registered mobile number.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to send OTP code.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const isReg = subMode === "register";
      const data = await apiClient<{
        access_token: string;
        farmer_id: string;
        full_name: string;
        phone: string;
      }>("/auth/farmer/otp/verify", {
        method: "POST",
        body: JSON.stringify({
          phone: phone.trim(),
          otp: otp.trim(),
          full_name: isReg ? fullName.trim() : undefined,
          is_registration: isReg,
        }),
      });

      setAuth(
        {
          id: data.farmer_id,
          fullName: data.full_name || fullName || "Farmer",
          phone: data.phone,
          role: "farmer",
          centerId: null,
        },
        data.access_token
      );

      router.push("/book-slot");
    } catch (err: any) {
      setErrorMsg(err.message || "Invalid OTP code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between text-slate-900 p-6">
      <header className="max-w-md mx-auto w-full pt-4 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-kisan-800 hover:text-kisan-700 transition-all bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" /> {t.nav.home}
        </Link>
        <LanguageSwitcher />
      </header>

      <main className="max-w-md mx-auto w-full bg-gradient-to-br from-kisan-900 via-kisan-800 to-kisan-950 border-2 border-kisan-700/40 p-8 rounded-3xl shadow-2xl text-white my-8">
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="bg-gradient-to-tr from-amber-400 to-kisan-400 p-2.5 rounded-2xl text-kisan-950 shadow">
            <Sprout className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">{t.app_name}</h1>
            <p className="text-xs text-kisan-200 font-semibold">
              {activeTab === "farmer"
                ? subMode === "login"
                  ? t.auth.existing_farmer
                  : t.auth.new_farmer
                : activeTab === "admin"
                ? subMode === "login"
                  ? "Center Admin Portal Access"
                  : "Create New Center Admin"
                : subMode === "login"
                ? "Ground Staff Access"
                : "Register New Ground Staff"}
            </p>
          </div>
        </div>

        <LoginToggle
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
            resetForm();
          }}
        />

        {/* Sub-Toggle for Login vs Registration across all roles */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-kisan-950/80 border border-kisan-700/60 rounded-xl mb-6 text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setSubMode("login");
              resetForm();
            }}
            className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              subMode === "login"
                ? "bg-kisan-700 text-white shadow"
                : "text-kisan-200 hover:text-white"
            }`}
          >
            <LogIn className="w-3.5 h-3.5" /> Existing {activeTab === "farmer" ? "Farmer" : activeTab === "admin" ? "Admin" : "Staff"} Login
          </button>

          <button
            type="button"
            onClick={() => {
              setSubMode("register");
              resetForm();
            }}
            className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              subMode === "register"
                ? "bg-kisan-700 text-white shadow"
                : "text-kisan-200 hover:text-white"
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" /> New {activeTab === "farmer" ? "Farmer" : activeTab === "admin" ? "Admin" : "Staff"} Registration
          </button>
        </div>

        {/* Staff Admin Approval Info Notice */}
        {activeTab === "staff" && (
          <div className="p-3 mb-4 bg-amber-500/10 border border-amber-400/40 rounded-xl text-[11px] text-amber-200 space-y-1">
            <div className="flex items-center gap-1.5 text-white font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" /> Ground Staff Approval Notice
            </div>
            <p>{t.auth.staff_notice}</p>
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-3.5 bg-kisan-700/40 border border-kisan-400 rounded-xl text-white text-xs flex items-center gap-2 font-semibold">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-kisan-300" />
            {successMsg}
          </div>
        )}

        {errorMsg && (
          <div className="mb-6 p-3.5 bg-rose-900/80 border border-rose-600 rounded-xl text-rose-100 text-xs flex items-center gap-2 font-semibold">
            <ShieldAlert className="w-4 h-4 shrink-0 text-rose-300" />
            {errorMsg}
          </div>
        )}

        {activeTab !== "farmer" ? (
          <form onSubmit={handleAdminStaffSubmit} className="space-y-4">
            {subMode === "register" && (
              <div>
                <label htmlFor="fullName" className="block text-xs font-bold text-kisan-200 mb-1.5">
                  Full Name <span className="text-rose-300">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-kisan-300 absolute left-3.5 top-3.5" />
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    required
                    placeholder="Enter full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-kisan-950/90 border-2 border-kisan-700/60 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-kisan-400 transition-all font-bold placeholder:text-kisan-300/40"
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-xs font-bold text-kisan-200 mb-1.5">
                {t.auth.email_label} <span className="text-rose-300">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-kisan-300 absolute left-3.5 top-3.5" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder={
                    activeTab === "admin"
                      ? "admin@kisansuvidha.gov.in"
                      : "staff@kisansuvidha.gov.in"
                  }
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-kisan-950/90 border-2 border-kisan-700/60 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-kisan-400 transition-all font-semibold placeholder:text-kisan-300/40"
                />
              </div>
            </div>

            {subMode === "register" && (
              <>
                <div>
                  <label htmlFor="centerId" className="block text-xs font-bold text-kisan-200 mb-1.5 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-amber-400" /> Assigned Procurement Mandi Center <span className="text-rose-300">*</span>
                  </label>
                  <select
                    id="centerId"
                    name="centerId"
                    required
                    value={selectedCenterId}
                    onChange={(e) => setSelectedCenterId(e.target.value)}
                    className="w-full bg-kisan-950/90 border-2 border-kisan-700/60 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-kisan-400 transition-all font-bold"
                  >
                    <option value="">-- Choose Assigned Procurement Center --</option>
                    {centers?.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.code} - {c.district}, {c.state})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="phone" className="block text-xs font-bold text-kisan-200 mb-1.5">
                    Mobile Phone Number <span className="text-rose-300">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-kisan-300 absolute left-3.5 top-3.5" />
                    <input
                      id="phone"
                      name="phone"
                      type="text"
                      required
                      placeholder="10-digit mobile number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-kisan-950/90 border-2 border-kisan-700/60 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-kisan-400 transition-all font-semibold placeholder:text-kisan-300/40"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label htmlFor="password" className="block text-xs font-bold text-kisan-200 mb-1.5">
                {t.auth.password_label} <span className="text-rose-300">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-kisan-300 absolute left-3.5 top-3.5" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-kisan-950/90 border-2 border-kisan-700/60 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-kisan-400 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 rounded-xl bg-kisan-700 hover:bg-kisan-600 text-white font-black text-sm transition-all shadow-lg disabled:opacity-50"
            >
              {loading
                ? "Processing..."
                : subMode === "register"
                ? `Create & Register ${activeTab === "admin" ? "Center Admin" : "Ground Staff"}`
                : `Login as ${activeTab === "admin" ? "Center Admin" : "Ground Staff"}`}
            </button>
          </form>
        ) : (
          <form onSubmit={otpSent ? handleVerifyOtp : handleRequestOtp} className="space-y-4">
            {subMode === "register" && !otpSent && (
              <div>
                <label htmlFor="farmerFullName" className="block text-xs font-bold text-kisan-200 mb-1.5">
                  {t.auth.full_name_label} <span className="text-rose-300">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-kisan-300 absolute left-3.5 top-3.5" />
                  <input
                    id="farmerFullName"
                    name="farmerFullName"
                    type="text"
                    required
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-kisan-950/90 border-2 border-kisan-700/60 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-kisan-400 transition-all font-bold placeholder:text-kisan-300/40"
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="farmerPhone" className="block text-xs font-bold text-kisan-200 mb-1.5">
                {t.auth.phone_label} <span className="text-rose-300">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-kisan-300 absolute left-3.5 top-3.5" />
                <input
                  id="farmerPhone"
                  name="farmerPhone"
                  type="text"
                  required
                  disabled={otpSent}
                  placeholder="10-digit mobile number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-kisan-950/90 border-2 border-kisan-700/60 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-kisan-400 transition-all disabled:opacity-60 font-bold placeholder:text-kisan-300/40"
                />
              </div>
            </div>

            {otpSent && (
              <div>
                <label htmlFor="otp" className="block text-xs font-bold text-kisan-200 mb-1.5">
                  {t.auth.otp_label}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-kisan-300 absolute left-3.5 top-3.5" />
                  <input
                    id="otp"
                    name="otp"
                    type="text"
                    required
                    maxLength={6}
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full bg-kisan-950/90 border-2 border-kisan-700/60 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-kisan-400 transition-all tracking-widest text-center font-bold"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 rounded-xl bg-kisan-700 hover:bg-kisan-600 text-white font-black text-sm transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading
                ? "Processing..."
                : otpSent
                ? subMode === "register"
                  ? t.auth.verify_otp_reg
                  : t.auth.verify_otp_login
                : subMode === "register"
                ? t.auth.send_reg_otp
                : t.auth.send_login_otp}
            </button>

            {otpSent && (
              <button
                type="button"
                onClick={() => setOtpSent(false)}
                className="w-full text-center text-xs text-kisan-200 hover:text-white mt-2 underline"
              >
                Change mobile number
              </button>
            )}
          </form>
        )}
      </main>

      <footer className="text-center text-xs text-slate-500 font-semibold pb-4">
        {t.footer.gov_title}
      </footer>
    </div>
  );
}
