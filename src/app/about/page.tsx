import Link from "next/link";
import { ShieldCheck, ArrowRight, Heart } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white border border-[#E6E1D6] rounded-2xl p-8 sm:p-12 shadow-warm space-y-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F3EFE8] text-xs font-semibold text-[#1B4332]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#C85A32]" />
          <span>Municipal Open Governance Charter</span>
        </div>
        <h1 className="font-heading font-extrabold text-3xl text-[#1C1917]">
          About CivicResolve
        </h1>
        <p className="text-sm text-[#57534E] leading-relaxed">
          CivicResolve is a modern municipal intelligence and public accountability platform built to bridge the gap between citizen reporting and actual field resolution.
        </p>
        <div className="p-4 bg-[#FAF8F5] rounded-xl border border-[#E6E1D6] text-xs text-[#57534E] space-y-2">
          <strong className="text-[#1C1917] block font-semibold">Core Principles:</strong>
          <ul className="list-disc pl-5 space-y-1">
            <li>Zero Black-Box Triage: Every priority recommendation by Gemini 3.8 Flash includes verifiable justification.</li>
            <li>Enforced Resolution SLAs: 4h for critical life hazards, 24h for urgent repairs.</li>
            <li>Community Verification: An issue is only closed when verified with photographic proof and citizen confirmation.</li>
          </ul>
        </div>
        <div className="pt-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1B4332] text-white text-sm font-semibold hover:bg-[#2D6A4F] transition-colors"
          >
            <span>Back to Public Feed</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
