import { Complaint } from "@/lib/types";
import { getSLAStatus } from "@/lib/sla-engine";
import {
  FileText,
  Clock,
  Loader2,
  AlertOctagon,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";

interface StatsBarProps {
  complaints: Complaint[];
}

export function StatsBar({ complaints }: StatsBarProps) {
  const total = complaints.length;
  const reported = complaints.filter((c) => c.status === "Reported").length;
  const inProgress = complaints.filter((c) => c.status === "In Progress" || c.status === "Reopened").length;
  const awaitingVerification = complaints.filter((c) => c.status === "Awaiting Verification").length;
  const resolved = complaints.filter((c) => c.status === "Resolved").length;

  const overdue = complaints.filter((c) => {
    if (c.status === "Resolved") return false;
    const sla = getSLAStatus(c.priority, c.createdAt, c.slaDeadline, c.status);
    return sla.isOverdue;
  }).length;

  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

  const stats = [
    { label: "Total Lodged", value: total, icon: FileText, color: "text-[#1C1917]" },
    { label: "Reported", value: reported, icon: Clock, color: "text-[#57534E]" },
    { label: "In Progress", value: inProgress, icon: Loader2, color: "text-amber-700" },
    { label: "Awaiting Verification", value: awaitingVerification, icon: AlertOctagon, color: "text-[#C85A32]" },
    { label: "Verified Resolved", value: resolved, icon: CheckCircle2, color: "text-emerald-700" },
    { label: "SLA Overdue", value: overdue, icon: AlertTriangle, color: "text-red-700" },
  ];

  return (
    <div className="bg-[#FFFFFF] border border-[#E6E1D6] rounded-2xl p-5 sm:p-6 shadow-warm mb-8">
      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 divide-y sm:divide-y-0 sm:divide-x divide-[#E6E1D6]">
        {stats.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className={`pt-3 sm:pt-0 ${idx > 0 ? "sm:pl-4" : ""} flex flex-col justify-between`}
            >
              <div className="flex items-center gap-1.5 text-xs text-[#57534E] font-medium mb-1">
                <Icon className={`w-3.5 h-3.5 ${item.color}`} />
                <span className="truncate">{item.label}</span>
              </div>
              <div className={`font-heading text-2xl font-bold ${item.color}`}>
                {item.value}
              </div>
            </div>
          );
        })}
      </div>

      {/* Municipal Resolution Progress Bar */}
      <div className="mt-6 pt-5 border-t border-[#E6E1D6] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-[#1B4332]" />
          <span className="text-xs font-semibold text-[#1C1917]">
            Municipal Resolution Rate:
          </span>
          <span className="text-sm font-bold text-[#1B4332] font-mono">
            {resolutionRate}%
          </span>
          <span className="text-xs text-[#57534E]">
            ({resolved} of {total} grievances closed with citizen/official audit)
          </span>
        </div>

        <div className="w-full sm:w-64 bg-[#E6E1D6] rounded-full h-2 overflow-hidden">
          <div
            className="bg-[#1B4332] h-full rounded-full transition-all duration-500"
            style={{ width: `${resolutionRate}%` }}
          />
        </div>
      </div>
    </div>
  );
}
