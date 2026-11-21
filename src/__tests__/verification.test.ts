import { describe, it, expect } from "vitest";
import { verifyResolutionWithAI } from "@/lib/gemini";
import { CitizenReopenSchema, ResolutionSubmissionSchema } from "@/lib/validation";

describe("Resolution Verification Engine", () => {
  it("validates resolution submission payload", () => {
    const valid = {
      complaintId: "CIVIC-2026-10492",
      afterImageUrl: "https://example.com/photo.jpg",
      officialNotes: "Snapped cable replaced with 33kV armored insulator cable.",
    };
    expect(ResolutionSubmissionSchema.safeParse(valid).success).toBe(true);
  });

  it("fails if official notes are too short", () => {
    const invalid = {
      complaintId: "CIVIC-2026-10492",
      afterImageUrl: "https://example.com/photo.jpg",
      officialNotes: "done",
    };
    expect(ResolutionSubmissionSchema.safeParse(invalid).success).toBe(false);
  });

  it("validates citizen dispute reopen schema", () => {
    const valid = {
      reason: "The pothole was only filled with sand and washed out in evening rain.",
    };
    expect(CitizenReopenSchema.safeParse(valid).success).toBe(true);

    const invalid = {
      reason: "no",
    };
    expect(CitizenReopenSchema.safeParse(invalid).success).toBe(false);
  });

  it("runs AI resolution verification with deterministic fallback", async () => {
    const result = await verifyResolutionWithAI({
      complaintTitle: "Snapped electrical cable",
      category: "Streetlights & Electrical",
      afterImageUrl: "https://example.com/after.jpg",
      officialNotes: "Fixed and tested with multimeter.",
    });

    expect(result).toBeDefined();
    expect(["Likely Resolved", "Possibly Incomplete", "Unable to Verify", "Requires Manual Review"]).toContain(
      result.aiVerdict
    );
    expect(result.confidence).toBeGreaterThan(0);
    expect(result.reasoning.length).toBeGreaterThan(5);
  });
});
