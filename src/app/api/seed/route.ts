import { INITIAL_SEED_COMPLAINTS } from "@/lib/seed-data";
import { saveComplaintsBatch } from "@/lib/firestore";
import { jsonSuccess, jsonError } from "@/lib/api-utils";

/**
 * POST /api/seed - Populates database with sample civic records.
 * Uses atomic Firestore batch commit for single-roundtrip persistence.
 */
export async function POST() {
  try {
    await saveComplaintsBatch(INITIAL_SEED_COMPLAINTS);

    return jsonSuccess({
      message: `Successfully seeded ${INITIAL_SEED_COMPLAINTS.length} civic infrastructure complaints.`,
      count: INITIAL_SEED_COMPLAINTS.length,
    });
  } catch (error) {
    console.error("Seed error:", error);
    return jsonError("Failed to seed complaints", 500);
  }
}
