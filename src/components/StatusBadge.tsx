import { ComplaintStatus } from "@/lib/types";
import { Clock, Loader2, CheckCircle2, AlertOctagon, RotateCcw } from "lucide-react";

interface StatusBadgeProps {
  status: ComplaintStatus;
  showIcon?: boolean;
  className?: string;
}

export function StatusBadge({ status, showIcon = true, className = "" }: StatusBadgeProps) {
  switch (status) {
    case "Reported":
      return (
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#F3EFE8] text-[#57534E] border border-[#E6E1D6] ${className}`}
        >
          {showIcon && <Clock className="w-3.5 h-3.5 text-[#57534E]" />}
          Reported
        </span>
      );
    case "In Progress":
      return (
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-300 ${className}`}
        >
          {showIcon && <Loader2 className="w-3.5 h-3.5 text-amber-800 animate-spin" />}
          In Progress
        </span>
      );
    case "Awaiting Verification":
      return (
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FDF2EC] text-[#C85A32] border border-[#F2D4C7] ${className}`}
        >
          {showIcon && <AlertOctagon className="w-3.5 h-3.5 text-[#C85A32]" />}
          Awaiting Verification
        </span>
      );
    case "Resolved":
      return (
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-900 border border-emerald-300 ${className}`}
        >
          {showIcon && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-800" />}
          Resolved
        </span>
      );
    case "Reopened":
      return (
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-900 border border-red-300 ${className}`}
        >
          {showIcon && <RotateCcw className="w-3.5 h-3.5 text-red-800" />}
          Reopened
        </span>
      );
    default:
      return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs bg-stone-100 text-stone-700 ${className}`}>
          {status}
        </span>
      );
  }
}
