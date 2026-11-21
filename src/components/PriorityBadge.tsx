import React from "react";
import { PriorityLevel } from "@/lib/types";
import { AlertCircle, AlertTriangle, ShieldCheck, Flame } from "lucide-react";

interface PriorityBadgeProps {
  priority: PriorityLevel;
  showIcon?: boolean;
  className?: string;
}

function PriorityBadgeComponent({
  priority,
  showIcon = true,
  className = "",
}: PriorityBadgeProps) {
  switch (priority) {
    case "Critical":
      return (
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-200 ${className}`}
        >
          {showIcon && <Flame className="w-3.5 h-3.5 text-red-700 animate-pulse" />}
          Critical Priority
        </span>
      );
    case "High":
      return (
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-800 border border-orange-200 ${className}`}
        >
          {showIcon && <AlertCircle className="w-3.5 h-3.5 text-orange-700" />}
          High Priority
        </span>
      );
    case "Medium":
      return (
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-200 ${className}`}
        >
          {showIcon && <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />}
          Medium Priority
        </span>
      );
    case "Low":
    default:
      return (
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 ${className}`}
        >
          {showIcon && <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />}
          Low Priority
        </span>
      );
  }
}

export const PriorityBadge = React.memo(PriorityBadgeComponent);
