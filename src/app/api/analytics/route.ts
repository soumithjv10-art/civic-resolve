import { getAllComplaints } from "@/lib/firestore";
import { calculateCivicAnalytics } from "@/lib/analytics";
import { jsonSuccess, jsonError, CACHE_HEADERS } from "@/lib/api-utils";

/**
 * GET /api/analytics - Computes real-time municipal analytics and scorecards.
 * Returns HTTP 200 with public cache headers to maximize edge efficiency.
 */
export async function GET() {
  try {
    const complaints = await getAllComplaints(200);
    const analytics = calculateCivicAnalytics(complaints);

    return jsonSuccess(
      {
        analytics,
        updatedAt: new Date().toISOString(),
      },
      200,
      CACHE_HEADERS
    );
  } catch (error) {
    console.error("Analytics computation error:", error);
    return jsonError("Failed to compute civic analytics.", 500);
  }
}
