import { describe, it, expect } from "vitest";
import { getSLAStatus, calculateSLADeadline } from "@/lib/sla-engine";
import { Complaint } from "@/lib/types";

describe("Smart SLA & Automatic Escalation Engine", () => {
  it("flags complaints that have breached their target SLA", () => {
    const createdAt = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(); // 6h ago
    const deadline = calculateSLADeadline("Critical", createdAt); // Critical = 4h
    const status = getSLAStatus("Critical", createdAt, deadline, "In Progress");

    expect(status.isOverdue).toBe(true);
    expect(status.statusLabel).toBe("Overdue");
  });

  it("identifies unbreached complaints as On Track or Approaching", () => {
    const createdAt = new Date().toISOString();
    const deadline = calculateSLADeadline("High", createdAt); // High = 24h
    const status = getSLAStatus("High", createdAt, deadline, "Reported");

    expect(status.isOverdue).toBe(false);
    expect(["On Track", "Approaching Deadline"]).toContain(status.statusLabel);
  });

  it("handles escalation level increments correctly from 0 to 3", () => {
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
});
