"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { PlusCircle, MapPin, Search, ArrowRight } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export function Hero() {
  const [trackingQuery, setTrackingQuery] = useState("");
  const router = useRouter();
  const { t } = useLanguage();

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingQuery.trim()) return;
    const cleanId = trackingQuery.trim().toUpperCase();
    router.push(`/complaint/${cleanId}`);
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-[#FAF8F5] via-[#FFFFFF] to-[#FAF8F5] border-b border-[#E6E1D6] py-10 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4 sm:space-y-6">
          {/* Headline */}
          <h1 className="font-heading font-extrabold text-3xl sm:text-5xl lg:text-6xl text-[#1C1917] tracking-tight leading-[1.15]">
            {t.heroTitle}
          </h1>

          {/* Subtitle - Clean & Concise */}
          <p className="text-base sm:text-lg text-[#57534E] leading-relaxed max-w-2xl mx-auto">
            {t.heroSubtitle}
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/report"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#C85A32] hover:bg-[#B04A26] text-white font-semibold text-base transition-all shadow-warm hover:shadow-warm-md"
            >
              <PlusCircle className="w-5 h-5" />
              <span>{t.reportIssueBtn}</span>
            </Link>

            <Link
              href="/map"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#FFFFFF] hover:bg-[#F3EFE8] border border-[#E6E1D6] text-[#1C1917] font-semibold text-base transition-all shadow-sm"
            >
              <MapPin className="w-5 h-5 text-[#1B4332]" />
              <span>{t.exploreMapBtn}</span>
            </Link>
          </div>

          {/* Direct Tracking ID Lookup Input */}
          <div className="pt-2 max-w-md mx-auto">
            <form
              onSubmit={handleTrack}
              className="flex items-center bg-white border border-[#E6E1D6] rounded-xl shadow-warm p-1.5 focus-within:ring-2 focus-within:ring-[#1B4332] focus-within:border-transparent transition-all"
            >
              <Search className="w-4 h-4 text-[#57534E] ml-2 shrink-0" />
              <input
                type="text"
                placeholder={t.trackPlaceholder}
                value={trackingQuery}
                onChange={(e) => setTrackingQuery(e.target.value)}
                className="w-full bg-transparent px-3 py-1.5 text-xs sm:text-sm text-[#1C1917] placeholder:text-stone-400 focus:outline-none font-mono"
              />
              <button
                type="submit"
                className="inline-flex items-center gap-1 px-3.5 py-1.5 bg-[#1B4332] hover:bg-[#2D6A4F] text-white rounded-lg text-xs font-semibold shrink-0 transition-colors"
              >
                <span>{t.trackBtn}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
