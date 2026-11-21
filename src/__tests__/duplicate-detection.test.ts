import { describe, it, expect } from "vitest";
import {
  calculateDistanceMeters,
  detectPotentialDuplicate,
} from "@/lib/duplicate-detection";
import { Complaint } from "@/lib/types";

describe("Duplicate Detection Engine", () => {
  it("calculates accurate geographic distance between coordinates", () => {
    // Anna Nagar roundtana (13.085, 80.2101) to a point ~100m away (13.0858, 80.2101)
    const dist = calculateDistanceMeters(
      { lat: 13.085, lng: 80.2101 },
      { lat: 13.0858, lng: 80.2101 }
    );

    expect(dist).toBeGreaterThan(50);
    expect(dist).toBeLessThan(150);
  });

  it("detects potential duplicate for nearby report with identical category and keywords", () => {
    const existing: Complaint[] = [
      {
        id: "CIVIC-2026-10001",
        title: "Deep pothole near Perungudi signal on OMR",
        description: "Large crater in the middle road causing traffic jam.",
        location: "OMR near Perungudi",
        category: "Roads & Potholes",
        priority: "High",
        department: "Public Works Department",
        aiSummary: "Pothole on highway",
        aiConfidence: 0.9,
        status: "Reported",
        upvotes: 0,
        duplicateCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        slaDeadline: new Date().toISOString(),
        adminNotes: "",
        verificationStatus: "Unverified",
        escalationLevel: 0,
        language: "en",
        coordinates: { lat: 12.9654, lng: 80.2461 },
      },
    ];

    const incoming = {
      title: "Dangerous pothole crater at Perungudi signal",
      description: "Cars and bikes swerving to avoid deep pothole on road.",
      category: "Roads & Potholes",
      location: "OMR Perungudi toll",
      coordinates: { lat: 12.9655, lng: 80.2462 }, // ~15m away
    };

    const match = detectPotentialDuplicate(incoming, existing);
    expect(match.isPotentialDuplicate).toBe(true);
    expect(match.matchedComplaint?.id).toBe("CIVIC-2026-10001");
    expect(match.confidenceScore).toBeGreaterThanOrEqual(0.6);
  });
});
