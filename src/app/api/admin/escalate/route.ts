import { NextRequest } from "next/server";
import { isCurrentAdminAuthenticated, verifyAdminSecret } from "@/lib/auth";
import { getAllComplaints, updateComplaintFields, recordEscalation } from "@/lib/firestore";
import { getSLAStatus } from "@/lib/sla-engine";
import { EscalationRecord } from "@/lib/types";
import { EscalateRequestSchema } from "@/lib/validation";
import { jsonSuccess, jsonError } from "@/lib/api-utils";

/**
 * POST /api/admin/escalate - SLA auto-escalation handler.
 * Parallelizes async escalation persistence using Promise.all.
 */
export async function POST(request: NextRequest) {
  try {
    const isSessionAuth = await isCurrentAdminAuthenticated();
    let isAuthorized = isSessionAuth;

    if (!isAuthorized) {
      const authHeader = request.headers.get("authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.substring(7);
        isAuthorized = verifyAdminSecret(token);
      }
    }

    if (!isAuthorized) {
      return jsonError("Unauthorized. Municipal admin credentials required.", 401);
    }

    const body = await request.json().catch(() => ({}));
    const validated = EscalateRequestSchema.safeParse(body);
    const { complaintId, reason } = validated.success
      ? validated.data
      : { complaintId: undefined, reason: undefined };

    const complaints = await getAllComplaints(100);

    // If a specific complaintId is specified, escalate just that one
    if (complaintId) {
      const target = complaints.find((c) => c.id === complaintId);
      if (!target) {
        return jsonError(`Complaint ${complaintId} not found`, 404);
      }

      const currentLevel = target.escalationLevel || 0;
      if (currentLevel >= 3) {
        return jsonSuccess({
          message: `Complaint ${complaintId} is already at maximum escalation level (Level 3: Senior Authority).`,
          complaint: target,
        });
      }

      const nextLevel = currentLevel + 1;
      const escalationReason =
        reason ||
        `Manual administrative escalation triggered. Target resolution window breached.`;

      const record: EscalationRecord = {
        id: `ESC-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
        complaintId: target.id,
        previousLevel: currentLevel,
        newLevel: nextLevel,
        reason: escalationReason,
        triggeredBy: "Municipal Administrator",
        timestamp: new Date().toISOString(),
      };

      await Promise.all([
        recordEscalation(record),
        updateComplaintFields(
          target.id,
          {
            escalationLevel: nextLevel,
            adminNotes: `${target.adminNotes ? target.adminNotes + "\n" : ""}[Escalated to Level ${nextLevel}] ${escalationReason}`,
          },
          "Automated SLA Escalation Engine"
        ),
      ]);

      return jsonSuccess({
        message: `Successfully escalated complaint ${complaintId} to Level ${nextLevel}`,
        escalation: record,
      });
    }

    // Otherwise, find all overdue open complaints and escalate in parallel
    const overdueCandidates = complaints.filter((comp) => {
      if (comp.status === "Resolved") return false;
      const sla = getSLAStatus(comp.priority, comp.createdAt, comp.slaDeadline, comp.status);
      const currentLevel = comp.escalationLevel || 0;
      return sla.isOverdue && currentLevel < 3;
    });

    const escalations: EscalationRecord[] = overdueCandidates.map((comp) => {
      const currentLevel = comp.escalationLevel || 0;
      const nextLevel = currentLevel + 1;
      const sla = getSLAStatus(comp.priority, comp.createdAt, comp.slaDeadline, comp.status);
      const autoReason = `SLA target breached by ${Math.abs(sla.remainingHours)} hours. Auto-escalated from Level ${currentLevel} to Level ${nextLevel}.`;

      return {
        id: `ESC-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
        complaintId: comp.id,
        previousLevel: currentLevel,
        newLevel: nextLevel,
        reason: autoReason,
        triggeredBy: "SLA Cloud Scheduler",
        timestamp: new Date().toISOString(),
      };
    });

    // Execute database updates concurrently
    await Promise.all(
      escalations.map((record) =>
        Promise.all([
          recordEscalation(record),
          updateComplaintFields(
            record.complaintId,
            {
              escalationLevel: record.newLevel,
              adminNotes: `[SLA Auto-Escalation Level ${record.newLevel}] ${record.reason}`,
            },
            "SLA Cloud Scheduler"
          ),
        ])
      )
    );

    return jsonSuccess({
      scannedCount: complaints.length,
      escalatedCount: escalations.length,
      escalations,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Escalation engine execution error:", error);
    return jsonError("Failed to execute SLA escalation routine.", 500);
  }
}
