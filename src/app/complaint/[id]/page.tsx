"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { Complaint, AuditLog } from "@/lib/types";
import { PriorityBadge } from "@/components/PriorityBadge";
import { StatusBadge } from "@/components/StatusBadge";
import { SLAIndicator } from "@/components/SLAIndicator";
import { StatusStepper } from "@/components/StatusStepper";
import { formatDate } from "@/lib/utils";
import {
  ArrowLeft,
  MapPin,
  Building2,
  Clock,
  Sparkles,
  ThumbsUp,
  ShieldCheck,
  UserCheck,
  History,
  AlertTriangle,
  CheckCircle2,
  Share2,
  Copy,
  Check,
  Layers,
} from "lucide-react";

export default function ComplaintDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const { id } = resolvedParams;

  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [upvotes, setUpvotes] = useState(0);
  const [hasUpvoted, setHasUpvoted] = useState(false);

  // Citizen Verification & Dispute state
  const [verifyingAction, setVerifyingAction] = useState<"confirming" | "disputing" | null>(null);
  const [disputeReason, setDisputeReason] = useState("");
  const [showDisputeInput, setShowDisputeInput] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const handleCitizenConfirm = async () => {
    if (!complaint) return;
    setVerifyingAction("confirming");
    setActionFeedback(null);
    try {
      const res = await fetch(`/api/complaints/${complaint.id}/verify`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.success) {
        setComplaint(data.complaint);
        setActionFeedback("Thank you! You have confirmed the municipal resolution. This grievance is now formally closed.");
      }
    } catch {
      setActionFeedback("Failed to confirm resolution. Please try again.");
    } finally {
      setVerifyingAction(null);
    }
  };

  const handleCitizenDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaint || disputeReason.trim().length < 5) return;
    setVerifyingAction("disputing");
    setActionFeedback(null);
    try {
      const res = await fetch(`/api/complaints/${complaint.id}/reopen`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: disputeReason.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setComplaint(data.complaint);
        setShowDisputeInput(false);
        setActionFeedback("Dispute registered. Grievance has been reopened and elevated to supervisor rework queue.");
      }
    } catch {
      setActionFeedback("Failed to dispute resolution.");
    } finally {
      setVerifyingAction(null);
    }
  };


  useEffect(() => {
    async function loadComplaint() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/complaints/${id}`);
        const data = await res.json();
        if (data.success) {
          setComplaint(data.complaint);
          setAuditLogs(data.auditLogs || []);
          setUpvotes(data.complaint.upvotes || 0);
        } else {
          setError(data.error || "Grievance record not found.");
        }
      } catch (err) {
        console.error("Load error:", err);
        setError("Network error fetching grievance details.");
      } finally {
        setLoading(false);
      }
    }
    loadComplaint();
  }, [id]);

  const handleUpvote = async () => {
    if (hasUpvoted || !complaint) return;
    setHasUpvoted(true);
    setUpvotes((prev) => prev + 1);

    try {
      const res = await fetch(`/api/complaints/${complaint.id}/upvote`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.success) {
        setUpvotes(data.upvotes);
      }
    } catch (err) {
      console.warn("Upvote error:", err);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 border-4 border-[#1B4332] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-[#57534E]">Loading official grievance record...</p>
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="p-8 bg-white border border-[#E6E1D6] rounded-2xl shadow-warm">
          <AlertTriangle className="w-10 h-10 text-[#C85A32] mx-auto mb-3" />
          <h2 className="font-heading font-bold text-xl text-[#1C1917] mb-2">
            Record Not Found
          </h2>
          <p className="text-sm text-[#57534E] mb-6">
            {error || `Unable to locate municipal record for ID: ${id}`}
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1B4332] text-white text-sm font-medium hover:bg-[#2D6A4F] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Public Feed</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#1B4332] hover:text-[#2D6A4F] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Public Feed</span>
          </Link>

          <button
            onClick={copyLink}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E6E1D6] bg-white text-xs font-medium text-[#1C1917] hover:bg-[#F3EFE8] transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Link Copied</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-[#57534E]" />
                <span>Share Grievance</span>
              </>
            )}
          </button>
        </div>

        {/* Master Record Card */}
        <div className="bg-[#FFFFFF] border border-[#E6E1D6] rounded-2xl p-6 sm:p-8 shadow-warm">
          {/* Header Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-[#E6E1D6]">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-sm font-bold text-[#1B4332] bg-[#F3EFE8] px-2.5 py-1 rounded border border-[#E6E1D6]">
                  {complaint.id}
                </span>
                <span className="text-xs text-[#57534E]">
                  Filed {formatDate(complaint.createdAt)}
                </span>
              </div>
              <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#1C1917] leading-tight">
                {complaint.title}
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <PriorityBadge priority={complaint.priority} />
              <StatusBadge status={complaint.status} />
            </div>
          </div>

          {/* Stepper Lifecycle */}
          <div className="py-6 border-b border-[#E6E1D6]">
            <StatusStepper currentStatus={complaint.status} />
          </div>

          {/* Core Grievance Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6 border-b border-[#E6E1D6]">
            {/* Description */}
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#57534E] mb-2">
                  Citizen Problem Statement
                </h4>
                <p className="text-sm text-[#1C1917] leading-relaxed whitespace-pre-wrap">
                  {complaint.description}
                </p>
              </div>

              {/* Location details */}
              <div className="pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#57534E] mb-2">
                  Location & Geography
                </h4>
                <div className="flex items-start gap-2 text-sm text-[#1C1917]">
                  <MapPin className="w-4 h-4 text-[#C85A32] shrink-0 mt-0.5" />
                  <span>{complaint.location}</span>
                </div>
                {complaint.coordinates && (
                  <p className="font-mono text-xs text-[#57534E] mt-1 ml-6">
                    GPS Coordinates: {complaint.coordinates.lat}, {complaint.coordinates.lng}
                  </p>
                )}
              </div>
            </div>

            {/* Department & SLA details */}
            <div className="space-y-4 bg-[#FAF8F5] p-5 rounded-xl border border-[#E6E1D6]">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#57534E] mb-1">
                  Responsible Municipal Body
                </h4>
                <div className="flex items-center gap-2 text-sm font-semibold text-[#1B4332]">
                  <Building2 className="w-4 h-4" />
                  <span>{complaint.department}</span>
                </div>
                {complaint.assignedOfficer && (
                  <p className="text-xs text-[#57534E] mt-1 flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Officer: {complaint.assignedOfficer}</span>
                  </p>
                )}
              </div>

              <div className="pt-2 border-t border-[#E6E1D6]">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#57534E] mb-1">
                  SLA Target & Resolution Timer
                </h4>
                <SLAIndicator
                  priority={complaint.priority}
                  createdAt={complaint.createdAt}
                  slaDeadline={complaint.slaDeadline}
                  status={complaint.status}
                  resolvedAt={complaint.resolvedAt}
                  showProgress={true}
                />
                <p className="text-[11px] text-[#57534E] mt-1.5">
                  Target Deadline: {formatDate(complaint.slaDeadline)}
                </p>
              </div>

              {/* Upvote support bar */}
              <div className="pt-2 border-t border-[#E6E1D6] flex items-center justify-between">
                <span className="text-xs text-[#57534E]">
                  Community Endorsements:
                </span>
                <button
                  onClick={handleUpvote}
                  disabled={hasUpvoted}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    hasUpvoted
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      : "bg-white text-[#1C1917] hover:bg-[#F3EFE8] border border-[#E6E1D6]"
                  }`}
                >
                  <ThumbsUp className={`w-3.5 h-3.5 ${hasUpvoted ? "text-emerald-700" : "text-[#57534E]"}`} />
                  <span>{upvotes} Citizens Impacted</span>
                </button>
              </div>
            </div>
          </div>

          {/* Photograph Evidence if attached */}
          {complaint.imageUrl && (
            <div className="py-6 border-b border-[#E6E1D6]">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#57534E] mb-3">
                Submitted Photograph Evidence
              </h4>
              <div className="rounded-xl overflow-hidden border border-[#E6E1D6] max-w-lg bg-[#FAF8F5]">
                <img
                  src={complaint.imageUrl}
                  alt={complaint.title}
                  className="w-full h-auto max-h-96 object-cover"
                />
              </div>
            </div>
          )}

          {/* AI Municipal Triage Card */}
          <div className="py-6 border-b border-[#E6E1D6]">
            <div className="bg-[#FAF8F5] rounded-xl p-5 border border-[#E6E1D6] space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#C85A32]" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#1C1917]">
                    Gemini 3.8 Flash Civic Triage Intelligence
                  </h4>
                </div>
                <span className="text-xs font-semibold text-[#1B4332]">
                  {Math.round(complaint.aiConfidence * 100)}% Confidence
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#1C1917] leading-relaxed">
                {complaint.aiSummary}
              </p>
              {complaint.aiReasoning && (
                <p className="text-xs text-[#57534E] italic pt-1 border-t border-[#E6E1D6]">
                  Triage Justification: {complaint.aiReasoning}
                </p>
              )}
            </div>
          </div>

          {/* Resolution Evidence Display if available */}
          {complaint.resolutionEvidence && (
            <div className="py-6 border-b border-[#E6E1D6] bg-emerald-50/50 -mx-6 sm:-mx-8 px-6 sm:px-8">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                <h4 className="font-heading font-bold text-base text-emerald-950">
                  Municipal Field Repair Verification Evidence
                </h4>
              </div>
              <p className="text-xs text-emerald-900 mb-4">
                Field engineers submitted completed repair documentation on{" "}
                {complaint.resolutionEvidence.verifiedAt
                  ? formatDate(complaint.resolutionEvidence.verifiedAt)
                  : "recently"}
                .
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                {complaint.resolutionEvidence.afterImageUrl && (
                  <div>
                    <span className="text-xs font-semibold text-emerald-950 block mb-1">
                      After-Repair Photograph
                    </span>
                    <img
                      src={complaint.resolutionEvidence.afterImageUrl}
                      alt="After repair"
                      className="w-full h-48 object-cover rounded-xl border border-emerald-200"
                    />
                  </div>
                )}
                <div className="space-y-3">
                  <div className="p-3 bg-white rounded-xl border border-emerald-200 text-xs text-emerald-900">
                    <span className="font-semibold block mb-0.5">Official Notes:</span>
                    <p>{complaint.resolutionEvidence.officialNotes}</p>
                  </div>
                  {complaint.resolutionEvidence.aiVerdict && (
                    <div className="p-3 bg-white rounded-xl border border-emerald-200 text-xs">
                      <span className="font-semibold text-emerald-950 block mb-0.5">
                        AI Visual Verification Verdict:
                      </span>
                      <span className="inline-block px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold mb-1">
                        {complaint.resolutionEvidence.aiVerdict} ({Math.round((complaint.resolutionEvidence.aiConfidence || 0.9) * 100)}%)
                      </span>
                      <p className="text-stone-600 text-[11px]">
                        {complaint.resolutionEvidence.aiReasoning}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Citizen Confirmation Action Bar when status is Awaiting Verification */}
              {complaint.status === "Awaiting Verification" && (
                <div className="mt-4 pt-4 border-t border-emerald-200/60">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                      <span className="text-xs font-bold text-emerald-950 block">
                        Citizen Community Audit Required
                      </span>
                      <span className="text-[11px] text-emerald-800">
                        Does the above photograph and work note represent a genuine fix for this issue?
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleCitizenConfirm}
                        disabled={verifyingAction !== null}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1B4332] hover:bg-[#2D6A4F] text-white text-xs font-semibold shadow-xs transition-colors"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Confirm Resolved</span>
                      </button>

                      <button
                        onClick={() => setShowDisputeInput(!showDisputeInput)}
                        disabled={verifyingAction !== null}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-100 hover:bg-red-200 text-red-800 text-xs font-semibold border border-red-200 transition-colors"
                      >
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Dispute / Reopen Issue</span>
                      </button>
                    </div>
                  </div>

                  {/* Dispute text area */}
                  {showDisputeInput && (
                    <form onSubmit={handleCitizenDispute} className="mt-3 p-3 bg-white rounded-xl border border-red-200 space-y-2">
                      <label className="block text-xs font-semibold text-red-950">
                        Explain why this resolution is incomplete or inaccurate:
                      </label>
                      <textarea
                        rows={2}
                        required
                        placeholder="e.g. The pothole was only filled with loose sand and washed out in rain..."
                        value={disputeReason}
                        onChange={(e) => setDisputeReason(e.target.value)}
                        className="w-full p-2 bg-[#FAF8F5] border border-stone-200 rounded-lg text-xs"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setShowDisputeInput(false)}
                          className="px-3 py-1.5 rounded-lg border border-stone-300 text-stone-600 text-xs"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={verifyingAction === "disputing" || disputeReason.trim().length < 5}
                          className="px-4 py-1.5 rounded-lg bg-red-700 hover:bg-red-800 text-white text-xs font-semibold disabled:opacity-50"
                        >
                          {verifyingAction === "disputing" ? "Submitting Dispute..." : "Submit Dispute & Reopen"}
                        </button>
                      </div>
                    </form>
                  )}

                  {actionFeedback && (
                    <div className="mt-3 p-2.5 rounded-lg bg-emerald-100 border border-emerald-300 text-xs text-emerald-950 font-medium">
                      {actionFeedback}
                    </div>
                  )}
                </div>
              )}

            </div>
          )}

          {/* Audit History Timeline */}
          <div className="pt-6">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#57534E] mb-4 flex items-center gap-2">
              <History className="w-4 h-4 text-[#1B4332]" />
              <span>Immutable Public Audit Trail</span>
            </h4>

            <div className="space-y-3">
              {(complaint.history || []).map((entry, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 text-xs p-3 rounded-xl bg-[#FAF8F5] border border-[#E6E1D6]"
                >
                  <div className="w-2 h-2 rounded-full bg-[#1B4332] mt-1.5 shrink-0" />
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-[#1C1917]">
                        {entry.action}
                      </span>
                      <span className="text-[#57534E]">
                        {formatDate(entry.timestamp)}
                      </span>
                    </div>
                    <p className="text-[#57534E] mt-0.5">
                      Performed by: <span className="font-medium text-[#1C1917]">{entry.performedBy}</span>
                    </p>
                    {entry.details && (
                      <p className="text-[#57534E] italic mt-0.5">{entry.details}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
