import { NextRequest, NextResponse } from "next/server";
import { getComplaintById, updateComplaintFields, getAuditLogsForComplaint } from "@/lib/firestore";
import { UpdateComplaintAdminSchema } from "@/lib/validation";
import { isCurrentAdminAuthenticated } from "@/lib/auth";

export async function GET(
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

    const auditLogs = await getAuditLogsForComplaint(id);

    return NextResponse.json({
      success: true,
      complaint,
      auditLogs,
    });
  } catch (error) {
    console.error("Error retrieving complaint:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load complaint details" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin authentication
    const isAuthenticated = await isCurrentAdminAuthenticated();
    if (!isAuthenticated) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin credentials required." },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const validated = UpdateComplaintAdminSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: validated.error.flatten() },
        { status: 400 }
      );
    }

    const updated = await updateComplaintFields(
      id,
      validated.data,
      "Municipal Administrator"
    );

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Complaint not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      complaint: updated,
    });
  } catch (error) {
    console.error("Error updating complaint:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update complaint" },
      { status: 500 }
    );
  }
}
