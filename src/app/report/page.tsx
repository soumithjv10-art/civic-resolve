"use client";

import { useState, useEffect } from "react";
import { COMPLAINT_CATEGORIES } from "@/lib/constants";
import { AIAnalysisReceipt, AIReceiptData } from "@/components/AIAnalysisReceipt";
import { VoiceRecorder } from "@/components/VoiceRecorder";
import { VoiceTranscribeResult } from "@/lib/types";
import { useLanguage } from "@/context/LanguageContext";
import {
  MapPin,
  Camera,
  X,
  Sparkles,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Mic,
  ShieldCheck,
} from "lucide-react";

interface FormState {
  title: string;
  location: string;
  userCategory: string;
  language: string;
  originalLanguageText?: string;
  coordinates?: { lat: number; lng: number };
}

export default function ReportPage() {
  const { language: currentLang, t } = useLanguage();

  const [form, setForm] = useState<FormState>({
    title: "",
    location: "",
    userCategory: "",
    language: currentLang || "en",
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<"image/jpeg" | "image/png" | "image/webp" | null>(null);

  const [geoLoading, setGeoLoading] = useState(false);
  const [geoStatus, setGeoStatus] = useState<string | null>(null);

  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [voiceDraftNotice, setVoiceDraftNotice] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [submitStage, setSubmitStage] = useState<string>("");
  const [formError, setFormError] = useState<string | null>(null);
  const [triageReceipt, setTriageReceipt] = useState<AIReceiptData | null>(null);

  // Auto-fetch location on component mount
  useEffect(() => {
    handleGetLocation();
  }, []);

  // Sync language selection
  useEffect(() => {
    setForm((prev) => ({ ...prev, language: currentLang }));
  }, [currentLang]);

  // Geolocation & Auto Reverse Geocoding
  const handleGetLocation = () => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setGeoStatus("Geolocation is not supported by your browser.");
      return;
    }

    setGeoLoading(true);
    setGeoStatus(t.detectingLocation);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const coords = {
          lat: parseFloat(pos.coords.latitude.toFixed(6)),
          lng: parseFloat(pos.coords.longitude.toFixed(6)),
        };

        let locationName = `GPS: ${coords.lat}, ${coords.lng}`;

        try {
          // Reverse geocode with OpenStreetMap Nominatim
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.lat}&lon=${coords.lng}&zoom=18&addressdetails=1`,
            { headers: { "Accept-Language": "en" } }
          );
          if (res.ok) {
            const data = await res.json();
            if (data.display_name) {
              const parts = data.display_name.split(", ");
              locationName = parts.slice(0, 4).join(", ");
            }
          }
        } catch {
          // Fall back to coordinate string
        }

        setForm((prev) => ({
          ...prev,
          coordinates: coords,
          location: prev.location && !prev.location.startsWith("GPS:") ? prev.location : locationName,
        }));
        setGeoLoading(false);
        setGeoStatus(`${t.locationDetected} (${coords.lat}, ${coords.lng})`);
      },
      (err) => {
        setGeoLoading(false);
        setGeoStatus(null);
        console.warn("Geolocation skipped or denied:", err.message);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Handle Voice Draft pre-filling
  const handleVoiceDraft = (draft: VoiceTranscribeResult) => {
    setForm((prev) => ({
      ...prev,
      title: draft.title || prev.title,
      userCategory: draft.category || prev.userCategory,
      language: draft.detectedLanguage === "ta" ? "ta" : "en",
      originalLanguageText: draft.detectedLanguage === "ta" ? draft.originalText : undefined,
    }));

    setVoiceDraftNotice(
      draft.detectedLanguage === "ta"
        ? "தமிழ் குரல் பதிவு பெறப்பட்டு தலைப்பு தானாக நிரப்பப்பட்டது (Tamil voice recorded)."
        : "Voice input recorded and filled into the grievance form."
    );
    setShowVoiceRecorder(false);
  };

  // Image upload handler
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/png", "image/webp"] as const;
    if (!validTypes.includes(file.type as "image/jpeg" | "image/png" | "image/webp")) {
      setFormError("Only JPEG, PNG, and WebP images are allowed.");
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setFormError(`File size exceeds 5 MB limit.`);
      return;
    }

    setFormError(null);
    setImageFile(file);
    setImageMimeType(file.type as "image/jpeg" | "image/png" | "image/webp");

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setImagePreview(result);
      const base64Data = result.split(",")[1];
      setImageBase64(base64Data);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setImageBase64(null);
    setImageMimeType(null);
  };

  // Form submit handler - Description is generated automatically by AI!
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (form.title.trim().length < 3) {
      setFormError("Please enter a clear defect title (at least 3 characters).");
      return;
    }
    if (form.location.trim().length < 2) {
      setFormError("Please provide the approximate location or allow GPS detection.");
      return;
    }

    setSubmitting(true);
    setSubmitStage(t.submittingText);

    try {
      const res = await fetch("/api/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title.trim(),
          location: form.location.trim(),
          coordinates: form.coordinates,
          userCategory: form.userCategory || undefined,
          language: form.language,
          originalLanguageText: form.originalLanguageText,
          imageBase64: imageBase64 || undefined,
          imageMimeType: imageMimeType || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to submit grievance.");
      }

      setTriageReceipt(data.triageReceipt as AIReceiptData);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An unexpected error occurred.";
      setFormError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setForm({
      title: "",
      location: "",
      userCategory: "",
      language: currentLang || "en",
    });
    removeImage();
    setGeoStatus(null);
    setVoiceDraftNotice(null);
    setTriageReceipt(null);
    handleGetLocation();
  };

  return (
    <div className="min-h-screen py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Render AI Triage Receipt upon successful submission */}
        {triageReceipt ? (
          <div className="space-y-6">
            <AIAnalysisReceipt receipt={triageReceipt} onReset={resetForm} />
          </div>
        ) : (
          <div className="bg-[#FFFFFF] border border-[#E6E1D6] rounded-2xl p-6 sm:p-10 shadow-warm">
            {/* Header */}
            <div className="mb-6 pb-6 border-b border-[#E6E1D6]">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F3EFE8] text-xs font-semibold text-[#1B4332] mb-2.5">
                <Sparkles className="w-3.5 h-3.5 text-[#C85A32]" />
                <span>AI Municipal Intake</span>
              </div>
              <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#1C1917] tracking-tight">
                {t.reportHeaderTitle}
              </h1>
              <p className="text-xs sm:text-sm text-[#57534E] mt-1.5 leading-relaxed">
                {t.reportHeaderSubtitle}
              </p>
            </div>

            {/* Voice Reporting Bar */}
            <div className="mb-6 bg-[#F3EFE8] border border-[#E6E1D6] rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#1B4332] text-white flex items-center justify-center shrink-0">
                  <Mic className="w-4 h-4 text-[#C85A32]" />
                </div>
                <div>
                  <span className="block text-xs font-bold text-[#1C1917]">
                    {t.voiceReportBtn}
                  </span>
                  <span className="text-[11px] text-[#57534E]">
                    Speak in Tamil or English to automatically draft your complaint
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowVoiceRecorder(!showVoiceRecorder)}
                className="px-3.5 py-1.5 rounded-lg bg-white border border-[#E6E1D6] text-xs font-semibold text-[#1B4332] hover:bg-[#FAF8F5] transition-colors shadow-xs"
              >
                {showVoiceRecorder ? "Hide Voice Recorder" : "Open Mic"}
              </button>
            </div>

            {/* Voice Recorder Dropdown Component */}
            {showVoiceRecorder && (
              <div className="mb-6">
                <VoiceRecorder onDraftGenerated={handleVoiceDraft} />
              </div>
            )}

            {/* Voice Draft Notice */}
            {voiceDraftNotice && (
              <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs p-3.5 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>{voiceDraftNotice}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setVoiceDraftNotice(null)}
                  className="text-emerald-700 hover:text-emerald-900 font-bold"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Error Banner */}
            {formError && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 text-sm text-red-800">
                <AlertCircle className="w-5 h-5 text-red-700 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-semibold">Please check:</strong>
                  <span>{formError}</span>
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Complaint Title */}
              <div>
                <label
                  htmlFor="title"
                  className="block text-xs font-bold uppercase tracking-wider text-[#1C1917] mb-1.5"
                >
                  {t.complaintTitleLabel}
                </label>
                <input
                  id="title"
                  type="text"
                  required
                  placeholder={t.complaintTitlePlaceholder}
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  maxLength={150}
                  className="w-full px-4 py-3 bg-[#FAF8F5] border border-[#E6E1D6] rounded-xl text-sm text-[#1C1917] placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#1B4332] focus:border-transparent transition-all"
                />
              </div>

              {/* Category (Optional) */}
              <div>
                <label
                  htmlFor="category"
                  className="block text-xs font-bold uppercase tracking-wider text-[#1C1917] mb-1.5"
                >
                  {t.categoryLabel}
                </label>
                <select
                  id="category"
                  value={form.userCategory}
                  onChange={(e) => setForm({ ...form, userCategory: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#FAF8F5] border border-[#E6E1D6] rounded-xl text-sm text-[#1C1917] focus:outline-none focus:ring-2 focus:ring-[#1B4332] transition-all"
                >
                  <option value="">{t.categoryAuto}</option>
                  {COMPLAINT_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Location with Auto-Detect */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="location"
                    className="block text-xs font-bold uppercase tracking-wider text-[#1C1917]"
                  >
                    {t.locationLabel}
                  </label>
                  <button
                    type="button"
                    onClick={handleGetLocation}
                    disabled={geoLoading}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1B4332] hover:text-[#2D6A4F] bg-[#F3EFE8] px-2.5 py-1 rounded-lg border border-[#E6E1D6] transition-colors"
                  >
                    {geoLoading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <MapPin className="w-3.5 h-3.5 text-[#C85A32]" />
                    )}
                    <span>{geoLoading ? t.detectingLocation : t.useMyLocation}</span>
                  </button>
                </div>

                <input
                  id="location"
                  type="text"
                  required
                  placeholder={t.locationPlaceholder}
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  maxLength={250}
                  className="w-full px-4 py-2.5 bg-[#FAF8F5] border border-[#E6E1D6] rounded-xl text-sm text-[#1C1917] placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#1B4332] focus:border-transparent transition-all"
                />
                {geoStatus && (
                  <p className="text-[11px] text-[#1B4332] font-medium mt-1.5 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{geoStatus}</span>
                  </p>
                )}
              </div>

              {/* AI Auto-Generated Description Notice Card (Replacing manual textarea) */}
              <div className="bg-[#F8F6F1] border border-[#E6E1D6] rounded-xl p-4 flex items-start gap-3 shadow-xs">
                <div className="w-8 h-8 rounded-lg bg-[#1B4332] flex items-center justify-center text-white shrink-0 mt-0.5">
                  <Sparkles className="w-4 h-4 text-[#C85A32]" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#1C1917]">
                    {t.aiAutoDescBadge}
                  </h4>
                  <p className="text-xs text-[#57534E] mt-0.5 leading-relaxed">
                    {t.aiAutoDescNotice}
                  </p>
                </div>
              </div>

              {/* Photograph Upload with Preview and Removal */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1C1917] mb-1.5">
                  {t.attachPhotoLabel}
                </label>

                {imagePreview ? (
                  <div className="relative rounded-xl border border-[#E6E1D6] p-2 bg-[#FAF8F5] flex items-center gap-4">
                    <img
                      src={imagePreview}
                      alt="Complaint Preview"
                      className="w-24 h-24 object-cover rounded-lg border border-[#E6E1D6]"
                    />
                    <div className="flex-1 text-xs space-y-1">
                      <p className="font-semibold text-[#1C1917] truncate max-w-xs">
                        {imageFile?.name}
                      </p>
                      <p className="text-[#57534E]">
                        Size: {((imageFile?.size || 0) / (1024 * 1024)).toFixed(2)} MB
                      </p>
                      <button
                        type="button"
                        onClick={removeImage}
                        className="inline-flex items-center gap-1 text-red-700 hover:text-red-900 font-semibold pt-1"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Remove image</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <label
                    htmlFor="image-upload"
                    className="border-2 border-dashed border-[#E6E1D6] hover:border-[#1B4332] rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer bg-[#FAF8F5] hover:bg-[#F3EFE8] transition-all group"
                  >
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#57534E] group-hover:text-[#1B4332] shadow-sm mb-2">
                      <Camera className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-semibold text-[#1C1917]">
                      {t.photoDropHint}
                    </span>
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 px-6 rounded-xl bg-[#C85A32] hover:bg-[#B04A26] text-white font-semibold text-sm transition-all shadow-warm hover:shadow-warm-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{submitStage || t.submittingText}</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>{t.submitGrievanceBtn}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
