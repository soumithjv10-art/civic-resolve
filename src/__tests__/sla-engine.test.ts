import { describe, it, expect } from "vitest";
import { calculateSLADeadline, getSLAStatus } from "@/lib/sla-engine";

describe("SLA Management Engine", () => {
  it("calculates 4-hour deadline for Critical priority", () => {
    const baseDate = new Date("2026-05-10T10:00:00Z");
    const deadline = calculateSLADeadline("Critical", baseDate.toISOString());
    const expected = new Date("2026-05-10T14:00:00Z").toISOString();
    expect(deadline).toBe(expected);
  });

  it("calculates 24-hour deadline for High priority", () => {
    const baseDate = new Date("2026-05-10T10:00:00Z");
    const deadline = calculateSLADeadline("High", baseDate.toISOString());
    const expected = new Date("2026-05-11T10:00:00Z").toISOString();
    expect(deadline).toBe(expected);
  });

  it("calculates 72-hour deadline for Medium priority", () => {
    const baseDate = new Date("2026-05-10T10:00:00Z");
    const deadline = calculateSLADeadline("Medium", baseDate.toISOString());
    const expected = new Date("2026-05-13T10:00:00Z").toISOString();
    expect(deadline).toBe(expected);
  });

  it("calculates 7-day (168h) deadline for Low priority", () => {
    const baseDate = new Date("2026-05-10T10:00:00Z");
    const deadline = calculateSLADeadline("Low", baseDate.toISOString());
    const expected = new Date("2026-05-17T10:00:00Z").toISOString();
    expect(deadline).toBe(expected);
  });

  it("correctly flags overdue complaints", () => {
    const created = new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(); // 10h ago
    const deadline = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(); // 6h ago
    const status = getSLAStatus("Critical", created, deadline, "In Progress");

    expect(status.isOverdue).toBe(true);
    expect(status.statusLabel).toBe("Overdue");
  });

  it("marks complaint resolved within SLA appropriately", () => {
    const created = new Date("2026-01-01T10:00:00Z").toISOString();
    const deadline = new Date("2026-01-01T14:00:00Z").toISOString();
    const resolvedAt = new Date("2026-01-01T12:00:00Z").toISOString();

    const status = getSLAStatus("Critical", created, deadline, "Resolved", resolvedAt);
    expect(status.isOverdue).toBe(false);
    expect(status.statusLabel).toBe("Resolved Within SLA");
  });
});
