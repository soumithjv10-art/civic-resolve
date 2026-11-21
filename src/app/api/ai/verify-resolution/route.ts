import { NextRequest, NextResponse } from "next/server";
import { isCurrentAdminAuthenticated } from "@/lib/auth";
import { ResolutionSubmissionSchema } from "@/lib/validation";
import { getComplaintById, updateComplaintFields } from "@/lib/firestore";
import { verifyResolutionWithAI } from "@/lib/gemini";
import { ResolutionEvidence } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const isAuth = await isCurrentAdminAuthenticated();
    if (!isAuth) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin session required." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validated = ResolutionSubmissionSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid resolution submission parameters",
          details: validated.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { complaintId, afterImageUrl, officialNotes } = validated.data;
    const complaint = await getComplaintById(complaintId);

    if (!complaint) {
      return NextResponse.json(
        { success: false, error: "Complaint not found" },
        { status: 404 }
      );
    }

    // Call Gemini 3.8 Flash to evaluate before-and-after photographic evidence
    const aiVerification = await verifyResolutionWithAI({
      complaintTitle: complaint.title,
      category: complaint.category,
      beforeImageUrl: complaint.imageUrl,
      afterImageUrl,
      officialNotes,
    });

    const nowIso = new Date().toISOString();
    const evidence: ResolutionEvidence = {
      beforeImageUrl: complaint.imageUrl,
      afterImageUrl,
      verifiedAt: nowIso,
      aiVerdict: aiVerification.aiVerdict,
      aiConfidence: aiVerification.confidence,
      aiReasoning: aiVerification.reasoning,
      officialNotes,
      submittedBy: "Municipal Operations Supervisor",
    };

    // Important: Move to Awaiting Verification (never automatically mark Resolved based solely on AI output)
    const updated = await updateComplaintFields(
      complaintId,
      {
        status: "Awaiting Verification",
        verificationStatus: "Pending Citizen",
        resolutionEvidence: evidence,
        adminNotes: `${complaint.adminNotes ? complaint.adminNotes + "\n" : ""}[Repair Evidence Uploaded] AI Verdict: ${aiVerification.aiVerdict} (${Math.round(aiVerification.confidence * 100)}%). Moved to Awaiting Citizen Verification.`,
      },
      "Municipal Field Operations"
    );

    return NextResponse.json({
      success: true,
      message: "Repair evidence recorded. Status moved to Awaiting Verification.",
      complaint: updated,
      verification: {
        verification: aiVerification.verification,
        aiVerdict: aiVerification.aiVerdict,
        confidence: aiVerification.confidence,
        reasoning: aiVerification.reasoning,
        requiresHumanReview: aiVerification.requiresHumanReview,
        isFallback: aiVerification.isFallback,
        observedChanges: aiVerification.observedChanges,
      },
    });
  } catch (error) {
    console.error("Resolution verification error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process resolution verification." },
      { status: 500 }
    );
  }
}
