import { NextRequest, NextResponse } from "next/server";
import { CreateComplaintSchema } from "@/lib/validation";
import { getAllComplaints, saveComplaint } from "@/lib/firestore";
import { analyzeComplaintWithAI } from "@/lib/gemini";
import { detectPotentialDuplicate } from "@/lib/duplicate-detection";
import { calculateSLADeadline } from "@/lib/sla-engine";
import { uploadImageToStorage } from "@/lib/storage";
import { generateTrackingId } from "@/lib/utils";
import { Complaint } from "@/lib/types";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const priority = searchParams.get("priority");
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    let complaints = await getAllComplaints(Math.min(limit, 50));

    if (category && category !== "All") {
      complaints = complaints.filter((c) => c.category === category);
    }
    if (priority && priority !== "All") {
      complaints = complaints.filter((c) => c.priority === priority);
    }
    if (status && status !== "All") {
      complaints = complaints.filter((c) => c.status === status);
    }
    if (search) {
      const q = search.toLowerCase();
      complaints = complaints.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.location.toLowerCase().includes(q) ||
          c.id.toLowerCase().includes(q)
      );
    }

    return NextResponse.json({
      success: true,
      count: complaints.length,
      complaints,
    });
  } catch (error) {
    console.error("Error fetching complaints:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve complaints" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = CreateComplaintSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: validated.error.flatten(),
        },
        { status: 400 }
      );
    }

    const {
      title,
      description,
      location,
      coordinates,
      imageBase64,
      imageMimeType,
      userCategory,
      language,
      originalLanguageText,
    } = validated.data;

    // Handle Image Upload if Base64 was supplied
    let storedImageUrl = validated.data.imageUrl;
    if (imageBase64 && imageMimeType) {
      try {
        const buffer = Buffer.from(imageBase64, "base64");
        const uploadRes = await uploadImageToStorage(
          buffer,
          `complaint-${Date.now()}.${imageMimeType.split("/")[1]}`,
          imageMimeType
        );
        storedImageUrl = uploadRes.url;
      } catch (uploadErr) {
        console.warn("Image upload issue:", uploadErr);
      }
    }

    // Run AI Triage (Gemini 3.8 Flash with deterministic fallback)
    const aiAnalysis = await analyzeComplaintWithAI({
      title,
      description,
      location,
      userCategory,
      imageBase64,
      imageMimeType,
    });

    // Check for Potential Duplicate Incidents
    const existingComplaints = await getAllComplaints(100);
    const duplicateResult = detectPotentialDuplicate(
      {
        title,
        description,
        category: aiAnalysis.category,
        coordinates,
        location,
      },
      existingComplaints
    );

    const nowIso = new Date().toISOString();
    const trackingId = generateTrackingId();
    const slaDeadline = calculateSLADeadline(aiAnalysis.priority, nowIso);

    const newComplaint: Complaint = {
      id: trackingId,
      title,
      description,
      location,
      coordinates,
      imageUrl: storedImageUrl,
      userCategory,
      language: language || "en",
      originalLanguageText,
      category: aiAnalysis.category,
      priority: aiAnalysis.priority,
      department: aiAnalysis.department,
      aiSummary: aiAnalysis.aiSummary,
      aiConfidence: aiAnalysis.confidence,
      isFallback: aiAnalysis.isFallback,
      aiReasoning: aiAnalysis.reasoning,
      status: "Reported",
      upvotes: 0,
      duplicateCount: duplicateResult.isPotentialDuplicate ? 1 : 0,
      duplicateOf: duplicateResult.isPotentialDuplicate
        ? duplicateResult.matchedComplaint?.id
        : undefined,
      createdAt: nowIso,
      updatedAt: nowIso,
      slaDeadline,
      adminNotes: duplicateResult.isPotentialDuplicate
        ? `Flagged as potential duplicate of ${duplicateResult.matchedComplaint?.id} (${duplicateResult.reasons.join(", ")})`
        : "",
      verificationStatus: "Unverified",
      escalationLevel: 0,
      history: [
        {
          timestamp: nowIso,
          action: "Complaint lodged by citizen",
          performedBy: "Citizen",
          details: `Classified by ${aiAnalysis.isFallback ? "Deterministic Engine" : "Gemini AI"} as ${aiAnalysis.priority} priority`,
        },
      ],
    };

    await saveComplaint(newComplaint);

    return NextResponse.json({
      success: true,
      complaint: newComplaint,
      triageReceipt: {
        trackingId: newComplaint.id,
        category: newComplaint.category,
        priority: newComplaint.priority,
        department: newComplaint.department,
        aiSummary: newComplaint.aiSummary,
        aiReasoning: newComplaint.aiReasoning,
        isFallback: newComplaint.isFallback,
        slaDeadline: newComplaint.slaDeadline,
        potentialDuplicate: duplicateResult.isPotentialDuplicate
          ? {
              matchedId: duplicateResult.matchedComplaint?.id,
              confidence: duplicateResult.confidenceScore,
              reasons: duplicateResult.reasons,
            }
          : null,
      },
    });
  } catch (error) {
    console.error("Failed to create complaint:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error occurred while lodging complaint." },
      { status: 500 }
    );
  }
}
