import { NextRequest, NextResponse } from "next/server";
import { getComplaintById, updateComplaintFields } from "@/lib/firestore";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const complaint = await getComplaintById(id);

    if (!complaint) {
      return NextResponse.json(
        { success: false, error: "Complaint not found" },
        { status: 404 }
      );
    }

    const nowIso = new Date().toISOString();
    const updatedEvidence = complaint.resolutionEvidence
      ? {
          ...complaint.resolutionEvidence,
          citizenConfirmation: "Confirmed",
        }
      : undefined;

    const updated = await updateComplaintFields(
      id,
      {
        status: "Resolved",
        verificationStatus: "Confirmed Resolved",
        resolvedAt: nowIso,
        resolutionEvidence: updatedEvidence,
        adminNotes: `${complaint.adminNotes ? complaint.adminNotes + "\n" : ""}[Citizen Confirmed Resolution] Community audit marked issue as genuinely fixed on ${new Date().toLocaleDateString("en-IN")}.`,
      },
      "Citizen Community Audit"
    );

    return NextResponse.json({
      success: true,
      message: "Grievance verified as resolved by citizen audit.",
      complaint: updated,
    });
  } catch (error) {
    console.error("Citizen verify error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to confirm resolution." },
      { status: 500 }
    );
  }
}
