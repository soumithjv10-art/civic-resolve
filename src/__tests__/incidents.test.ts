import { describe, it, expect } from "vitest";
import { linkComplaintsToIncident, getComplaintById, getAllIncidents } from "@/lib/firestore";

describe("Shared Incident Grouping", () => {
  it("links multiple duplicate complaints to a shared incident record", async () => {
    const primaryId = "CIVIC-2026-10492";
    const duplicateIds = ["CIVIC-2026-10488"];

    const incident = await linkComplaintsToIncident(
      primaryId,
      duplicateIds,
      "Co-located hazard reports"
    );

    expect(incident).not.toBeNull();
    expect(incident?.primaryComplaintId).toBe(primaryId);
    expect(incident?.relatedComplaintIds).toContain(primaryId);
    expect(incident?.relatedComplaintIds).toContain("CIVIC-2026-10488");

    // Verify primary complaint was updated with incidentId
    const primary = await getComplaintById(primaryId);
    expect(primary?.incidentId).toBe(incident?.incidentId);

    // Verify duplicate complaint was updated with duplicateOf
    const duplicate = await getComplaintById("CIVIC-2026-10488");
    expect(duplicate?.duplicateOf).toBe(primaryId);
    expect(duplicate?.incidentId).toBe(incident?.incidentId);
  });
});
