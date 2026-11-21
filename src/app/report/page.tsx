"use client";

import { useState } from "react";
import { COMPLAINT_CATEGORIES } from "@/lib/constants";
import { AIAnalysisReceipt, AIReceiptData } from "@/components/AIAnalysisReceipt";
import { VoiceRecorder } from "@/components/VoiceRecorder";
import { VoiceTranscribeResult } from "@/lib/types";
import {
  MapPin,
  Camera,
  X,
  Sparkles,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Mic,
  Languages,
} from "lucide-react";

interface FormState {
  title: string;
  description: string;
  location: string;
  userCategory: string;
  language: string;
  originalLanguageText?: string;
  coordinates?: { lat: number; lng: number };
}

export default function ReportPage() {
  const [form, setForm] = useState<FormState>({
    title: "",
    description: "",
    location: "",
    userCategory: "",
    language: "en",
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

  // Geolocation handler
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setGeoStatus("Geolocation is not supported by your browser.");
      return;
    }

    setGeoLoading(true);
    setGeoStatus("Accessing GPS satellite coordinates...");

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          lat: parseFloat(pos.coords.latitude.toFixed(6)),
          lng: parseFloat(pos.coords.longitude.toFixed(6)),
        };
        setForm((prev) => ({
          ...prev,
          coordinates: coords,
          location: prev.location || `GPS: ${coords.lat}, ${coords.lng}`,
        }));
        setGeoLoading(false);
        setGeoStatus(`GPS pinpointed (Lat: ${coords.lat}, Lng: ${coords.lng})`);
      },
      (err) => {
        setGeoLoading(false);
        setGeoStatus("Location permission denied. Please enter address manually.");
        console.warn("Geolocation error:", err.message);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Handle Voice Draft pre-filling
  const handleVoiceDraft = (draft: VoiceTranscribeResult) => {
    setForm((prev) => ({
      ...prev,
      title: draft.title || prev.title,
      description: draft.translatedText
        ? `${draft.translatedText}\n\n[Original Transcript]: ${draft.originalText}`
        : draft.description || prev.description,
      userCategory: draft.category || prev.userCategory,
      language: draft.detectedLanguage === "ta" ? "ta" : "en",
      originalLanguageText: draft.detectedLanguage === "ta" ? draft.originalText : undefined,
    }));

    setVoiceDraftNotice(
      draft.detectedLanguage === "ta"
        ? "தமிழ் குரல் பதிவு வெற்றிகரமாக பெறப்பட்டு ஆங்கிலத்தில் மொழிபெயர்க்கப்பட்டுள்ளது (Tamil voice input processed & translated)."
        : "Voice input successfully structured into the complaint form."
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
      setFormError(`File size (${(file.size / (1024 * 1024)).toFixed(2)} MB) exceeds 5 MB limit.`);
      return;
    }

    setFormError(null);
    setImageFile(file);
    setImageMimeType(file.type as "image/jpeg" | "image/png" | "image/webp");

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setImagePreview(result);
      // Strip data:image/...;base64,
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

  // Form submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (form.title.trim().length < 5) {
      setFormError("Please enter a descriptive title (at least 5 characters).");
      return;
    }
    if (form.description.trim().length < 10) {
      setFormError("Please provide more problem details (at least 10 characters).");
      return;
    }
    if (form.location.trim().length < 3) {
      setFormError("Please provide the approximate location or street name.");
      return;
    }

    setSubmitting(true);
    setSubmitStage("Validating complaint & uploading photographic evidence...");

    try {
      setSubmitStage("Running Gemini 3.8 Flash municipal triage & duplicate analysis...");

      const res = await fetch("/api/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title.trim(),
          description: form.description.trim(),
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

      setSubmitStage("Generating official municipal receipt...");
      setTriageReceipt(data.triageReceipt as AIReceiptData);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An unexpected error occurred during submission.";
      setFormError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setForm({
      title: "",
      description: "",
      location: "",
      userCategory: "",
      language: "en",
    });
    removeImage();
    setGeoStatus(null);
    setVoiceDraftNotice(null);
    setTriageReceipt(null);
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Render AI Triage Receipt upon successful submission */}
        {triageReceipt ? (
          <div className="space-y-6">
            <AIAnalysisReceipt receipt={triageReceipt} onReset={resetForm} />
          </div>
        ) : (
          <div className="bg-[#FFFFFF] border border-[#E6E1D6] rounded-2xl p-6 sm:p-10 shadow-warm">
            {/* Header */}
            <div className="mb-8 pb-6 border-b border-[#E6E1D6] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F3EFE8] text-xs font-semibold text-[#1B4332] mb-3">
                  <Sparkles className="w-3.5 h-3.5 text-[#C85A32]" />
                  <span>AI Municipal Intake</span>
                </div>
                <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#1C1917] tracking-tight">
                  Report a Civic Grievance
                </h1>
                <p className="text-sm text-[#57534E] mt-1.5 leading-relaxed">
                  Submit problems directly to municipal authorities. Our Gemini 3.8 Flash engine analyzes severity, matches with active neighborhood work orders, and assigns binding resolution SLAs.
                </p>
              </div>

              {/* Toggle Voice Recorder Button */}
              <div>
                <button
                  type="button"
                  onClick={() => setShowVoiceRecorder(!showVoiceRecorder)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#C85A32] bg-[#FDF2EC] hover:bg-[#FBE4D8] text-[#C85A32] font-semibold text-xs transition-colors shadow-sm shrink-0"
                >
                  <Mic className="w-4 h-4 text-[#C85A32]" />
                  <span>{showVoiceRecorder ? "Hide Voice Option" : "Report by Voice (குரல் பதிவு)"}</span>
                </button>
              </div>
            </div>

            {/* Voice Recorder Panel */}
            {showVoiceRecorder && (
              <div className="mb-6">
                <VoiceRecorder onDraftGenerated={handleVoiceDraft} />
              </div>
            )}

            {/* Voice Draft Populated Notice */}
            {voiceDraftNotice && (
              <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs p-3.5 rounded-xl flex items-center justify-between gap-2">
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
                  <strong className="block font-semibold">Please correct the following:</strong>
                  <span>{formError}</span>
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Complaint Title */}
              <div>
                <label
                  htmlFor="title"
                  className="block text-xs font-bold uppercase tracking-wider text-[#1C1917] mb-1.5"
                >
                  Complaint Title <span className="text-[#C85A32]">*</span>
                </label>
                <input
                  id="title"
                  type="text"
                  required
                  placeholder="e.g. Hazardous exposed 440V cable dangling near Anna Nagar school"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  maxLength={150}
                  className="w-full px-4 py-2.5 bg-[#FAF8F5] border border-[#E6E1D6] rounded-xl text-sm text-[#1C1917] placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#1B4332] focus:border-transparent transition-all"
                />
                <div className="flex justify-between items-center text-[11px] text-[#57534E] mt-1">
                  <span>Summarize the defect clearly.</span>
                  <span>{form.title.length}/150</span>
                </div>
              </div>

              {/* Category (Optional) */}
              <div>
                <label
                  htmlFor="category"
                  className="block text-xs font-bold uppercase tracking-wider text-[#1C1917] mb-1.5"
                >
                  Category <span className="text-stone-400 font-normal">(Optional - AI will auto-categorize)</span>
                </label>
                <select
                  id="category"
                  value={form.userCategory}
                  onChange={(e) => setForm({ ...form, userCategory: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#FAF8F5] border border-[#E6E1D6] rounded-xl text-sm text-[#1C1917] focus:outline-none focus:ring-2 focus:ring-[#1B4332] transition-all"
                >
                  <option value="">Let AI categorize automatically</option>
                  {COMPLAINT_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Location with Geolocation Button */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="location"
                    className="block text-xs font-bold uppercase tracking-wider text-[#1C1917]"
                  >
                    Location / Landmark <span className="text-[#C85A32]">*</span>
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
                    <span>{geoLoading ? "Locating..." : "Use My Location"}</span>
                  </button>
                </div>

                <input
                  id="location"
                  type="text"
                  required
                  placeholder="e.g. 2nd Avenue, Opp. Canara Bank, Anna Nagar West"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  maxLength={250}
                  className="w-full px-4 py-2.5 bg-[#FAF8F5] border border-[#E6E1D6] rounded-xl text-sm text-[#1C1917] placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#1B4332] focus:border-transparent transition-all"
                />
                {geoStatus && (
                  <p className="text-[11px] text-[#1B4332] font-medium mt-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>{geoStatus}</span>
                  </p>
                )}
              </div>

              {/* Detailed Description */}
              <div>
                <label
                  htmlFor="description"
                  className="block text-xs font-bold uppercase tracking-wider text-[#1C1917] mb-1.5"
                >
                  Detailed Description <span className="text-[#C85A32]">*</span>
                </label>
                <textarea
                  id="description"
                  required
                  rows={4}
                  placeholder="Provide precise details: danger level, vehicle skidding, traffic obstruction, duration of the issue..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  maxLength={2500}
                  className="w-full px-4 py-2.5 bg-[#FAF8F5] border border-[#E6E1D6] rounded-xl text-sm text-[#1C1917] placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#1B4332] focus:border-transparent transition-all resize-y"
                />
                <div className="flex justify-between items-center text-[11px] text-[#57534E] mt-1">
                  <span>Be specific to help field engineers locate and resolve faster.</span>
                  <span>{form.description.length}/2500</span>
                </div>
              </div>

              {/* Photograph Upload with Preview and Removal */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1C1917] mb-1.5">
                  Attach Photograph Evidence <span className="text-stone-400 font-normal">(Optional, max 5MB)</span>
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
                      Click to upload a photograph or drag and drop
                    </span>
                    <span className="text-[11px] text-[#57534E] mt-0.5">
                      Accepts JPEG, PNG, or WebP up to 5 MB
                    </span>
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleImageChange}
                      className="sr-only"
                    />
                  </label>
                )}
              </div>

              {/* Submit CTA */}
              <div className="pt-4 border-t border-[#E6E1D6]">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#C85A32] hover:bg-[#B04A26] disabled:bg-stone-300 text-white font-semibold text-base transition-all shadow-warm hover:shadow-warm-md"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>{submitStage || "Processing Grievance..."}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      <span>Submit Grievance to Municipal Triage</span>
                    </>
                  )}
                </button>
                <p className="text-center text-[11px] text-[#57534E] mt-3">
                  Grievances are publicly audited. False submissions are subject to municipal verification rules.
                </p>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
