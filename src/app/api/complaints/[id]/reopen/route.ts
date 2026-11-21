import { NextRequest, NextResponse } from "next/server";
import { CitizenReopenSchema } from "@/lib/validation";
import { getComplaintById, updateComplaintFields } from "@/lib/firestore";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validated = CitizenReopenSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Please provide a valid dispute explanation",
          details: validated.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { reason } = validated.data;
    const complaint = await getComplaintById(id);

    if (!complaint) {
      return NextResponse.json(
        { success: false, error: "Complaint not found" },
        { status: 404 }
      );
    }

    const nextEscalation = Math.min(3, (complaint.escalationLevel || 0) + 1);
    const updatedEvidence = complaint.resolutionEvidence
      ? {
          ...complaint.resolutionEvidence,
          citizenConfirmation: "Disputed",
        }
      : undefined;

    const updated = await updateComplaintFields(
      id,
      {
        status: "Reopened",
        verificationStatus: "Disputed",
        escalationLevel: nextEscalation,
        resolutionEvidence: updatedEvidence,
        adminNotes: `${complaint.adminNotes ? complaint.adminNotes + "\n" : ""}[Citizen Disputed Resolution - Reopened to Level ${nextEscalation}] Reason: ${reason}`,
      },
      "Citizen Community Audit"
    );

    return NextResponse.json({
      success: true,
      message: "Grievance has been disputed and reopened for supervisor rework.",
      complaint: updated,
    });
  } catch (error) {
    console.error("Citizen reopen error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to dispute resolution." },
      { status: 500 }
    );
  }
}
