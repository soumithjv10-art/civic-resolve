"use client";

import { useState } from "react";
import { Complaint } from "@/lib/types";
import {
  Camera,
  X,
  Upload,
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  ShieldCheck,
} from "lucide-react";

interface ResolutionVerificationProps {
  complaint: Complaint;
  onSuccess: (updatedComplaint: Complaint) => void;
  onClose: () => void;
}

export function ResolutionVerification({
  complaint,
  onSuccess,
  onClose,
}: ResolutionVerificationProps) {
  const [officialNotes, setOfficialNotes] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [afterImageUrl, setAfterImageUrl] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verificationResult, setVerificationResult] = useState<{
    verification: string;
    confidence: number;
    reasoning: string;
    requiresHumanReview: boolean;
  } | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setError("Only JPEG, PNG, and WebP images are permitted.");
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setError("Image size exceeds 5MB limit.");
      return;
    }

    setError(null);
    setImageFile(file);

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setImagePreview(dataUrl);
      setAfterImageUrl(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!afterImageUrl) {
      setError("Please attach an after-repair photograph as completion evidence.");
      return;
    }
    if (officialNotes.trim().length < 5) {
      setError("Please enter detailed official notes regarding the field work performed.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/ai/verify-resolution", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          complaintId: complaint.id,
          afterImageUrl,
          officialNotes: officialNotes.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to submit resolution verification");
      }

      setVerificationResult(data.verification);
      onSuccess(data.complaint);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error processing verification";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-[#E6E1D6] max-w-2xl w-full p-6 sm:p-8 shadow-warm-lg space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-start pb-4 border-b border-[#E6E1D6]">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#F3EFE8] text-[11px] font-semibold text-[#1B4332] mb-1">
              <Sparkles className="w-3.5 h-3.5 text-[#C85A32]" />
              <span>AI Resolution Verification</span>
            </div>
            <h3 className="font-heading font-bold text-xl text-[#1C1917]">
              Submit Field Repair Documentation
            </h3>
            <p className="text-xs text-[#57534E]">
              Grievance: <span className="font-mono font-bold text-[#1B4332]">{complaint.id}</span> • {complaint.title}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 text-xs p-3 rounded-xl flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-700 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Verification Success View */}
        {verificationResult ? (
          <div className="space-y-4 py-2">
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-heading font-bold text-sm text-emerald-950">
                  AI Visual Verification Analyzed
                </h4>
                <p className="text-xs text-emerald-900 mt-0.5">
                  Gemini 3.8 Flash compared the before-and-after photographic evidence:
                </p>
                <div className="mt-2.5 flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded bg-white font-bold text-xs text-emerald-900 border border-emerald-300">
                    Verdict: {verificationResult.verification}
                  </span>
                  <span className="text-xs font-semibold text-emerald-800">
                    {Math.round(verificationResult.confidence * 100)}% Confidence
                  </span>
                </div>
                <p className="text-xs text-emerald-800 mt-2 italic bg-white/70 p-2 rounded border border-emerald-200/60">
                  {verificationResult.reasoning}
                </p>
              </div>
            </div>

            <p className="text-xs text-[#57534E] text-center">
              The grievance is now officially marked <strong>Awaiting Verification</strong>. The citizen has been notified to audit and confirm the fix.
            </p>

            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-[#1B4332] text-white font-semibold text-xs hover:bg-[#2D6A4F] transition-colors"
            >
              Done & Return to Work Orders
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmitVerification} className="space-y-5 text-xs">
            {/* Before and After Image Comparison View */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Before Photo */}
              <div className="space-y-1.5">
                <span className="font-bold text-[#57534E] uppercase tracking-wider block">
                  1. Original Before Photo
                </span>
                {complaint.imageUrl ? (
                  <div className="rounded-xl overflow-hidden border border-[#E6E1D6] h-40 bg-[#FAF8F5]">
                    <img
                      src={complaint.imageUrl}
                      alt="Before Repair"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-40 rounded-xl border border-dashed border-[#E6E1D6] flex flex-col items-center justify-center text-stone-400 bg-[#FAF8F5]">
                    <span className="text-xs">No photograph originally attached</span>
                  </div>
                )}
              </div>

              {/* After Photo Upload */}
              <div className="space-y-1.5">
                <span className="font-bold text-[#57534E] uppercase tracking-wider block">
                  2. Field Completion Photo <span className="text-[#C85A32]">*</span>
                </span>
                {imagePreview ? (
                  <div className="relative rounded-xl overflow-hidden border border-[#E6E1D6] h-40 bg-[#FAF8F5]">
                    <img
                      src={imagePreview}
                      alt="After Repair Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview(null);
                        setAfterImageUrl("");
                      }}
                      className="absolute top-2 right-2 p-1 bg-black/60 text-white rounded-full hover:bg-black"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label
                    htmlFor="after-photo"
                    className="h-40 border-2 border-dashed border-[#E6E1D6] hover:border-[#1B4332] rounded-xl flex flex-col items-center justify-center cursor-pointer bg-[#FAF8F5] hover:bg-[#F3EFE8] transition-all p-3 text-center"
                  >
                    <Camera className="w-6 h-6 text-[#1B4332] mb-1" />
                    <span className="font-semibold text-stone-800">Upload after-repair photo</span>
                    <span className="text-[10px] text-stone-500 mt-0.5">JPEG, PNG, WebP up to 5MB</span>
                    <input
                      id="after-photo"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleImageChange}
                      className="sr-only"
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Official Repair Notes */}
            <div>
              <label
                htmlFor="official-notes"
                className="block font-bold text-[#1C1917] uppercase tracking-wider mb-1"
              >
                Official Resolution Notes <span className="text-[#C85A32]">*</span>
              </label>
              <textarea
                id="official-notes"
                rows={3}
                required
                placeholder="Detail the materials used, patch specifications, field crew lead, and test inspection..."
                value={officialNotes}
                onChange={(e) => setOfficialNotes(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#E6E1D6] rounded-xl text-xs sm:text-sm text-[#1C1917] focus:outline-none focus:ring-2 focus:ring-[#1B4332]"
              />
            </div>

            <div className="pt-2 border-t border-[#E6E1D6] flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-[#E6E1D6] text-stone-600 font-semibold text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#1B4332] hover:bg-[#2D6A4F] disabled:bg-stone-300 text-white font-semibold text-xs shadow-sm transition-colors"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Analyzing with Gemini 3.8 Flash...</span>
                  </>
                ) : (
                  <>
                    <FileCheck className="w-3.5 h-3.5" />
                    <span>Verify & Submit to Citizen Audit</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
