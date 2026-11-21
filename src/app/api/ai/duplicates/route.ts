import { NextRequest, NextResponse } from "next/server";
import { DuplicateCheckSchema } from "@/lib/validation";
import { getAllComplaints } from "@/lib/firestore";
import { detectPotentialDuplicate } from "@/lib/duplicate-detection";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = DuplicateCheckSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid input parameters",
          details: validated.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { title, description, category, location, coordinates } = validated.data;
    const existingComplaints = await getAllComplaints(100);

    const result = detectPotentialDuplicate(
      {
        title,
        description,
        category: category || "Other",
        coordinates,
        location,
      },
      existingComplaints
    );

    return NextResponse.json({
      success: true,
      isPotentialDuplicate: result.isPotentialDuplicate,
      confidenceScore: result.confidenceScore,
      matchedComplaint: result.matchedComplaint
        ? {
            id: result.matchedComplaint.id,
            title: result.matchedComplaint.title,
            location: result.matchedComplaint.location,
            category: result.matchedComplaint.category,
            priority: result.matchedComplaint.priority,
            status: result.matchedComplaint.status,
            createdAt: result.matchedComplaint.createdAt,
            incidentId: result.matchedComplaint.incidentId,
          }
        : null,
      reasons: result.reasons,
    });
  } catch (error) {
    console.error("Duplicate detection error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to evaluate duplicate incidents." },
      { status: 500 }
    );
  }
}
