import { NextResponse } from "next/server";
import { INITIAL_SEED_COMPLAINTS } from "@/lib/seed-data";
import { saveComplaint } from "@/lib/firestore";

export async function POST() {
  try {
    for (const item of INITIAL_SEED_COMPLAINTS) {
      await saveComplaint(item);
    }

    return NextResponse.json({
      success: true,
      message: `Successfully seeded ${INITIAL_SEED_COMPLAINTS.length} sample civic complaints.`,
      count: INITIAL_SEED_COMPLAINTS.length,
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to seed complaints" },
      { status: 500 }
    );
  }
}
