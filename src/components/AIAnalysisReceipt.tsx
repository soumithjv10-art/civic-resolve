"use client";

import Link from "next/link";
import { useState } from "react";
import { PriorityBadge } from "./PriorityBadge";
import {
  CheckCircle,
  Copy,
  Check,
  Building2,
  Clock,
  Sparkles,
  AlertTriangle,
  ArrowRight,
  PlusCircle,
  Info,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export interface AIReceiptData {
  trackingId: string;
  category: string;
  priority: "Low" | "Medium" | "High" | "Critical";
  department: string;
  aiSummary: string;
  aiReasoning?: string;
  isFallback?: boolean;
  slaDeadline: string;
  potentialDuplicate?: {
    matchedId?: string;
    confidence: number;
    reasons: string[];
  } | null;
}


interface AIAnalysisReceiptProps {
  receipt: AIReceiptData;
  onReset?: () => void;
}

export function AIAnalysisReceipt({ receipt, onReset }: AIAnalysisReceiptProps) {
  const [copied, setCopied] = useState(false);

  const copyTrackingId = () => {
    navigator.clipboard.writeText(receipt.trackingId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E6E1D6] p-6 sm:p-8 shadow-warm-lg max-w-2xl mx-auto">
      {/* Header Badge */}
      <div className="flex items-center gap-3 mb-6 pb-6 border-b border-[#E6E1D6]">
        <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
          <CheckCircle className="w-6 h-6" />
        </div>
        <div>
          <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
            Grievance Formally Registered
          </span>
          <h2 className="font-heading font-bold text-2xl text-[#1C1917]">
            Municipal Triage Receipt
          </h2>
        </div>
      </div>

      {/* Tracking ID Callout */}
      <div className="bg-[#FAF8F5] border border-[#E6E1D6] rounded-xl p-4 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <span className="text-xs text-[#57534E] uppercase font-semibold">
            Official Citizen Tracking ID
          </span>
          <div className="font-mono text-xl sm:text-2xl font-bold text-[#1B4332] tracking-wider">
            {receipt.trackingId}
          </div>
        </div>
        <button
          onClick={copyTrackingId}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E6E1D6] bg-white text-xs font-medium text-[#1C1917] hover:bg-[#F3EFE8] transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-emerald-700">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-[#57534E]" />
              <span>Copy Tracking ID</span>
            </>
          )}
        </button>
      </div>

      {/* AI Triage Information Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {/* Category */}
        <div className="p-3.5 rounded-xl border border-[#E6E1D6] bg-[#FFFFFF]">
          <span className="text-xs text-[#57534E] block mb-1 font-medium">
            Assigned Category
          </span>
          <span className="font-semibold text-sm text-[#1C1917]">
            {receipt.category}
          </span>
        </div>

        {/* Priority */}
        <div className="p-3.5 rounded-xl border border-[#E6E1D6] bg-[#FFFFFF] flex flex-col justify-between">
          <span className="text-xs text-[#57534E] block mb-1 font-medium">
            Triage Priority
          </span>
          <div>
            <PriorityBadge priority={receipt.priority} />
          </div>
        </div>

        {/* Department */}
        <div className="p-3.5 rounded-xl border border-[#E6E1D6] bg-[#FFFFFF] sm:col-span-2">
          <span className="text-xs text-[#57534E] block mb-1 font-medium flex items-center gap-1">
            <Building2 className="w-3.5 h-3.5 text-[#1B4332]" />
            Responsible Department
          </span>
          <span className="font-semibold text-sm text-[#1C1917]">
            {receipt.department}
          </span>
        </div>

        {/* SLA Target */}
        <div className="p-3.5 rounded-xl border border-[#E6E1D6] bg-[#FFFFFF] sm:col-span-2">
          <span className="text-xs text-[#57534E] block mb-1 font-medium flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-[#C85A32]" />
            Mandated SLA Target Deadline
          </span>
          <span className="font-semibold text-sm text-[#C85A32]">
            {formatDate(receipt.slaDeadline)}
          </span>
        </div>
      </div>

      {/* AI Assessment & Reasoning Note */}
      <div className="p-4 rounded-xl bg-[#F3EFE8] border border-[#E6E1D6] mb-6 space-y-2">
        <div className="flex items-center gap-2">
          {receipt.isFallback ? (
            <Info className="w-4 h-4 text-[#57534E]" />
          ) : (
            <Sparkles className="w-4 h-4 text-[#C85A32]" />
          )}
          <span className="text-xs font-semibold text-[#1C1917]">
            {receipt.isFallback
              ? "Deterministic Rule-Based Triage Applied"
              : "Gemini 3.8 Flash Civic Triage Intelligence"}
          </span>
        </div>
        <p className="text-xs text-[#57534E] leading-relaxed">
          {receipt.aiSummary}
        </p>
        {receipt.aiReasoning && (
          <p className="text-[11px] text-[#57534E] italic pt-1 border-t border-[#E6E1D6]">
            Reasoning: {receipt.aiReasoning}
          </p>
        )}
      </div>

      {/* Duplicate Incident Warning if present */}
      {receipt.potentialDuplicate && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 mb-6 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <strong className="text-amber-900 block font-semibold">
              Potential Shared Civic Incident Detected
            </strong>
            <p className="text-amber-800 leading-relaxed">
              Our spatial intelligence detected this report overlaps with existing open incident{" "}
              <span className="font-mono font-semibold underline">
                {receipt.potentialDuplicate.matchedId}
              </span>{" "}
              ({Math.round(receipt.potentialDuplicate.confidence * 100)}% match:{" "}
              {receipt.potentialDuplicate.reasons.join(", ")}). Both reports have been grouped together for faster municipal resolution.
            </p>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <Link
          href={`/complaint/${receipt.trackingId}`}
          className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#1B4332] hover:bg-[#2D6A4F] text-white font-medium text-sm transition-colors shadow-sm"
        >
          <span>Track Complaint Progress</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
        {onReset && (
          <button
            onClick={onReset}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white hover:bg-[#F3EFE8] border border-[#E6E1D6] text-[#1C1917] font-medium text-sm transition-colors"
          >
            <PlusCircle className="w-4 h-4 text-[#57534E]" />
            <span>Submit Another</span>
          </button>
        )}
      </div>
    </div>
  );
}
