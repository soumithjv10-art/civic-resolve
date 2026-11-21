import { DepartmentMetric } from "@/lib/types";
import { Building2, CheckCircle2, Clock, AlertTriangle, ShieldCheck, Sparkles, UserCheck } from "lucide-react";

interface DepartmentScorecardProps {
  metrics: DepartmentMetric[];
}

export function DepartmentScorecard({ metrics }: DepartmentScorecardProps) {
  return (
    <div className="bg-white border border-[#E6E1D6] rounded-2xl shadow-warm overflow-hidden">
      <div className="p-6 border-b border-[#E6E1D6] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F3EFE8] text-xs font-semibold text-[#1B4332] mb-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#C85A32]" />
            <span>Public Accountability Charter</span>
          </div>
          <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-[#1C1917]">
            Municipal Department Scorecards
          </h2>
          <p className="text-xs text-[#57534E]">
            Transparent audit distinguishing administrative sign-offs, AI visual verifications, and genuine citizen confirmations.
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#FAF8F5] border-b border-[#E6E1D6] text-[#57534E] font-semibold uppercase tracking-wider">
            <tr>
              <th className="px-5 py-3.5">Department</th>
              <th className="px-4 py-3.5 text-center">Assigned</th>
              <th className="px-4 py-3.5 text-center">Pending</th>
              <th className="px-4 py-3.5 text-center">SLA Overdue</th>
              <th className="px-4 py-3.5 text-center">Avg Turnaround</th>
              <th className="px-4 py-3.5 text-center">SLA Compliance</th>
              <th className="px-4 py-3.5 text-center bg-stone-50">Admin Resolved</th>
              <th className="px-4 py-3.5 text-center bg-emerald-50/50">AI-Verified</th>
              <th className="px-4 py-3.5 text-center bg-emerald-100/50">Citizen-Confirmed</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E6E1D6]">
            {metrics.map((m) => {
              const isHighCompliance = m.slaComplianceRate >= 80;
              const isModerateCompliance = m.slaComplianceRate >= 60;

              return (
                <tr key={m.departmentName} className="hover:bg-[#FAF8F5] transition-colors">
                  <td className="px-5 py-4 font-semibold text-[#1C1917] max-w-xs">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-[#1B4332] shrink-0" />
                      <span className="truncate">{m.departmentName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center font-bold text-[#1C1917]">
                    {m.totalAssigned}
                  </td>
                  <td className="px-4 py-4 text-center font-medium text-stone-600">
                    {m.pending}
                  </td>
                  <td className="px-4 py-4 text-center">
                    {m.overdue > 0 ? (
                      <span className="inline-flex items-center gap-1 font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-full">
                        <AlertTriangle className="w-3 h-3 text-red-600" />
                        {m.overdue}
                      </span>
                    ) : (
                      <span className="text-stone-400">0</span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-center font-mono text-[#57534E]">
                    {m.avgResolutionHours > 0 ? `${m.avgResolutionHours}h` : "—"}
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        isHighCompliance
                          ? "bg-emerald-100 text-emerald-800"
                          : isModerateCompliance
                          ? "bg-amber-100 text-amber-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {m.slaComplianceRate}%
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center bg-stone-50/50 font-medium text-stone-700">
                    {m.adminResolved}
                  </td>
                  <td className="px-4 py-4 text-center bg-emerald-50/30 font-semibold text-emerald-800">
                    <span className="inline-flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-[#C85A32]" />
                      {m.aiVerified}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center bg-emerald-100/30 font-bold text-emerald-950">
                    <span className="inline-flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5 text-emerald-700" />
                      {m.citizenConfirmed}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
