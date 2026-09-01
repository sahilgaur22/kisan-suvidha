import type { Metadata } from "next";
import "./globals.css";
import QueryProvider from "../lib/query-provider";

export const metadata: Metadata = {
  title: "Kisan Suvidha — Dynamic MSP Token & Queue Management",
  description: "Smart India Hackathon SIH 26032 - MSP Token & Dynamic Queue System for Farmers & Procurement Centers",
  manifest: "/manifest.json",
  themeColor: "#059669",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-slate-50 text-slate-900 min-h-screen">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
