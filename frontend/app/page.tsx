"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Sprout, Calendar, ShieldCheck, Users, Clock, AlertCircle, Scale, IndianRupee, ChevronRight, Phone, Smartphone, LogOut, User } from "lucide-react";
import GovtFooter from "../components/GovtFooter";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { useUIStore } from "../store/uiStore";
import { useAuthStore } from "../store/authStore";
import { getTranslation } from "../lib/i18n";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const language = useUIStore((state) => state.language);
  const { user, isAuthenticated, logout, validateSession } = useAuthStore();
  const t = getTranslation(language);

  useEffect(() => {
    setMounted(true);
    validateSession();
  }, []);

  const getPortalLink = () => {
    if (!user) return "/login";
    if (user.role === "center_admin") return "/admin/dashboard";
    if (user.role === "staff") return "/staff/queue";
    return "/book-slot";
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col justify-between selection:bg-[#7B9669] selection:text-white">
      <div>
        {/* Top Official Government Header Bar */}
        <header className="bg-[#404E3B] border-b-2 border-[#7B9669] py-3.5 px-6 sticky top-0 z-50 shadow-md">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center p-2 rounded-xl bg-[#7B9669] text-white font-black shadow">
                <Sprout className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] text-[#BAC8B1] font-bold uppercase tracking-widest block">
                  {t.govt_header.title}
                </span>
                <h1 className="text-lg font-extrabold text-white tracking-tight">
                  {t.app_name} <span className="text-xs text-[#BAC8B1] font-normal ml-1">| {t.tagline}</span>
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <LanguageSwitcher />

              {mounted && isAuthenticated && user ? (
                <div className="flex items-center gap-2">
                  <Link
                    href={getPortalLink()}
                    className="px-4 py-2 rounded-xl bg-[#7B9669] hover:bg-[#6C8480] text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md"
                  >
                    <User className="w-3.5 h-3.5" /> My Portal ({user.fullName.split(" ")[0]})
                  </Link>
                  <button
                    type="button"
                    onClick={logout}
                    className="px-3 py-2 rounded-xl bg-rose-950/70 hover:bg-rose-900 border border-rose-600/50 text-rose-200 font-bold text-xs flex items-center gap-1 transition-all"
                    title="Logout"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Logout
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-xl bg-[#7B9669] hover:bg-[#6C8480] text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md"
                >
                  {t.nav.login} <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          </div>
        </header>

        {/* HERO SECTION */}
        <section className="max-w-6xl mx-auto px-4 py-8">
          <div className="relative rounded-3xl overflow-hidden border-2 border-[#6C8480]/30 shadow-2xl bg-[#404E3B] group">
            <div className="relative h-[480px] w-full">
              <Image
                src="/hero_farmer.jpg"
                alt="Indian Farmer riding bullock cart carrying harvested wheat at sunset mandi"
                fill
                priority
                className="object-cover object-center filter brightness-75 group-hover:scale-105 transition-all duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#404E3B] via-[#404E3B]/85 to-[#404E3B]/40 p-8 md:p-12 flex flex-col justify-end">
                
                <div className="mb-4">
                  <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#404E3B]/90 border border-[#7B9669] text-[#BAC8B1] text-xs font-bold backdrop-blur-md shadow-xl">
                    <ShieldCheck className="w-4 h-4 text-[#7B9669]" />
                    {t.landing.hero_badge}
                  </span>
                </div>

                <h2 className="text-3xl md:text-5xl font-black text-white leading-tight tracking-tight drop-shadow-lg max-w-2xl">
                  {t.landing.hero_title_1}{" "}
                  <span className="text-[#BAC8B1] underline decoration-[#7B9669] underline-offset-8">
                    {t.landing.hero_title_highlight}
                  </span>
                </h2>

                <p className="mt-3 text-[#E6E6E6] text-sm md:text-base max-w-xl font-medium leading-relaxed drop-shadow-md">
                  {t.landing.hero_subtitle}
                </p>

                <div className="flex flex-wrap items-center gap-4 mt-8">
                  <Link
                    href="/book-slot"
                    className="px-6 py-3.5 rounded-2xl bg-[#7B9669] hover:bg-[#6C8480] text-white font-extrabold text-sm flex items-center gap-2 transition-all shadow-xl hover:scale-105"
                  >
                    <Calendar className="w-4 h-4" /> {t.landing.cta_book}
                  </Link>

                  <Link
                    href="/login"
                    className="px-6 py-3.5 rounded-2xl bg-[#404E3B] border-2 border-[#BAC8B1]/40 hover:border-[#7B9669] text-white font-bold text-sm backdrop-blur-md transition-all"
                  >
                    {t.landing.cta_login}
                  </Link>

                  <Link
                    href="/complaints"
                    className="px-5 py-3.5 rounded-2xl bg-[#6C8480]/60 border border-[#BAC8B1]/40 text-white font-bold text-xs backdrop-blur-md hover:bg-[#6C8480] transition-all flex items-center gap-1.5"
                  >
                    <AlertCircle className="w-4 h-4 text-[#BAC8B1]" /> {t.landing.cta_complaint}
                  </Link>
                </div>

              </div>
            </div>
          </div>
        </section>

        {/* Live MSP Rate Bar */}
        <section className="max-w-6xl mx-auto px-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            
            <div className="bg-[#404E3B] text-white p-5 rounded-2xl shadow-lg border-l-4 border-[#7B9669] flex items-center justify-between">
              <div>
                <span className="text-[11px] text-[#BAC8B1] font-semibold uppercase block">{t.msp_bar.paddy}</span>
                <span className="text-xl font-black text-white mt-0.5 block">₹2,300 <span className="text-xs text-[#BAC8B1]">/ Qtl</span></span>
              </div>
              <div className="p-3 bg-[#7B9669]/30 text-[#BAC8B1] rounded-xl">
                <IndianRupee className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-[#404E3B] text-white p-5 rounded-2xl shadow-lg border-l-4 border-[#7B9669] flex items-center justify-between">
              <div>
                <span className="text-[11px] text-[#BAC8B1] font-semibold uppercase block">{t.msp_bar.wheat}</span>
                <span className="text-xl font-black text-white mt-0.5 block">₹2,425 <span className="text-xs text-[#BAC8B1]">/ Qtl</span></span>
              </div>
              <div className="p-3 bg-[#7B9669]/30 text-[#BAC8B1] rounded-xl">
                <IndianRupee className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-[#404E3B] text-white p-5 rounded-2xl shadow-lg border-l-4 border-[#7B9669] flex items-center justify-between">
              <div>
                <span className="text-[11px] text-[#BAC8B1] font-semibold uppercase block">{t.msp_bar.weighing}</span>
                <span className="text-sm font-bold text-[#BAC8B1] mt-1 block">{t.msp_bar.weighing_sub}</span>
              </div>
              <div className="p-3 bg-[#7B9669]/30 text-[#BAC8B1] rounded-xl">
                <Scale className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-[#404E3B] text-white p-5 rounded-2xl shadow-lg border-l-4 border-[#7B9669] flex items-center justify-between">
              <div>
                <span className="text-[11px] text-[#BAC8B1] font-semibold uppercase block">{t.msp_bar.congestion}</span>
                <span className="text-sm font-bold text-white mt-1 block">{t.msp_bar.congestion_sub}</span>
              </div>
              <div className="p-3 bg-[#7B9669]/30 text-[#BAC8B1] rounded-xl">
                <Clock className="w-5 h-5" />
              </div>
            </div>

          </div>
        </section>

        {/* Feature Highlights Section */}
        <section className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-black text-[#404E3B]">{t.services.title}</h3>
            <p className="text-xs text-[#6C8480] font-semibold mt-1">{t.services.subtitle}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white border-2 border-[#BAC8B1] p-6 rounded-2xl space-y-3 shadow-md hover:shadow-xl transition-all">
              <div className="p-3.5 bg-[#7B9669] text-white rounded-xl w-fit shadow">
                <Calendar className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-[#404E3B]">{t.services.card1_title}</h4>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                {t.services.card1_desc}
              </p>
            </div>

            <div className="bg-white border-2 border-[#BAC8B1] p-6 rounded-2xl space-y-3 shadow-md hover:shadow-xl transition-all">
              <div className="p-3.5 bg-[#7B9669] text-white rounded-xl w-fit shadow">
                <Phone className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-[#404E3B]">{t.services.card2_title}</h4>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                {t.services.card2_desc}
              </p>
            </div>

            <div className="bg-white border-2 border-[#BAC8B1] p-6 rounded-2xl space-y-3 shadow-md hover:shadow-xl transition-all">
              <div className="p-3.5 bg-[#7B9669] text-white rounded-xl w-fit shadow">
                <Users className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-[#404E3B]">{t.services.card3_title}</h4>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                {t.services.card3_desc}
              </p>
            </div>
          </div>

          {/* SMS / WhatsApp Farmer Quick-Start Banner */}
          <div className="bg-[#404E3B] text-white p-6 rounded-3xl border-2 border-[#BAC8B1]/40 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-[#7B9669] text-white rounded-2xl shadow-lg shrink-0">
                <Smartphone className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-lg font-extrabold text-white">{t.sms_banner.title}</h4>
                <p className="text-xs text-[#BAC8B1] mt-0.5">{t.sms_banner.subtitle}</p>
                <div className="mt-2 font-mono text-xs bg-black/40 text-[#BAC8B1] p-2.5 rounded-xl border border-[#6C8480]/50">
                  BOOK [CENTER_CODE] [CROP] [WEIGHT] [VEHICLE] [DATE]
                </div>
              </div>
            </div>

            <div className="bg-[#7B9669]/20 border border-[#7B9669]/50 p-4 rounded-2xl text-xs space-y-1.5 shrink-0 text-center md:text-left">
              <span className="text-[11px] text-[#BAC8B1] uppercase font-bold block">{t.sms_banner.helpline_title}</span>
              <span className="text-base font-black text-white block">1800-180-1551</span>
              <span className="text-[11px] text-[#7B9669] font-bold block">{t.sms_banner.whatsapp_title}: +91 98765 43210</span>
            </div>
          </div>

        </section>
      </div>

      <GovtFooter />
    </div>
  );
}
