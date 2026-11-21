import { NextResponse } from "next/server";
import { getAllComplaints } from "@/lib/firestore";
import { calculateCivicAnalytics } from "@/lib/analytics";

export async function GET() {
  try {
    const complaints = await getAllComplaints(200);
    const analytics = calculateCivicAnalytics(complaints);

    return NextResponse.json({
      success: true,
      analytics,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Analytics computation error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to compute civic analytics." },
      { status: 500 }
    );
  }
}
