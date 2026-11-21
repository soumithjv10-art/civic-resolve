"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Complaint } from "@/lib/types";
import { PriorityBadge } from "./PriorityBadge";
import { StatusBadge } from "./StatusBadge";
import { SLAIndicator } from "./SLAIndicator";
import { formatDate } from "@/lib/utils";
import {
  MapPin,
  Building2,
  ThumbsUp,
  Sparkles,
  Layers,
  ArrowUpRight,
} from "lucide-react";

interface ComplaintCardProps {
  complaint: Complaint;
  onUpvote?: (id: string, newCount: number) => void;
}

function ComplaintCardComponent({ complaint, onUpvote }: ComplaintCardProps) {
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
    } catch {
      // Revert optimistic increment on failure
      setUpvotes((prev) => Math.max(0, prev - 1));
      setHasUpvoted(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#FAF8F5] border border-[#E6E1D6] rounded-2xl p-5 hover:shadow-md hover:border-[#D0C7B8] transition-all flex flex-col justify-between">
      <div>
        {/* Top Badges */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <PriorityBadge priority={complaint.priority} />
            <StatusBadge status={complaint.status} />
          </div>

          <span className="text-[11px] font-mono text-[#57534E] tracking-tight bg-white px-2 py-0.5 rounded-md border border-[#E6E1D6]">
            {complaint.id}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-[#1C1917] leading-snug line-clamp-2 mb-1.5">
          <Link
            href={`/complaint/${complaint.id}`}
            className="hover:text-[#1B4332] transition-colors"
          >
            {complaint.title}
          </Link>
        </h3>

        {/* Location & Department */}
        <div className="space-y-1 mb-3 text-xs text-[#57534E]">
          <div className="flex items-center gap-1.5 truncate">
            <MapPin className="w-3.5 h-3.5 text-[#C85A32] shrink-0" />
            <span className="truncate">{complaint.location}</span>
          </div>

          <div className="flex items-center gap-1.5 truncate">
            <Building2 className="w-3.5 h-3.5 text-[#1B4332] shrink-0" />
            <span className="truncate">{complaint.department}</span>
          </div>
        </div>

        {/* AI Municipal Summary */}
        {complaint.aiSummary && (
          <div className="mb-3 p-2.5 rounded-xl bg-white border border-[#E6E1D6] text-xs text-[#1C1917] flex items-start gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[#C85A32] shrink-0 mt-0.5" />
            <p className="line-clamp-2 leading-relaxed italic">{complaint.aiSummary}</p>
          </div>
        )}

        {/* Attached Photo Preview */}
        {complaint.imageUrl && (
          <div className="mb-3 relative rounded-xl overflow-hidden aspect-video max-h-40 bg-[#E6E1D6]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={complaint.imageUrl}
              alt={complaint.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        )}

        {/* Duplicate Indicator */}
        {(complaint.duplicateCount || 0) > 0 && (
          <div className="mb-3 inline-flex items-center gap-1.5 text-xs text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg">
            <Layers className="w-3 h-3" />
            <span>Grouped incident ({complaint.duplicateCount} duplicate reports)</span>
          </div>
        )}
      </div>

      {/* Footer Meta & Actions */}
      <div className="pt-3 border-t border-[#E6E1D6] mt-2 flex flex-col gap-2.5">
        <div className="flex items-center justify-between text-xs text-[#57534E]">
          <span>Logged {formatDate(complaint.createdAt)}</span>
          <SLAIndicator
            priority={complaint.priority}
            createdAt={complaint.createdAt}
            slaDeadline={complaint.slaDeadline}
            status={complaint.status}
            resolvedAt={complaint.resolvedAt}
          />
        </div>

        <div className="flex items-center justify-between gap-2 pt-1">
          <button
            type="button"
            onClick={handleUpvote}
            disabled={hasUpvoted || isSubmitting}
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

export const ComplaintCard = React.memo(ComplaintCardComponent);
