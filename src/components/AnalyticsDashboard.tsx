import { AnalyticsData, PredictiveRecommendation } from "@/lib/types";
import {
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  Sparkles,
  BarChart2,
  PieChart,
  ShieldAlert,
  Flame,
  ArrowRight,
} from "lucide-react";

interface AnalyticsDashboardProps {
  data: AnalyticsData;
}

export function AnalyticsDashboard({ data }: AnalyticsDashboardProps) {
  // Category breakdown entries
  const categoryEntries = Object.entries(data.categoryDistribution).sort(
    ([, a], [, b]) => b - a
  );
  const maxCategoryCount = Math.max(1, ...Object.values(data.categoryDistribution));

  // Priority breakdown entries
  const priorityEntries = Object.entries(data.priorityDistribution);
  const maxPriorityCount = Math.max(1, ...Object.values(data.priorityDistribution));

  return (
    <div className="space-y-8">
      {/* Visual Chart Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution Chart */}
        <div className="bg-white border border-[#E6E1D6] rounded-2xl p-6 shadow-warm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E6E1D6]">
            <div className="flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-[#1B4332]" />
              <h3 className="font-heading font-bold text-base text-[#1C1917]">
                Grievance Volume by Category
              </h3>
            </div>
            <span className="text-xs text-[#57534E]">
              {data.totalComplaints} Total Cases
            </span>
          </div>

          <div className="space-y-3 pt-1">
            {categoryEntries.map(([category, count]) => {
              const percent = Math.round((count / data.totalComplaints) * 100);
              const barWidth = Math.round((count / maxCategoryCount) * 100);

              return (
                <div key={category} className="space-y-1 text-xs">
                  <div className="flex justify-between items-center text-[#57534E]">
                    <span className="font-semibold text-[#1C1917] truncate max-w-[200px]">
                      {category}
                    </span>
                    <span>
                      {count} reports ({percent}%)
                    </span>
                  </div>
                  <div className="w-full bg-[#F3EFE8] rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-[#1B4332] h-full rounded-full transition-all duration-500"
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Priority Breakdown Chart */}
        <div className="bg-white border border-[#E6E1D6] rounded-2xl p-6 shadow-warm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E6E1D6]">
            <div className="flex items-center gap-2">
              <PieChart className="w-4 h-4 text-[#C85A32]" />
              <h3 className="font-heading font-bold text-base text-[#1C1917]">
                Severity & Urgency Breakdown
              </h3>
            </div>
            <span className="text-xs text-[#57534E]">
              SLA Compliance: {data.slaComplianceRate}%
            </span>
          </div>

          <div className="space-y-3 pt-1">
            {priorityEntries.map(([priority, count]) => {
              const percent = Math.round((count / data.totalComplaints) * 100);
              const barWidth = Math.round((count / maxPriorityCount) * 100);

              let barColor = "bg-emerald-600";
              let textColor = "text-emerald-800";
              if (priority === "Critical") {
                barColor = "bg-red-600";
                textColor = "text-red-800 font-bold";
              } else if (priority === "High") {
                barColor = "bg-orange-500";
                textColor = "text-orange-800 font-semibold";
              } else if (priority === "Medium") {
                barColor = "bg-amber-500";
                textColor = "text-amber-800";
              }

              return (
                <div key={priority} className="space-y-1 text-xs">
                  <div className="flex justify-between items-center">
                    <span className={`font-semibold ${textColor}`}>
                      {priority} Priority
                    </span>
                    <span className="text-[#57534E]">
                      {count} cases ({percent}%)
                    </span>
                  </div>
                  <div className="w-full bg-[#F3EFE8] rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`${barColor} h-full rounded-full transition-all duration-500`}
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Predictive Civic Recommendations */}
      <div className="bg-white border border-[#E6E1D6] rounded-2xl p-6 sm:p-8 shadow-warm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-4 border-b border-[#E6E1D6]">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F3EFE8] text-xs font-semibold text-[#1B4332] mb-1">
              <Sparkles className="w-3.5 h-3.5 text-[#C85A32]" />
              <span>Predictive Infrastructure Insights</span>
            </div>
            <h3 className="font-heading font-extrabold text-xl text-[#1C1917]">
              Data-Backed Municipal Preventative Recommendations
            </h3>
            <p className="text-xs text-[#57534E]">
              Forecasted structural risks based on recurring complaint density. Strictly labeled as predictions derived from recorded cases.
            </p>
          </div>
        </div>

        {data.predictiveInsights.length === 0 ? (
          <div className="py-12 px-4 text-center rounded-xl border border-dashed border-[#E6E1D6] bg-[#FAF8F5]">
            <Lightbulb className="w-8 h-8 text-stone-400 mx-auto mb-2" />
            <h4 className="font-heading font-semibold text-sm text-[#1C1917]">
              Insufficient Data for Structural Predictions
            </h4>
            <p className="text-xs text-[#57534E] max-w-md mx-auto mt-1">
              Predictive risk models require at least two correlated reports in a specific locality or category. As more grievances are logged, predictive patterns will automatically populate here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
            {data.predictiveInsights.map((insight) => {
              const isCritical = insight.riskLevel === "Critical";
              const isHigh = insight.riskLevel === "High";

              return (
                <div
                  key={insight.id}
                  className="bg-[#FAF8F5] border border-[#E6E1D6] rounded-xl p-5 flex flex-col justify-between space-y-3 hover:border-[#1B4332] transition-colors"
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-mono text-[10px] font-bold text-[#1B4332] bg-white px-2 py-0.5 rounded border border-[#E6E1D6]">
                        {insight.id}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isCritical
                            ? "bg-red-100 text-red-800 border border-red-200"
                            : isHigh
                            ? "bg-orange-100 text-orange-800 border border-orange-200"
                            : "bg-amber-100 text-amber-800 border border-amber-200"
                        }`}
                      >
                        {insight.riskLevel} Risk
                      </span>
                    </div>

                    <h4 className="font-heading font-bold text-sm text-[#1C1917]">
                      {insight.locality}
                    </h4>

                    <p className="text-xs text-[#57534E] leading-relaxed">
                      {insight.recommendation}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-[#E6E1D6] text-xs space-y-1">
                    <span className="font-semibold text-[#1B4332] block">
                      Recommended Preventative Action:
                    </span>
                    <p className="text-[11px] text-stone-600 leading-snug">
                      {insight.preventativeAction}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
