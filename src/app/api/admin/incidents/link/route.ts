import { NextRequest, NextResponse } from "next/server";
import { isCurrentAdminAuthenticated } from "@/lib/auth";
import { LinkIncidentSchema } from "@/lib/validation";
import { linkComplaintsToIncident } from "@/lib/firestore";

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
    const validated = LinkIncidentSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid incident linking request",
          details: validated.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { primaryComplaintId, duplicateComplaintIds, notes } = validated.data;
    const incident = await linkComplaintsToIncident(
      primaryComplaintId,
      duplicateComplaintIds,
      notes
    );

    if (!incident) {
      return NextResponse.json(
        { success: false, error: "Primary complaint not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Successfully linked ${duplicateComplaintIds.length} complaints to incident ${incident.incidentId}`,
      incident,
    });
  } catch (error) {
    console.error("Link incident error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to link complaints to incident." },
      { status: 500 }
    );
  }
}
