import { NextRequest, NextResponse } from "next/server";
import { isCurrentAdminAuthenticated, verifyAdminSecret } from "@/lib/auth";
import { getAllComplaints, updateComplaintFields, recordEscalation } from "@/lib/firestore";
import { getSLAStatus } from "@/lib/sla-engine";
import { EscalationRecord } from "@/lib/types";
import { EscalateRequestSchema } from "@/lib/validation";

export async function POST(request: NextRequest) {
  try {
    // Check authentication via session cookie OR via Authorization bearer token (for Cloud Scheduler)
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
      return NextResponse.json(
        { success: false, error: "Unauthorized. Municipal admin credentials required." },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const validated = EscalateRequestSchema.safeParse(body);
    const { complaintId, reason, autoScanAllOverdue } = validated.success
      ? validated.data
      : { complaintId: undefined, reason: undefined, autoScanAllOverdue: true };

    const complaints = await getAllComplaints(100);
    const escalatedList: EscalationRecord[] = [];

    // If a specific complaintId is specified, escalate just that one
    if (complaintId) {
      const target = complaints.find((c) => c.id === complaintId);
      if (!target) {
        return NextResponse.json(
          { success: false, error: `Complaint ${complaintId} not found` },
          { status: 404 }
        );
      }

      const currentLevel = target.escalationLevel || 0;
      if (currentLevel >= 3) {
        return NextResponse.json({
          success: true,
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

      await recordEscalation(record);
      const updated = await updateComplaintFields(
        target.id,
        {
          escalationLevel: nextLevel,
          adminNotes: `${target.adminNotes ? target.adminNotes + "\n" : ""}[Escalated to Level ${nextLevel}] ${escalationReason}`,
        },
        "Automated SLA Escalation Engine"
      );

      return NextResponse.json({
        success: true,
        message: `Successfully escalated complaint ${complaintId} to Level ${nextLevel}`,
        escalation: record,
        complaint: updated,
      });
    }

    // Otherwise, scan all overdue open complaints
    for (const comp of complaints) {
      if (comp.status === "Resolved") continue;

      const sla = getSLAStatus(comp.priority, comp.createdAt, comp.slaDeadline, comp.status);
      const currentLevel = comp.escalationLevel || 0;

      if (sla.isOverdue && currentLevel < 3) {
        const nextLevel = currentLevel + 1;
        const autoReason = `SLA target breached by ${Math.abs(sla.remainingHours)} hours. Auto-escalated from Level ${currentLevel} to Level ${nextLevel}.`;

        const record: EscalationRecord = {
          id: `ESC-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
          complaintId: comp.id,
          previousLevel: currentLevel,
          newLevel: nextLevel,
          reason: autoReason,
          triggeredBy: "SLA Cloud Scheduler",
          timestamp: new Date().toISOString(),
        };

        await recordEscalation(record);
        await updateComplaintFields(
          comp.id,
          {
            escalationLevel: nextLevel,
            adminNotes: `${comp.adminNotes ? comp.adminNotes + "\n" : ""}[SLA Auto-Escalation Level ${nextLevel}] ${autoReason}`,
          },
          "SLA Cloud Scheduler"
        );

        escalatedList.push(record);
      }
    }

    return NextResponse.json({
      success: true,
      scannedCount: complaints.length,
      escalatedCount: escalatedList.length,
      escalations: escalatedList,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Escalation engine execution error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to execute SLA escalation routine." },
      { status: 500 }
    );
  }
}
