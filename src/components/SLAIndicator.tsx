import React from "react";
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

function SLAIndicatorComponent({
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
          className={`font-semibold ${
            isOverdue
              ? "text-red-700"
              : isApproaching
              ? "text-amber-700 font-bold"
              : "text-[#57534E]"
          }`}
        >
          {formatTimeRemaining(sla.remainingHours)}
        </span>

        {isOverdue && (
          <span className="px-1.5 py-0.2 rounded text-[10px] uppercase font-bold bg-red-100 text-red-800 tracking-wide">
            Overdue
          </span>
        )}
      </div>

      {showProgress && (
        <div className="w-full bg-[#E6E1D6] rounded-full h-1.5 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
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

export const SLAIndicator = React.memo(SLAIndicatorComponent);
