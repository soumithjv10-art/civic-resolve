"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShieldAlert,
  MapPin,
  BarChart3,
  Lock,
  PlusCircle,
  Home,
  CheckCircle2,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Complaints Feed", icon: Home },
    { href: "/map", label: "Civic Map", icon: MapPin },
    { href: "/analytics", label: "Accountability", icon: BarChart3 },
    { href: "/admin", label: "Admin Queue", icon: Lock },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#FFFFFF] border-b border-[#E6E1D6] shadow-sm">
      {/* Top Municipal Banner */}
      <div className="bg-[#1B4332] text-white text-xs px-4 py-1.5 flex justify-between items-center font-medium">
        <div className="flex items-center space-x-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Municipal Grievance Intelligence Grid • Active Triage Online</span>
        </div>
        <div className="hidden md:flex items-center space-x-4 text-emerald-100">
          <span>Civic Helpline: 1913</span>
          <span>•</span>
          <span>Open Governance Initiative</span>
        </div>
      </div>

      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded-lg bg-[#1B4332] flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
            <ShieldAlert className="w-6 h-6 text-[#C85A32]" />
          </div>
          <div>
            <div className="font-heading font-bold text-xl text-[#1C1917] tracking-tight flex items-center gap-1.5">
              CivicResolve
              <span className="text-[10px] font-semibold bg-[#F3EFE8] text-[#1B4332] px-2 py-0.5 rounded border border-[#E6E1D6]">
                Gov 2.0
              </span>
            </div>
            <p className="text-[11px] text-[#57534E] -mt-1 hidden sm:block">
              Municipal Grievance Intelligence & Accountability
            </p>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
          {navLinks.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  isActive
                    ? "bg-[#F3EFE8] text-[#1B4332] font-semibold"
                    : "text-[#57534E] hover:text-[#1C1917] hover:bg-[#FAF8F5]"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-[#C85A32]" : "text-[#57534E]"}`} />
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* CTA Button */}
        <div className="hidden sm:flex items-center space-x-3">
          <Link
            href="/report"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#C85A32] hover:bg-[#B04A26] text-white font-medium text-sm transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-[#C85A32] focus:ring-offset-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Report an Issue</span>
          </Link>
        </div>

        {/* Mobile menu trigger */}
        <div className="md:hidden flex items-center space-x-2">
          <Link
            href="/report"
            className="p-2 rounded-lg bg-[#C85A32] text-white"
            aria-label="Report issue"
          >
            <PlusCircle className="w-5 h-5" />
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-[#57534E] hover:text-[#1C1917] rounded-md"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#E6E1D6] bg-white px-4 py-3 space-y-2">
          {navLinks.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-md text-sm font-medium ${
                  isActive
                    ? "bg-[#F3EFE8] text-[#1B4332] font-semibold"
                    : "text-[#57534E] hover:bg-[#FAF8F5]"
                }`}
              >
                <Icon className="w-4 h-4 text-[#C85A32]" />
                {item.label}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
