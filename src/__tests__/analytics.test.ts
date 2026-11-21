import { describe, it, expect } from "vitest";
import { calculateCivicAnalytics } from "@/lib/analytics";
import { INITIAL_SEED_COMPLAINTS } from "@/lib/seed-data";

describe("Predictive Analytics & Scorecard Calculation", () => {
  it("computes accurate aggregates from complaints dataset", () => {
    const analytics = calculateCivicAnalytics(INITIAL_SEED_COMPLAINTS);

    expect(analytics.totalComplaints).toBe(INITIAL_SEED_COMPLAINTS.length);
    expect(analytics.resolvedComplaints).toBe(
      INITIAL_SEED_COMPLAINTS.filter((c) => c.status === "Resolved").length
    );
    expect(analytics.openComplaints).toBe(
      INITIAL_SEED_COMPLAINTS.filter((c) => c.status !== "Resolved").length
    );
    expect(analytics.overallResolutionRate).toBeGreaterThanOrEqual(0);
    expect(analytics.overallResolutionRate).toBeLessThanOrEqual(100);
  });

  it("calculates department metrics correctly", () => {
    const analytics = calculateCivicAnalytics(INITIAL_SEED_COMPLAINTS);

    expect(analytics.departmentMetrics.length).toBeGreaterThan(0);
    const pwd = analytics.departmentMetrics.find(
      (d) => d.departmentName === "Public Works Department (PWD)"
    );
    expect(pwd).toBeDefined();
    expect(pwd?.totalAssigned).toBeGreaterThanOrEqual(0);
  });

  it("generates data-backed predictive recommendations when patterns exist", () => {
    const analytics = calculateCivicAnalytics(INITIAL_SEED_COMPLAINTS);

    expect(Array.isArray(analytics.predictiveInsights)).toBe(true);
    // Road & electrical issues are present >= 2 times in seed data
    expect(analytics.predictiveInsights.length).toBeGreaterThanOrEqual(1);

    const firstInsight = analytics.predictiveInsights[0];
    expect(firstInsight.incidentCount).toBeGreaterThanOrEqual(2);
    expect(firstInsight.recommendation.length).toBeGreaterThan(10);
    expect(["Critical", "High", "Medium", "Elevated"]).toContain(firstInsight.riskLevel);
  });

  it("returns empty predictive insights when complaints count is below threshold", () => {
    const emptyAnalytics = calculateCivicAnalytics([]);
    expect(emptyAnalytics.predictiveInsights).toEqual([]);
    expect(emptyAnalytics.totalComplaints).toBe(0);
  });
});
