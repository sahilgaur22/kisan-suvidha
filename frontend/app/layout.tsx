import type { Metadata } from "next";
import "./globals.css";
import QueryProvider from "../lib/query-provider";
import PWAInstallPrompt from "../components/PWAInstallPrompt";

export const metadata: Metadata = {
  title: "Kisan Suvidha — Dynamic MSP Token & Queue Management",
  description: "Official National MSP Token & Dynamic Queue Management Portal for Farmers & Mandi Procurement Centers",
  manifest: "/manifest.json",
  themeColor: "#404E3B",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-slate-50 text-slate-900 min-h-screen">
        <QueryProvider>
          {children}
          <PWAInstallPrompt />
        </QueryProvider>
      </body>
    </html>
  );
}
