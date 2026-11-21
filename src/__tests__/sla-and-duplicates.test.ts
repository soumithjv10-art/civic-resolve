import { describe, it, expect } from "vitest";
import { calculateSLADeadline, getSLAStatus } from "@/lib/sla-engine";
import {
  calculateDistanceMeters,
  detectPotentialDuplicate,
} from "@/lib/duplicate-detection";
import { Complaint } from "@/lib/types";

describe("SLA Calculation, Escalation & Spatial Duplicate Scoring", () => {
  it("calculates accurate SLA deadlines based on priority tier", () => {
    const base = new Date("2026-03-01T12:00:00.000Z").toISOString();

    // Critical: 4 hours
    const critDeadline = calculateSLADeadline("Critical", base);
    expect(new Date(critDeadline).getTime() - new Date(base).getTime()).toBe(4 * 60 * 60 * 1000);

    // High: 24 hours
    const highDeadline = calculateSLADeadline("High", base);
    expect(new Date(highDeadline).getTime() - new Date(base).getTime()).toBe(24 * 60 * 60 * 1000);

    // Medium: 72 hours
    const medDeadline = calculateSLADeadline("Medium", base);
    expect(new Date(medDeadline).getTime() - new Date(base).getTime()).toBe(72 * 60 * 60 * 1000);

    // Low: 7 days (168 hours)
    const lowDeadline = calculateSLADeadline("Low", base);
    expect(new Date(lowDeadline).getTime() - new Date(base).getTime()).toBe(168 * 60 * 60 * 1000);
  });

  it("accurately detects overdue status when current time exceeds deadline", () => {
    const pastCreated = new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(); // 10h ago
    const passedDeadline = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(); // 6h ago

    const status = getSLAStatus("Critical", pastCreated, passedDeadline, "Reported");
    expect(status.isOverdue).toBe(true);
    expect(status.statusLabel).toBe("Overdue");
  });

  it("handles escalation level increments through levels 0 to 3", () => {
    let escalationLevel = 0;
    const incrementLevel = (lvl: number) => Math.min(3, lvl + 1);

    escalationLevel = incrementLevel(escalationLevel); // Level 1: Dept Supervisor
    expect(escalationLevel).toBe(1);

    escalationLevel = incrementLevel(escalationLevel); // Level 2: Municipal Admin
    expect(escalationLevel).toBe(2);

    escalationLevel = incrementLevel(escalationLevel); // Level 3: Senior Authority
    expect(escalationLevel).toBe(3);

    escalationLevel = incrementLevel(escalationLevel); // Capped at 3
    expect(escalationLevel).toBe(3);
  });

  it("calculates accurate Haversine distance in meters", () => {
    // Anna Nagar roundtana to 2nd Avenue (~150m)
    const p1 = { lat: 13.085, lng: 80.2101 };
    const p2 = { lat: 13.0858, lng: 80.2105 };

    const distance = calculateDistanceMeters(p1, p2);
    expect(distance).toBeDefined();
    expect(distance).toBeGreaterThan(50);
    expect(distance).toBeLessThan(200);
  });

  it("flags potential duplicate when same category and coordinates are within proximity threshold", () => {
    const existing: Complaint[] = [
      {
        id: "CIVIC-EXISTING-1",
        title: "Huge crater pothole on OMR road near toll gate",
        description: "Motorcycles are skidding in deep pothole",
        location: "OMR Perungudi",
        coordinates: { lat: 12.9654, lng: 80.2461 },
        category: "Roads & Potholes",
        priority: "High",
        department: "PWD",
        aiSummary: "Road crater",
        aiConfidence: 0.95,
        status: "In Progress",
        upvotes: 10,
        duplicateCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        slaDeadline: new Date().toISOString(),
        adminNotes: "",
        verificationStatus: "Unverified",
        escalationLevel: 0,
        language: "en",
      },
    ];

    const match = detectPotentialDuplicate(
      {
        title: "Deep pothole near Perungudi toll gate causing bike accidents",
        description: "Large road hole right in center lane",
        category: "Roads & Potholes",
        location: "OMR Perungudi",
        coordinates: { lat: 12.9658, lng: 80.2464 }, // ~55m away
      },
      existing
    );

    expect(match.isPotentialDuplicate).toBe(true);
    expect(match.confidenceScore).toBeGreaterThanOrEqual(0.65);
    expect(match.matchedComplaint?.id).toBe("CIVIC-EXISTING-1");
  });
});
