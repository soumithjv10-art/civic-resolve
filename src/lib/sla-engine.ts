import { PriorityLevel, ComplaintStatus } from "./types";
import { SLA_TARGETS } from "./constants";

export interface SLACalculationResult {
  deadline: string; // ISO string
  isOverdue: boolean;
  remainingMs: number;
  remainingHours: number;
  statusLabel: "On Track" | "Approaching Deadline" | "Overdue" | "Resolved Within SLA" | "Resolved Breach";
  targetHours: number;
  progressPercent: number; // 0 to 100% of allowed time consumed
}

/**
 * Calculates the SLA deadline given priority and creation timestamp.
 */
export function calculateSLADeadline(
  priority: PriorityLevel,
  createdAt: string = new Date().toISOString()
): string {
  const targetHours = SLA_TARGETS[priority]?.targetHours ?? 72;
  const createdDate = new Date(createdAt);
  const deadlineDate = new Date(createdDate.getTime() + targetHours * 60 * 60 * 1000);
  return deadlineDate.toISOString();
}

/**
 * Assesses SLA status for a complaint.
 */
export function getSLAStatus(
  priority: PriorityLevel,
  createdAt: string,
  slaDeadline: string,
  currentStatus: ComplaintStatus,
  resolvedAt?: string
): SLACalculationResult {
  const now = new Date().getTime();
  const createdTime = new Date(createdAt).getTime();
  const deadlineTime = new Date(slaDeadline).getTime();
  const totalWindowMs = Math.max(1, deadlineTime - createdTime);
  const targetHours = SLA_TARGETS[priority]?.targetHours ?? 72;
  const warningMs = (SLA_TARGETS[priority]?.warningHours ?? 24) * 60 * 60 * 1000;

  if (currentStatus === "Resolved") {
    const resolveTime = resolvedAt ? new Date(resolvedAt).getTime() : now;
    const isCompliant = resolveTime <= deadlineTime;
    return {
      deadline: slaDeadline,
      isOverdue: !isCompliant,
      remainingMs: Math.max(0, deadlineTime - resolveTime),
      remainingHours: Math.round((deadlineTime - resolveTime) / (1000 * 60 * 60)),
      statusLabel: isCompliant ? "Resolved Within SLA" : "Resolved Breach",
      targetHours,
      progressPercent: Math.min(100, Math.round(((resolveTime - createdTime) / totalWindowMs) * 100)),
    };
  }

  const remainingMs = deadlineTime - now;
  const remainingHours = Math.round(remainingMs / (1000 * 60 * 60));
  const isOverdue = remainingMs < 0;
  const elapsedMs = now - createdTime;
  const progressPercent = Math.min(150, Math.max(0, Math.round((elapsedMs / totalWindowMs) * 100)));

  let statusLabel: SLACalculationResult["statusLabel"] = "On Track";
  if (isOverdue) {
    statusLabel = "Overdue";
  } else if (remainingMs <= warningMs) {
    statusLabel = "Approaching Deadline";
  }

  return {
    deadline: slaDeadline,
    isOverdue,
    remainingMs,
    remainingHours,
    statusLabel,
    targetHours,
    progressPercent: Math.min(100, progressPercent),
  };
}
