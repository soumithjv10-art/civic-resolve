import { INITIAL_SEED_COMPLAINTS } from "@/lib/seed-data";
import { saveComplaint } from "@/lib/firestore";
import { jsonSuccess, jsonError } from "@/lib/api-utils";

/**
 * POST /api/seed - Populates database with sample civic records if empty.
 * Executes writes in parallel via Promise.all for maximum I/O throughput.
 */
export async function POST() {
  try {
    await Promise.all(INITIAL_SEED_COMPLAINTS.map((item) => saveComplaint(item)));

    return jsonSuccess({
      message: `Successfully seeded ${INITIAL_SEED_COMPLAINTS.length} civic infrastructure complaints.`,
      count: INITIAL_SEED_COMPLAINTS.length,
    });
  } catch (error) {
    console.error("Seed error:", error);
    return jsonError("Failed to seed complaints", 500);
  }
}
