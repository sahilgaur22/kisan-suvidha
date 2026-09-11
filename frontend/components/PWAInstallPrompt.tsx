"use client";

import { useEffect, useState } from "react";
import { Download, X, Sprout } from "lucide-react";

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Register Service Worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch((err) => {
        console.error("Service worker registration failed:", err);
      });
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setIsVisible(false);
    }
    setDeferredPrompt(null);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 z-50 max-w-sm bg-slate-900 border border-amber-500/50 p-4 rounded-2xl shadow-2xl flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="bg-gradient-to-tr from-amber-400 to-kisan-400 p-2 rounded-xl text-slate-900">
          <Sprout className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-white">Install Kisan Suvidha App</h4>
          <p className="text-[11px] text-slate-400">Offline PWA slot booking on your home screen</p>
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={handleInstallClick}
          className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1 transition-all shadow-md"
        >
          <Download className="w-3.5 h-3.5" /> Install
        </button>
        <button
          type="button"
          onClick={() => setIsVisible(false)}
          className="p-1.5 text-slate-500 hover:text-slate-300"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
