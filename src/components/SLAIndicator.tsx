import { PriorityLevel, ComplaintStatus } from "@/lib/types";
import { getSLAStatus } from "@/lib/sla-engine";
import { formatTimeRemaining } from "@/lib/utils";
import { Clock, AlertTriangle, CheckCircle2 } from "lucide-react";

interface SLAIndicatorProps {
  priority: PriorityLevel;
  createdAt: string;
  slaDeadline: string;
  status: ComplaintStatus;
  resolvedAt?: string;
  showProgress?: boolean;
}

export function SLAIndicator({
  priority,
  createdAt,
  slaDeadline,
  status,
  resolvedAt,
  showProgress = false,
}: SLAIndicatorProps) {
  const sla = getSLAStatus(priority, createdAt, slaDeadline, status, resolvedAt);

  if (status === "Resolved") {
    const isSuccess = sla.statusLabel === "Resolved Within SLA";
    return (
      <div className="flex items-center gap-1.5 text-xs">
        <CheckCircle2
          className={`w-3.5 h-3.5 ${isSuccess ? "text-emerald-600" : "text-amber-600"}`}
        />
        <span className={isSuccess ? "text-emerald-700 font-medium" : "text-amber-700 font-medium"}>
          {isSuccess ? "Resolved within target SLA" : "Resolved after SLA window"}
        </span>
      </div>
    );
  }

  const isOverdue = sla.isOverdue;
  const isApproaching = sla.statusLabel === "Approaching Deadline";

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1.5 text-xs">
        {isOverdue ? (
          <AlertTriangle className="w-3.5 h-3.5 text-red-600 animate-pulse" />
        ) : (
          <Clock className="w-3.5 h-3.5 text-[#57534E]" />
        )}

        <span
          className={`font-medium ${
            isOverdue
              ? "text-red-700 font-semibold"
              : isApproaching
              ? "text-amber-700 font-semibold"
              : "text-[#57534E]"
          }`}
        >
          {isOverdue
            ? `SLA Breach (${formatTimeRemaining(sla.remainingMs)})`
            : `${formatTimeRemaining(sla.remainingMs)}`}
        </span>
        <span className="text-stone-400">•</span>
        <span className="text-[11px] text-[#57534E]">
          Target: {sla.targetHours}h
        </span>
      </div>

      {showProgress && (
        <div className="w-full bg-[#E6E1D6] rounded-full h-1.5 overflow-hidden">
          <div
            className={`h-full transition-all rounded-full ${
              isOverdue
                ? "bg-red-600"
                : isApproaching
                ? "bg-amber-500"
                : "bg-[#1B4332]"
            }`}
            style={{ width: `${sla.progressPercent}%` }}
          />
        </div>
      )}
    </div>
  );
}
