"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  MapPin,
  BarChart3,
  Lock,
  PlusCircle,
  Home,
  Menu,
  X,
  Globe,
} from "lucide-react";
import { useState } from "react";
import { Logo } from "@/components/Logo";
import { useLanguage } from "@/context/LanguageContext";
import { SupportedLanguage } from "@/lib/i18n";

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();

  const navLinks = [
    { href: "/", label: t.navFeed, icon: Home },
    { href: "/map", label: t.navMap, icon: MapPin },
    { href: "/analytics", label: t.navAccountability, icon: BarChart3 },
    { href: "/admin", label: t.navAdmin, icon: Lock },
  ];

  const languages: { code: SupportedLanguage; label: string }[] = [
    { code: "en", label: "EN" },
    { code: "ta", label: "தமிழ்" },
    { code: "hi", label: "हिंदी" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#FFFFFF] border-b border-[#E6E1D6] shadow-sm">
      {/* Top Municipal Banner */}
      <div className="bg-[#1B4332] text-white text-xs px-4 py-1.5 flex justify-between items-center font-medium">
        <div className="flex items-center space-x-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Municipal Grievance Intelligence Grid • {t.liveGrid}</span>
        </div>
        <div className="hidden sm:flex items-center space-x-3 text-emerald-100 text-[11px]">
          <span>{t.helpline}</span>
          <span>•</span>
          <span>Open Municipal Accountability</span>
        </div>
      </div>

      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
        {/* Brand with Proper Custom Logo */}
        <Link href="/" className="flex items-center space-x-3 group shrink-0">
          <Logo className="w-10 h-10 transition-transform group-hover:scale-105" />
          <div>
            <div className="font-heading font-bold text-xl text-[#1C1917] tracking-tight flex items-center gap-1.5">
              CivicResolve
              <span className="text-[10px] font-semibold bg-[#F3EFE8] text-[#1B4332] px-2 py-0.5 rounded border border-[#E6E1D6]">
                Gov 2.0
              </span>
            </div>
            <p className="text-[11px] text-[#57534E] -mt-1 hidden lg:block">
              {t.portalSubtitle}
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
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  isActive
                    ? "bg-[#F3EFE8] text-[#1B4332] font-semibold"
                    : "text-[#57534E] hover:text-[#1C1917] hover:bg-[#FAF8F5]"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-[#C85A32]" : "text-[#57534E]"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Actions & Language Selector */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Multi-Language Selector */}
          <div className="flex items-center bg-[#F3EFE8] p-1 rounded-xl border border-[#E6E1D6] text-xs font-semibold">
            <Globe className="w-3.5 h-3.5 text-[#1B4332] mr-1 hidden sm:inline" />
            {languages.map((l) => (
              <button
                key={l.code}
                onClick={() => setLanguage(l.code)}
                className={`px-2 py-1 rounded-lg text-xs transition-all ${
                  language === l.code
                    ? "bg-[#1B4332] text-white shadow-xs font-bold"
                    : "text-[#57534E] hover:text-[#1C1917]"
                }`}
                title={`Switch language to ${l.label}`}
              >
                {l.label}
              </button>
            ))}
          </div>

          {/* Report CTA Button */}
          <Link
            href="/report"
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#C85A32] hover:bg-[#B04A26] text-white font-semibold text-xs sm:text-sm transition-colors shadow-sm shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t.navReportBtn}</span>
          </Link>

          {/* Mobile menu trigger */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-[#57534E] hover:text-[#1C1917] hover:bg-[#F3EFE8]"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#E6E1D6] bg-white px-4 py-4 space-y-2 shadow-warm">
          {navLinks.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium ${
                  isActive ? "bg-[#F3EFE8] text-[#1B4332] font-semibold" : "text-[#57534E]"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-[#C85A32]" : "text-[#57534E]"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
          <Link
            href="/report"
            onClick={() => setMobileMenuOpen(false)}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[#C85A32] text-white font-semibold text-sm shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t.navReportBtn}</span>
          </Link>
        </div>
      )}
    </header>
  );
}
