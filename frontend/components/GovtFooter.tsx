"use client";

import Link from "next/link";
import { Phone, Mail, MapPin, ExternalLink, ShieldCheck, Globe, Landmark } from "lucide-react";
import { useUIStore } from "../store/uiStore";
import { getTranslation } from "../lib/i18n";

export default function GovtFooter() {
  const language = useUIStore((state) => state.language);
  const t = getTranslation(language);

  return (
    <footer className="bg-kisan-950 border-t-4 border-kisan-700 text-slate-300 text-xs">
      {/* Top Banner */}
      <div className="bg-kisan-900/90 border-b border-kisan-800 py-4 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-kisan-800 border border-kisan-700 rounded-xl text-kisan-300">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                {t.footer.gov_title}
              </h3>
              <p className="text-[11px] text-kisan-200">{t.footer.gov_subtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-kisan-800 border border-kisan-700 text-kisan-200 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-kisan-400" /> Official Government Portal
            </span>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Col 1: About Portal */}
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider border-b border-kisan-700 pb-2 inline-block">
            {t.footer.about_title}
          </h4>
          <p className="text-kisan-200 text-xs leading-relaxed">
            {t.footer.about_desc}
          </p>
          <div className="flex items-center gap-2 pt-1 text-[11px] text-kisan-300">
            <Globe className="w-3.5 h-3.5 text-kisan-400" /> Digital India Initiative
          </div>
        </div>

        {/* Col 2: Quick Links */}
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider border-b border-kisan-700 pb-2 inline-block">
            {t.footer.services_title}
          </h4>
          <ul className="space-y-2 text-slate-200 text-xs">
            <li>
              <Link href="/book-slot" className="hover:text-kisan-300 transition-all flex items-center gap-1.5">
                • {t.nav.book_slot}
              </Link>
            </li>
            <li>
              <Link href="/complaints" className="hover:text-kisan-300 transition-all flex items-center gap-1.5">
                • {t.nav.complaints}
              </Link>
            </li>
            <li>
              <Link href="/login" className="hover:text-kisan-300 transition-all flex items-center gap-1.5">
                • {t.auth.admin_tab} {t.nav.login}
              </Link>
            </li>
            <li>
              <Link href="/login" className="hover:text-kisan-300 transition-all flex items-center gap-1.5">
                • {t.auth.staff_tab} {t.nav.login}
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 3: External Portals */}
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider border-b border-kisan-700 pb-2 inline-block">
            {t.footer.portals_title}
          </h4>
          <ul className="space-y-2 text-slate-200 text-xs">
            <li>
              <a href="https://dfpd.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-kisan-300 transition-all flex items-center gap-1.5">
                • Dept. of Food & Public Distribution <ExternalLink className="w-3 h-3 text-kisan-300" />
              </a>
            </li>
            <li>
              <a href="https://agriwelfare.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-kisan-300 transition-all flex items-center gap-1.5">
                • Ministry of Agriculture & Farmers Welfare <ExternalLink className="w-3 h-3 text-kisan-300" />
              </a>
            </li>
            <li>
              <a href="https://fci.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-kisan-300 transition-all flex items-center gap-1.5">
                • Food Corporation of India (FCI) <ExternalLink className="w-3 h-3 text-kisan-300" />
              </a>
            </li>
            <li>
              <a href="https://pmkisan.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-kisan-300 transition-all flex items-center gap-1.5">
                • PM-KISAN Samman Nidhi <ExternalLink className="w-3 h-3 text-kisan-300" />
              </a>
            </li>
          </ul>
        </div>

        {/* Col 4: National Helpline */}
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider border-b border-kisan-700 pb-2 inline-block">
            {t.footer.helpline_title}
          </h4>
          <div className="bg-kisan-900 border border-kisan-800 p-3.5 rounded-2xl space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
              <Phone className="w-4 h-4" /> 1800-180-1551
            </div>
            <p className="text-[11px] text-kisan-200">National Kisan Call Center (24x7 Multi-lingual Support)</p>
          </div>
          <div className="text-[11px] text-kisan-200 space-y-1">
            <div className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-kisan-300" /> support-kisan@nic.in</div>
            <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-kisan-300" /> Krishi Bhawan, New Delhi 110001</div>
          </div>
        </div>
      </div>

      {/* Bottom Copyright Bar */}
      <div className="bg-kisan-950 border-t border-kisan-900 py-4 px-6 text-center text-[11px] text-slate-400 space-y-1">
        <p>{t.footer.copyright}</p>
        <div className="flex items-center justify-center gap-4 pt-2 text-slate-300 text-[11px]">
          <span className="hover:underline cursor-pointer">Privacy Policy</span> • 
          <span className="hover:underline cursor-pointer">Terms of Service</span> • 
          <span className="hover:underline cursor-pointer">Hyperlinking Policy</span> • 
          <span className="hover:underline cursor-pointer">Accessibility Statement</span>
        </div>
      </div>
    </footer>
  );
}
