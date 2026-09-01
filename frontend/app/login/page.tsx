"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sprout, Lock, Phone, ArrowLeft, ShieldAlert } from "lucide-react";
import LoginToggle, { LoginTab } from "../../components/auth/LoginToggle";
import { useAuthStore } from "../../store/authStore";
import { apiClient } from "../../lib/api-client";

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [activeTab, setActiveTab] = useState<LoginTab>("admin");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleAdminStaffLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const data = await apiClient<{
        access_token: string;
        user: {
          id: string;
          full_name: string;
          phone: string;
          role: "super_admin" | "center_admin" | "staff" | "farmer";
          center_id: string | null;
        };
      }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          phone,
          password,
          login_context: activeTab,
        }),
      });

      setAuth(
        {
          id: data.user.id,
          fullName: data.user.full_name,
          phone: data.user.phone,
          role: data.user.role,
          centerId: data.user.center_id,
        },
        data.access_token
      );

      if (data.user.role === "center_admin" || data.user.role === "super_admin") {
        router.push("/admin/dashboard");
      } else {
        router.push("/staff/queue");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Invalid credentials or unauthorized login context.");
    } finally {
      setLoading(false);
    }
  };

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      await apiClient("/auth/farmer/otp/request", {
        method: "POST",
        body: JSON.stringify({ phone }),
      });
      setOtpSent(true);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to send OTP code.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const data = await apiClient<{
        access_token: string;
        farmer: {
          id: string;
          full_name: string;
          phone: string;
        };
      }>("/auth/farmer/otp/verify", {
        method: "POST",
        body: JSON.stringify({ phone, otp }),
      });

      setAuth(
        {
          id: data.farmer.id,
          fullName: data.farmer.full_name,
          phone: data.farmer.phone,
          role: "farmer",
          centerId: null,
        },
        data.access_token
      );

      router.push("/my-bookings");
    } catch (err: any) {
      setErrorMsg(err.message || "Invalid OTP code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-between text-slate-100 p-6">
      <header className="max-w-md mx-auto w-full pt-4 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
      </header>

      <main className="max-w-md mx-auto w-full bg-slate-900/90 border border-slate-800 p-8 rounded-3xl shadow-2xl backdrop-blur my-8">
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="bg-emerald-500 p-2.5 rounded-2xl text-slate-950">
            <Sprout className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Kisan Suvidha</h1>
            <p className="text-xs text-emerald-400">Portal Login</p>
          </div>
        </div>

        <LoginToggle activeTab={activeTab} onTabChange={setActiveTab} />

        {errorMsg && (
          <div className="mb-6 p-3.5 bg-rose-950/60 border border-rose-800/80 rounded-xl text-rose-300 text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400" />
            {errorMsg}
          </div>
        )}

        {activeTab !== "farmer" ? (
          <form onSubmit={handleAdminStaffLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Mobile Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  placeholder="10-digit mobile number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-emerald-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-emerald-500 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
            >
              {loading ? "Authenticating..." : `Login as ${activeTab === "admin" ? "Center Admin" : "Ground Staff"}`}
            </button>
          </form>
        ) : (
          <form onSubmit={otpSent ? handleVerifyOtp : handleRequestOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Farmer Mobile Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  disabled={otpSent}
                  placeholder="10-digit mobile number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-emerald-500 transition-all disabled:opacity-60"
                />
              </div>
            </div>

            {otpSent && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Enter 6-Digit OTP Code
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-emerald-500 transition-all tracking-widest text-center font-bold"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
            >
              {loading ? "Processing..." : otpSent ? "Verify OTP & Login" : "Send One-Time OTP Passcode"}
            </button>

            {otpSent && (
              <button
                type="button"
                onClick={() => setOtpSent(false)}
                className="w-full text-center text-xs text-slate-400 hover:text-slate-200 mt-2 underline"
              >
                Change mobile number
              </button>
            )}
          </form>
        )}
      </main>

      <footer className="text-center text-xs text-slate-600 pb-4">
        Ministry of Consumer Affairs | Smart India Hackathon 2026
      </footer>
    </div>
  );
}
