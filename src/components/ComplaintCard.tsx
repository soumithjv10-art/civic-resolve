"use client";

import Link from "next/link";
import { useState } from "react";
import { Complaint } from "@/lib/types";
import { PriorityBadge } from "./PriorityBadge";
import { StatusBadge } from "./StatusBadge";
import { SLAIndicator } from "./SLAIndicator";
import { formatDate } from "@/lib/utils";
import {
  MapPin,
  Building2,
  ThumbsUp,
  Clock,
  Sparkles,
  Layers,
  ArrowUpRight,
  Shield,
  FileQuestion,
} from "lucide-react";

interface ComplaintCardProps {
  complaint: Complaint;
  onUpvote?: (id: string, newCount: number) => void;
}

export function ComplaintCard({ complaint, onUpvote }: ComplaintCardProps) {
  const [upvotes, setUpvotes] = useState(complaint.upvotes || 0);
  const [hasUpvoted, setHasUpvoted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleUpvote = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (hasUpvoted || isSubmitting) return;

    setIsSubmitting(true);
    setUpvotes((prev) => prev + 1);
    setHasUpvoted(true);

    try {
      const res = await fetch(`/api/complaints/${complaint.id}/upvote`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.success) {
        setUpvotes(data.upvotes);
        onUpvote?.(complaint.id, data.upvotes);
      }
    } catch (err) {
      console.warn("Upvote failed:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#FFFFFF] rounded-2xl border border-[#E6E1D6] p-5 sm:p-6 shadow-warm hover:shadow-warm-md transition-all flex flex-col justify-between group">
      <div>
        {/* Top Meta Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-[#1B4332] bg-[#F3EFE8] px-2 py-0.5 rounded border border-[#E6E1D6]">
              {complaint.id}
            </span>
            {complaint.duplicateCount > 0 && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full">
                <Layers className="w-3 h-3" />
                {complaint.duplicateCount + 1} reports
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <PriorityBadge priority={complaint.priority} />
            <StatusBadge status={complaint.status} />
          </div>
        </div>

        {/* Title */}
        <Link href={`/complaint/${complaint.id}`} className="block group-hover:text-[#1B4332]">
          <h3 className="font-heading font-semibold text-base sm:text-lg text-[#1C1917] mb-2 leading-snug transition-colors line-clamp-2">
            {complaint.title}
          </h3>
        </Link>

        {/* Location & Reported Date */}
        <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-[#57534E] mb-3">
          <span className="inline-flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-[#C85A32] shrink-0" />
            <span className="truncate max-w-[220px]">{complaint.location}</span>
          </span>
          <span className="text-stone-300">•</span>
          <span className="inline-flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-stone-400" />
            <span>{formatDate(complaint.createdAt)}</span>
          </span>
        </div>

        {/* AI Editorial Summary Box */}
        <div className="bg-[#FAF8F5] rounded-xl p-3 border border-[#E6E1D6] mb-4 text-xs text-[#57534E] leading-relaxed">
          <div className="flex items-center gap-1.5 font-semibold text-[#1C1917] mb-1">
            <Sparkles className="w-3.5 h-3.5 text-[#C85A32]" />
            <span>AI Triage Summary</span>
            {complaint.isFallback && (
              <span className="text-[10px] font-normal text-stone-500 bg-white px-1.5 py-0.2 rounded border border-[#E6E1D6]">
                Rule-based
              </span>
            )}
          </div>
          <p className="line-clamp-2">{complaint.aiSummary}</p>
        </div>
      </div>

      {/* Footer Info & Actions */}
      <div className="pt-3 border-t border-[#E6E1D6] flex flex-col gap-3">
        {/* Department & SLA Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1 text-[#1B4332] font-medium">
            <Building2 className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate max-w-[200px]">{complaint.department}</span>
          </div>
          <div>
            <SLAIndicator
              priority={complaint.priority}
              createdAt={complaint.createdAt}
              slaDeadline={complaint.slaDeadline}
              status={complaint.status}
              resolvedAt={complaint.resolvedAt}
            />
          </div>
        </div>

        {/* Upvote & View CTA */}
        <div className="flex items-center justify-between pt-1">
          <button
            onClick={handleUpvote}
            disabled={hasUpvoted}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              hasUpvoted
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                : "bg-[#F3EFE8] text-[#1C1917] hover:bg-[#E6E1D6] border border-transparent"
            }`}
            title="Upvote this complaint to raise civic urgency"
          >
            <ThumbsUp className={`w-3.5 h-3.5 ${hasUpvoted ? "text-emerald-700" : "text-[#57534E]"}`} />
            <span>{upvotes} Upvotes</span>
          </button>

          <Link
            href={`/complaint/${complaint.id}`}
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#1B4332] hover:text-[#2D6A4F] group/link"
          >
            <span>View Full Audit</span>
            <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
