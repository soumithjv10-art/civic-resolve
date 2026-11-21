"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  PlusCircle,
  MapPin,
  Search,
  ShieldCheck,
  Zap,
  Eye,
  ArrowRight,
} from "lucide-react";

export function Hero() {
  const [trackingQuery, setTrackingQuery] = useState("");
  const router = useRouter();

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingQuery.trim()) return;
    const cleanId = trackingQuery.trim().toUpperCase();
    router.push(`/complaint/${cleanId}`);
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-[#FAF8F5] via-[#FFFFFF] to-[#FAF8F5] border-b border-[#E6E1D6] py-14 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          {/* Municipal Trust Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F3EFE8] border border-[#E6E1D6] text-xs font-semibold text-[#1B4332]">
            <ShieldCheck className="w-4 h-4 text-[#C85A32]" />
            <span>AI-Powered Municipal Grievance & Civic Accountability Platform</span>
          </div>

          {/* Master Headline */}
          <h1 className="font-heading font-extrabold text-3xl sm:text-5xl lg:text-6xl text-[#1C1917] tracking-tight leading-[1.15]">
            Better Cities Begin With Better Accountability.
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-[#57534E] leading-relaxed max-w-2xl mx-auto">
            Report civic problems, track real progress, and help build safer, cleaner communities. Powered by Gemini 3.8 Flash municipal triage, spatial hotspot detection, and transparent citizen verification.
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/report"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#C85A32] hover:bg-[#B04A26] text-white font-semibold text-base transition-all shadow-warm hover:shadow-warm-md"
            >
              <PlusCircle className="w-5 h-5" />
              <span>Report an Issue</span>
            </Link>

            <Link
              href="/map"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#FFFFFF] hover:bg-[#F3EFE8] border border-[#E6E1D6] text-[#1C1917] font-semibold text-base transition-all shadow-sm"
            >
              <MapPin className="w-5 h-5 text-[#1B4332]" />
              <span>Explore Civic Map</span>
            </Link>
          </div>

          {/* Direct Tracking ID Lookup Input */}
          <div className="pt-6 max-w-md mx-auto">
            <form
              onSubmit={handleTrack}
              className="flex items-center bg-white border border-[#E6E1D6] rounded-xl shadow-warm p-1.5 focus-within:ring-2 focus-within:ring-[#1B4332] focus-within:border-transparent transition-all"
            >
              <Search className="w-4 h-4 text-[#57534E] ml-2 shrink-0" />
              <input
                type="text"
                placeholder="Track ID e.g. CIVIC-2026-10492..."
                value={trackingQuery}
                onChange={(e) => setTrackingQuery(e.target.value)}
                className="w-full bg-transparent px-3 py-1.5 text-xs sm:text-sm text-[#1C1917] placeholder:text-stone-400 focus:outline-none font-mono"
              />
              <button
                type="submit"
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#1B4332] hover:bg-[#2D6A4F] text-white rounded-lg text-xs font-semibold shrink-0 transition-colors"
              >
                <span>Track</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

          {/* Value Props Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8 border-t border-[#E6E1D6] text-left">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-white/60 border border-[#E6E1D6]/60">
              <div className="w-8 h-8 rounded-lg bg-[#F3EFE8] flex items-center justify-center text-[#1B4332] shrink-0 mt-0.5">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#1C1917]">Instant AI Triage</h4>
                <p className="text-[11px] text-[#57534E] leading-snug">
                  Gemini 3.8 Flash assesses severity, flags duplicates, and routes to departments in seconds.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-white/60 border border-[#E6E1D6]/60">
              <div className="w-8 h-8 rounded-lg bg-[#F3EFE8] flex items-center justify-center text-[#C85A32] shrink-0 mt-0.5">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#1C1917]">Enforced SLAs</h4>
                <p className="text-[11px] text-[#57534E] leading-snug">
                  4h for critical hazards, 24h for urgent repairs, backed by automatic department escalations.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-white/60 border border-[#E6E1D6]/60">
              <div className="w-8 h-8 rounded-lg bg-[#F3EFE8] flex items-center justify-center text-[#1B4332] shrink-0 mt-0.5">
                <Eye className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#1C1917]">Citizen Verification</h4>
                <p className="text-[11px] text-[#57534E] leading-snug">
                  Repairs require before/after photographic proof and community confirmation to close.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
